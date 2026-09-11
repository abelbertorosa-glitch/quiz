import { Brand } from "@/components/Brand";
import {
  CAT_LABEL,
  CAT_ORDER,
  TIER_LABEL,
} from "@/lib/scoring/summary";
import type { Categoria, Finding, ResponseRecord, Tier } from "@/lib/types";

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

const TIER_FILL: Record<Tier, string> = {
  bom: "var(--good)",
  mediano: "var(--warn)",
  atencao: "var(--alert)",
};

export function ResultadoImpressao({ record }: { record: ResponseRecord }) {
  const { lead, diagnosis, answers } = record;
  const m = diagnosis.metricas;
  const grouped = CAT_ORDER.map((categoria) => ({
    categoria,
    items: diagnosis.findings.filter((f) => f.categoria === categoria),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="shell laudo-print">
      <header className="mb-8 flex items-center justify-between">
        <Brand compact />
      </header>
      <p className="kicker">{lead.empresa}</p>
      <h1 className="mt-2 text-3xl font-bold leading-tight text-[var(--navy)]">
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
        <Metric label="Faturamento informado" value={brl(answers.p2_faturamento)} />
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
        <Metric label="Hora mínima recomendada" value={brl(m.horaMinimaRecomendada)} />
      </section>
      <div className="mt-10 grid gap-8">
        {grouped.map((group) => (
          <section key={group.categoria}>
            <p className="kicker">{CAT_LABEL[group.categoria]}</p>
            <div className="mt-3 grid gap-4">
              {group.items.map((item) => (
                <FindingPrint key={item.id} finding={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
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

function FindingPrint({ finding }: { finding: Finding }) {
  return (
    <article className="card">
      <p className="kicker">
        {typeof finding.pergunta === "number" ? `P${finding.pergunta}` : "Cruzado"}
      </p>
      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold text-[var(--navy)]">{finding.titulo}</h2>
        <span className={`text-sm font-semibold tier-${finding.tier}`}>
          {TIER_LABEL[finding.tier]}
        </span>
      </div>
      <p className="mt-3 leading-7 text-[var(--muted)]">{finding.texto}</p>
    </article>
  );
}

export function Kpi({
  label,
  value,
  hint,
  ok,
}: {
  label: string;
  value: string;
  hint: string;
  ok: boolean;
}) {
  return (
    <div className={`laudo-kpi ${ok ? "is-ok" : "is-off"}`}>
      <p className="kicker">{label}</p>
      <p className="laudo-kpi-value">{value}</p>
      <p className="laudo-kpi-hint">{hint}</p>
    </div>
  );
}

export function ScoreRing({ score, tier }: { score: number; tier: Tier }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <svg
      className="laudo-ring"
      viewBox="0 0 108 108"
      role="img"
      aria-label={`Nota ${score} de 100`}
    >
      <circle cx="54" cy="54" r={r} className="laudo-ring-track" />
      <circle
        cx="54"
        cy="54"
        r={r}
        className="laudo-ring-value"
        stroke={TIER_FILL[tier]}
        strokeDasharray={`${dash} ${c}`}
      />
      <text x="54" y="52" textAnchor="middle" className="laudo-ring-n">
        {score}
      </text>
      <text x="54" y="68" textAnchor="middle" className="laudo-ring-sub">
        / 100
      </text>
    </svg>
  );
}

export function CategoryBars({ scores }: { scores: Record<Categoria, number> }) {
  return (
    <ul className="laudo-bars">
      {CAT_ORDER.map((cat) => (
        <li key={cat}>
          <span>
            {CAT_LABEL[cat]} <b>{scores[cat]}</b>
          </span>
          <span className="laudo-bar-track" aria-hidden>
            <span
              className="laudo-bar-fill"
              style={{ width: `${scores[cat]}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function MoneyBars({
  informado,
  esperado,
}: {
  informado: number;
  esperado: number;
}) {
  const max = Math.max(informado, esperado, 1);
  return (
    <ul className="laudo-bars laudo-bars-money">
      <li>
        <span>Informado</span>
        <span className="laudo-bar-track" aria-hidden>
          <span
            className="laudo-bar-fill is-real"
            style={{ width: `${(informado / max) * 100}%` }}
          />
        </span>
        <b>{brl(informado)}</b>
      </li>
      <li>
        <span>Esperado</span>
        <span className="laudo-bar-track" aria-hidden>
          <span
            className="laudo-bar-fill is-goal"
            style={{ width: `${(esperado / max) * 100}%` }}
          />
        </span>
        <b>{brl(esperado)}</b>
      </li>
    </ul>
  );
}

export function CustoFixoBar({ ratio }: { ratio: number | null }) {
  if (ratio == null) {
    return (
      <p className="laudo-custo-na">
        Custo fixo / faturamento não se aplica (só serviço).
      </p>
    );
  }
  const pct = Math.round(ratio * 100);
  const capped = Math.min(pct, 60);
  return (
    <div className="laudo-custo">
      <div className="laudo-custo-meta">
        <span>Custo fixo</span>
        <b>{pct}%</b>
      </div>
      <div className="laudo-custo-track" aria-hidden>
        <span className="laudo-custo-zone" />
        <span className="laudo-custo-mark" style={{ left: `${(capped / 60) * 100}%` }} />
      </div>
      <p>Faixa saudável 25–32%</p>
    </div>
  );
}
