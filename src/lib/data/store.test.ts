import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Answers, Lead } from "@/lib/types";
import { createResponse, getResponseById, isResponseId } from "./store";

const lead: Lead = {
  empresa: "Oficina Central",
  cnpj: "12345678000190",
  anoFundacao: 2018,
  cidadeUf: "Belo Horizonte/MG",
  nome: "Ana Silva",
  cargo: "gestor",
  idade: 38,
  genero: "feminino",
  telefone: "31988887777",
  email: "ana@oficina.com",
};

const answers: Answers = {
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
};

describe("store", () => {
  let dir: string;
  const prev = process.env.DATA_DIR;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), "quiz-cambel-"));
    process.env.DATA_DIR = dir;
  });

  afterEach(async () => {
    if (prev === undefined) delete process.env.DATA_DIR;
    else process.env.DATA_DIR = prev;
    await rm(dir, { recursive: true, force: true });
  });

  it("rejects junk ids", () => {
    expect(isResponseId("../etc/passwd")).toBe(false);
    expect(isResponseId("naoexiste")).toBe(false);
  });

  it("writes one file per laudo and reads it back", async () => {
    const created = await createResponse(lead, answers, { source: "feira" });
    expect(isResponseId(created.id)).toBe(true);
    expect(created.diagnosis.findings.length).toBeGreaterThan(0);

    const onDisk = JSON.parse(
      await readFile(path.join(dir, `${created.id}.json`), "utf8"),
    ) as { id: string };
    expect(onDisk.id).toBe(created.id);

    const loaded = await getResponseById(created.id);
    expect(loaded?.lead.empresa).toBe("Oficina Central");
    expect(loaded?.diagnosis.metricas.horasVendidasPorMecanico).toBeGreaterThan(
      0,
    );
  });

  it("keeps concurrent submits from overwriting each other", async () => {
    const batch = await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        createResponse(
          { ...lead, empresa: `Oficina ${i}` },
          answers,
        ),
      ),
    );
    const ids = new Set(batch.map((row) => row.id));
    expect(ids.size).toBe(12);
    for (const row of batch) {
      const loaded = await getResponseById(row.id);
      expect(loaded?.lead.empresa).toBe(row.lead.empresa);
    }
  });

  it("returns null for a missing id", async () => {
    expect(
      await getResponseById("00000000-0000-4000-8000-000000000000"),
    ).toBeNull();
  });

  it("still reads the legacy responses.json bundle", async () => {
    const id = "11111111-1111-4111-8111-111111111111";
    const created = await createResponse(lead, answers);
    const bundled = {
      ...created,
      id,
      lead: { ...created.lead, empresa: "Legacy Shop" },
    };
    const legacyDir = path.join(process.cwd(), "data");
    const legacyFile = path.join(legacyDir, "responses.json");
    const previous = await readFile(legacyFile, "utf8").catch(() => "[]");
    await writeFile(legacyFile, JSON.stringify([bundled]), "utf8");
    try {
      const loaded = await getResponseById(id);
      expect(loaded?.lead.empresa).toBe("Legacy Shop");
    } finally {
      await writeFile(legacyFile, previous, "utf8");
    }
  });
});
