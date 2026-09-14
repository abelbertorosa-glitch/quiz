import { afterEach, describe, expect, it, vi } from "vitest";
import type { Answers, Lead, ResponseRecord } from "@/lib/types";
import {
  RD_CONVERSIONS_URL,
  buildConversionPayload,
  cargoLabel,
  parseCidadeUf,
  syncToRdStation,
  toE164,
  withoutCustomFields,
} from "./rdstation";

const lead: Lead = {
  empresa: "Oficina Central",
  cnpj: "12.345.678/0001-90",
  anoFundacao: 2018,
  cidadeUf: "Belo Horizonte/MG",
  nome: "Ana Silva",
  cargo: "gestor",
  idade: 38,
  genero: "feminino",
  telefone: "(31) 98888-7777",
  email: "Ana@Oficina.com",
};

const answers = {
  p1_custoFixo: 30_000,
  p2_faturamento: 100_000,
  p3_markup: 100,
  p4_reserva: "2_meses_ou_mais",
  p5_antecipa: false,
  p6_mecanicos: 2,
  p7_comercializacao: "pecas_servicos",
  p8_horaMinima: 180,
  p9_elevadores: 3,
  p10_checklist: true,
  p11_produtividade: true,
  p12_processos: "seguidos",
  p13_donoGestorPatio: false,
  p14_sistema: "ultracar",
  p15_softwarePrecificacao: true,
  p16_canal: "google",
  p17_conversaoPosVenda: true,
  p18_recorrencia: true,
  p19_faturamentoDiario: true,
} satisfies Answers;

const record: ResponseRecord = {
  id: "ca00d8df-e515-437f-bdae-0d9f786190d5",
  createdAt: "2026-09-14T12:00:00.000Z",
  lead,
  answers,
  diagnosis: { metricas: {} as ResponseRecord["diagnosis"]["metricas"], findings: [] },
  utm: { source: "google", medium: "cpc", campaign: "feira", term: "oficina" },
};

describe("parseCidadeUf", () => {
  it("separa cidade e UF", () => {
    expect(parseCidadeUf("Belo Horizonte/MG")).toEqual({
      city: "Belo Horizonte",
      state: "MG",
    });
  });

  it("aceita só a cidade", () => {
    expect(parseCidadeUf("Palmas")).toEqual({ city: "Palmas" });
  });
});

describe("toE164", () => {
  it("monta +55 a partir do WhatsApp com DDD", () => {
    expect(toE164("(31) 98888-7777")).toBe("+5531988887777");
    expect(toE164("3132121234")).toBe("+553132121234");
  });

  it("não duplica o 55", () => {
    expect(toE164("5531988887777")).toBe("+5531988887777");
  });
});

describe("buildConversionPayload", () => {
  const prevBase = process.env.NEXT_PUBLIC_BASE_URL;
  const prevId = process.env.RD_STATION_CONVERSION_IDENTIFIER;

  afterEach(() => {
    if (prevBase === undefined) delete process.env.NEXT_PUBLIC_BASE_URL;
    else process.env.NEXT_PUBLIC_BASE_URL = prevBase;
    if (prevId === undefined) delete process.env.RD_STATION_CONVERSION_IDENTIFIER;
    else process.env.RD_STATION_CONVERSION_IDENTIFIER = prevId;
  });

  it("mapeia lead, UTM e laudo para o payload oficial", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://quiz.cambel.srv.br/diagnostico";
    process.env.RD_STATION_CONVERSION_IDENTIFIER = "diagnostico-oficina-quiz";

    const body = buildConversionPayload(record);
    expect(body.event_type).toBe("CONVERSION");
    expect(body.event_family).toBe("CDP");
    expect(body.payload).toMatchObject({
      conversion_identifier: "diagnostico-oficina-quiz",
      email: "ana@oficina.com",
      name: "Ana Silva",
      job_title: "Gestor",
      company_name: "Oficina Central",
      city: "Belo Horizonte",
      state: "MG",
      country: "Brasil",
      mobile_phone: "+5531988887777",
      website:
        "https://quiz.cambel.srv.br/diagnostico/resultado/ca00d8df-e515-437f-bdae-0d9f786190d5",
      traffic_source: "google",
      traffic_medium: "cpc",
      traffic_campaign: "feira",
      tags: ["quiz-cambel", "diagnostico-oficina"],
      cf_cnpj: "12345678000190",
      cf_laudo_id: record.id,
    });
    expect(cargoLabel("proprietario")).toBe("Proprietário");
  });

  it("remove campos cf_ no fallback", () => {
    const stripped = withoutCustomFields(buildConversionPayload(record));
    expect(Object.keys(stripped.payload).some((k) => k.startsWith("cf_"))).toBe(
      false,
    );
    expect(stripped.payload.email).toBe("ana@oficina.com");
  });
});

describe("syncToRdStation", () => {
  const prevKey = process.env.RD_STATION_API_KEY;
  const prevPublic = process.env.RD_STATION_PUBLIC_TOKEN;
  const prevTest = process.env.RD_STATION_TEST;

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    if (prevKey === undefined) delete process.env.RD_STATION_API_KEY;
    else process.env.RD_STATION_API_KEY = prevKey;
    if (prevPublic === undefined) delete process.env.RD_STATION_PUBLIC_TOKEN;
    else process.env.RD_STATION_PUBLIC_TOKEN = prevPublic;
    if (prevTest === undefined) delete process.env.RD_STATION_TEST;
    else process.env.RD_STATION_TEST = prevTest;
  });

  it("não envia sem API key", async () => {
    delete process.env.RD_STATION_API_KEY;
    delete process.env.RD_STATION_PUBLIC_TOKEN;
    process.env.RD_STATION_TEST = "1";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const result = await syncToRdStation(record);
    expect(result).toEqual({
      ok: false,
      skipped: true,
      reason: "missing_api_key",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("usa o token público quando não há API_KEY", async () => {
    delete process.env.RD_STATION_API_KEY;
    process.env.RD_STATION_PUBLIC_TOKEN = "public-token";
    process.env.RD_STATION_TEST = "1";
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ event_uuid: "evt-pub" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = await syncToRdStation(record);
    expect(result).toEqual({ ok: true, eventUuid: "evt-pub" });
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain("api_key=public-token");
  });

  it("posta conversão e lê event_uuid", async () => {
    process.env.RD_STATION_API_KEY = "test-key";
    process.env.RD_STATION_TEST = "1";
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ event_uuid: "evt-1" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncToRdStation(record);
    expect(result).toEqual({ ok: true, eventUuid: "evt-1" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${RD_CONVERSIONS_URL}?api_key=test-key`);
    expect(init.method).toBe("POST");
    const sent = JSON.parse(String(init.body)) as {
      payload: { email: string };
    };
    expect(sent.payload.email).toBe("ana@oficina.com");
  });

  it("reenvia sem campos cf_ se o RD responder 400", async () => {
    process.env.RD_STATION_API_KEY = "test-key";
    process.env.RD_STATION_TEST = "1";
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        status: 400,
        json: async () => ({ errors: [{ path: "$.payload.cf_cnpj" }] }),
      })
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({ event_uuid: "evt-2" }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncToRdStation(record);
    expect(result).toEqual({ ok: true, eventUuid: "evt-2" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const second = JSON.parse(
      String((fetchMock.mock.calls[1] as [string, RequestInit])[1].body),
    ) as { payload: Record<string, unknown> };
    expect(Object.keys(second.payload).some((k) => k.startsWith("cf_"))).toBe(
      false,
    );
  });

  it("não quebra o quiz se a API falhar", async () => {
    process.env.RD_STATION_API_KEY = "test-key";
    process.env.RD_STATION_TEST = "1";
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );
    const result = await syncToRdStation(record);
    expect(result.ok).toBe(false);
    if (!result.ok && !result.skipped) {
      expect(result.error).toBe("network down");
    }
  });
});
