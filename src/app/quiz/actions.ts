"use server";

import { createResponse } from "@/lib/data/store";
import type { Answers, Lead, Utm } from "@/lib/types";
import { publicPath } from "@/lib/pdf-path";

export async function submitQuiz(input: {
  lead: Lead;
  answers: Answers;
  utm?: Utm;
}): Promise<{ ok: true; id: string; redirect: string } | { ok: false; error: string }> {
  try {
    const record = await createResponse(
      input.lead,
      input.answers,
      input.utm ?? {},
    );
    return {
      ok: true,
      id: record.id,
      redirect: publicPath(`/resultado/${record.id}`),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "submit_failed";
    return { ok: false, error: message };
  }
}
