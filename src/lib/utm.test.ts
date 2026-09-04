import { describe, expect, it } from "vitest";
import { parseUtm } from "./utm";

describe("parseUtm", () => {
  it("lê só chaves utm_* e ignora o resto", () => {
    expect(
      parseUtm("utm_source=meta&utm_campaign=oficina&gclid=abc&foo=1"),
    ).toEqual({ source: "meta", campaign: "oficina" });
  });

  it("devolve vazio sem UTMs", () => {
    expect(parseUtm("")).toEqual({});
  });
});
