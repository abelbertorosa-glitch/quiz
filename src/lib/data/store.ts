import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Answers, Lead, ResponseRecord, Utm } from "@/lib/types";
import { diagnosticar } from "@/lib/scoring/engine";

const ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function dataDir(): string {
  const fromEnv = process.env.DATA_DIR?.trim();
  if (fromEnv) return fromEnv;
  return path.join(process.cwd(), "data", "responses");
}

function fileFor(id: string): string {
  return path.join(dataDir(), `${id}.json`);
}

function legacyFile(): string {
  return path.join(process.cwd(), "data", "responses.json");
}

export function isResponseId(id: string): boolean {
  return ID_RE.test(id);
}

async function writeAtomic(file: string, body: string) {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, body, "utf8");
  await rename(tmp, file);
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
  await writeAtomic(fileFor(record.id), JSON.stringify(record));
  await syncToSheets(record);
  return record;
}

export async function getResponseById(
  id: string,
): Promise<ResponseRecord | null> {
  if (!isResponseId(id)) return null;

  try {
    const raw = await readFile(fileFor(id), "utf8");
    const parsed = JSON.parse(raw) as ResponseRecord;
    if (parsed?.id === id) return parsed;
  } catch {
    /* fall through to the legacy bundle */
  }

  try {
    const raw = await readFile(legacyFile(), "utf8");
    const parsed = JSON.parse(raw) as ResponseRecord[];
    if (!Array.isArray(parsed)) return null;
    return parsed.find((row) => row.id === id) ?? null;
  } catch {
    return null;
  }
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
