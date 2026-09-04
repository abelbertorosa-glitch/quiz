import Link from "next/link";
import { notFound } from "next/navigation";
import { Brand } from "@/components/Brand";
import { getResponseById } from "@/lib/data/store";
import { publicPath, publicPdfPath } from "@/lib/pdf-path";
import { CONSULTORIA_URL } from "@/lib/scoring/constants";
import type { Categoria, Finding, Tier } from "@/lib/types";

const CAT: Record<Categoria, string> = {
  financeiro: "Financeiro",
  operacao: "Operação",
  gestao: "Gestão",
  comercial: "Comercial",
};

const CAT_ORDER: Categoria[] = ["financeiro", "operacao", "gestao", "comercial"];

const TIER: Record<Tier, string> = {
  bom: "Bom",
  mediano: "Mediano",
  atencao: "Atenção",
};

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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

  const printMode = print === "1";
  const { lead, diagnosis } = record;
  const m = diagnosis.metricas;
  const grouped = CAT_ORDER.map((categoria) => ({
    categoria,
    items: diagnosis.findings.filter((f) => f.categoria === categoria),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="shell">
      <header
        className={`mb-8 flex items-center justify-between ${printMode ? "" : "no-print"}`}
      >
        <Brand compact />
        {printMode ? null : (
          <a href={publicPdfPath(id)} className="btn-ghost">
            Baixar PDF
          </a>
        )}
      </header>

      <p className="kicker">{lead.empresa}</p>
      <h1 className="mt-2 text-3xl font-bold leading-tight text-[var(--navy)] sm:text-5xl">
        Diagnóstico da oficina
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        {lead.nome} · {lead.cidadeUf || "cidade não informada"} · fundada em{" "}
        {lead.anoFundacao}
      </p>

      <section className="card mt-8 grid gap-3 sm:grid-cols-2">
        <Metric
          label="Horas/mecânico no mês"
          value={m.horasVendidasPorMecanico.toFixed(1)}
        />
        <Metric label="Horas da oficina" value={m.horasVendidasOficina.toFixed(1)} />
        <Metric
          label="Serviços esperados"
          value={brl(m.faturamentoServicosEsperado)}
        />
        <Metric
          label="Faturamento esperado"
          value={brl(m.faturamentoTotalEsperado)}
        />
        <Metric
          label="Custo fixo / faturamento"
          value={
            m.custoFixoSobreFaturamento == null
              ? "não se aplica"
              : `${Math.round(m.custoFixoSobreFaturamento * 100)}%`
          }
        />
        <Metric
          label="Hora mínima recomendada"
          value={brl(m.horaMinimaRecomendada)}
        />
      </section>

      <div className="mt-10 grid gap-8">
        {grouped.map((group) => (
          <section key={group.categoria}>
            <p className="kicker">{CAT[group.categoria]}</p>
            <div className="mt-3 grid gap-4">
              {group.items.map((f) => (
                <FindingCard key={f.id} finding={f} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {printMode ? null : (
        <aside className="card no-print mt-10">
          <p className="kicker">Próximo passo</p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--navy)]">
            Consultoria e Assessoria Gerencial
          </h2>
          <p className="mt-3 leading-7 text-[var(--muted)]">
            Se o faturamento ficou abaixo da capacidade, a Cambel tem o produto
            desenhado para markup, precificação, checklist e gestão de pessoas.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={CONSULTORIA_URL}
              className="btn-primary"
              target="_blank"
              rel="noreferrer"
            >
              Ver a consultoria
            </a>
            <Link href={publicPath("/quiz")} className="btn-ghost">
              Fazer de novo
            </Link>
          </div>
        </aside>
      )}
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  return (
    <article className="card">
      <p className="kicker">
        {typeof finding.pergunta === "number" ? `P${finding.pergunta}` : "Cruzado"}
      </p>
      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold text-[var(--navy)]">{finding.titulo}</h2>
        <span className={`text-sm font-semibold tier-${finding.tier}`}>
          {TIER[finding.tier]}
        </span>
      </div>
      <p className="mt-3 leading-7 text-[var(--muted)]">{finding.texto}</p>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="kicker">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[var(--navy)]">{value}</p>
    </div>
  );
}
