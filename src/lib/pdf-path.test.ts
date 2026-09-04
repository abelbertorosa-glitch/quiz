import { describe, expect, it } from "vitest";
import { publicAsset, publicPath, publicPdfPath } from "./pdf-path";

describe("publicPath", () => {
  it("keeps app paths for Next Link and router", () => {
    expect(publicPath("/")).toBe("/");
    expect(publicPath("/lead")).toBe("/lead");
    expect(publicPath("/quiz")).toBe("/quiz");
    expect(publicPath("/resultado/abc")).toBe("/resultado/abc");
  });

  it("strips a duplicated basePath", () => {
    expect(publicPath("/diagnostico")).toBe("/");
    expect(publicPath("/diagnostico/lead")).toBe("/lead");
  });
});

describe("publicPdfPath", () => {
  it("includes basePath for raw anchors", () => {
    expect(publicPdfPath("abc")).toBe("/diagnostico/api/pdf/abc");
  });
});

describe("publicAsset", () => {
  it("prefixes basePath for files in /public", () => {
    expect(publicAsset("/logo-cambel.png")).toBe("/diagnostico/logo-cambel.png");
  });
});
