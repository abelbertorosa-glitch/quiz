import { NextResponse } from "next/server";
import { getResponseById } from "@/lib/data/store";
import { gerarPdfDaUrl, isSafePrintBase } from "@/lib/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function getInternalPrintBases(req: Request): string[] {
  const raw: string[] = [];
  if (process.env.PDF_INTERNAL_BASE_URL?.trim()) {
    raw.push(process.env.PDF_INTERNAL_BASE_URL.trim());
  }
  if (process.env.VERCEL_URL?.trim()) {
    raw.push(`https://${process.env.VERCEL_URL.trim()}/diagnostico`);
  }
  if (process.env.NEXT_PUBLIC_BASE_URL?.trim()) {
    raw.push(process.env.NEXT_PUBLIC_BASE_URL.trim());
  }
  const origin = new URL(req.url).origin;
  raw.push(`${origin}/diagnostico`);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const b of raw) {
    const normalized = b.replace(/\/$/, "");
    if (!normalized || seen.has(normalized)) continue;
    if (!isSafePrintBase(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const response = await getResponseById(id);
  if (!response) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const path = `/resultado/${id}?print=1`;
  const bases = getInternalPrintBases(req);
  const errors: string[] = [];

  for (const base of bases) {
    const url = `${base}${path}`;
    try {
      const pdf = await gerarPdfDaUrl(url);
      const fileName = `diagnostico-cambel-${response.lead.empresa
        .replace(/\s+/g, "-")
        .toLowerCase()}.pdf`;
      return new NextResponse(new Uint8Array(pdf), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${fileName}"`,
          "Cache-Control": "private, max-age=300",
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${base}: ${message}`);
    }
  }

  return NextResponse.json(
    {
      error: "pdf_failed",
      message: errors[errors.length - 1] ?? "fetch failed",
      tried: bases,
    },
    { status: 500 },
  );
}
