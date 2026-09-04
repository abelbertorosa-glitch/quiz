import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Answers, Lead, ResponseRecord, Utm } from "@/lib/types";
import { diagnosticar } from "@/lib/scoring/engine";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "responses.json");

async function readAll(): Promise<ResponseRecord[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as ResponseRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(rows: ResponseRecord[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(rows, null, 2), "utf8");
}

export async function createResponse(
  lead: Lead,
  answers: Answers,
  utm: Utm = {},
): Promise<ResponseRecord> {
  const record: ResponseRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    lead,
    answers,
    diagnosis: diagnosticar(lead, answers),
    utm,
  };
  const rows = await readAll();
  rows.push(record);
  await writeAll(rows);
  await syncToSheets(record);
  return record;
}

export async function getResponseById(
  id: string,
): Promise<ResponseRecord | null> {
  const rows = await readAll();
  return rows.find((r) => r.id === id) ?? null;
}

async function syncToSheets(record: ResponseRecord) {
  const url = process.env.SHEETS_WEBHOOK_URL?.trim();
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
  } catch (err) {
    console.error("sheets_sync_failed", err);
  }
}
