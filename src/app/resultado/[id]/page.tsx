import { notFound } from "next/navigation";
import { ResultadoImpressao } from "@/components/diagnostico/ResultadoPainel";
import { ResultadoPassos } from "@/components/diagnostico/ResultadoPassos";
import { getResponseById } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function ResultadoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { id } = await params;
  const { print } = await searchParams;
  const record = await getResponseById(id);
  if (!record) notFound();

  if (print === "1") {
    return <ResultadoImpressao record={record} />;
  }
  return <ResultadoPassos record={record} />;
}
