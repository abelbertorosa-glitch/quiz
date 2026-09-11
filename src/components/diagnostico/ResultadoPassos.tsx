"use client";

import { useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import {
  CategoryBars,
  CustoFixoBar,
  Kpi,
  MoneyBars,
  ScoreRing,
  brl,
} from "@/components/diagnostico/ResultadoPainel";
import { publicPath, publicPdfPath } from "@/lib/pdf-path";
import { CONSULTORIA_URL } from "@/lib/scoring/constants";
import {
  CAT_LABEL,
  CAT_ORDER,
  TIER_LABEL,
  countByTier,
  scoreByCategory,
  scoreOf,
  verdict,
} from "@/lib/scoring/summary";
import type { Categoria, Finding, ResponseRecord } from "@/lib/types";

const STEP_LABELS = [
  "Visão geral",
  ...CAT_ORDER.map((cat) => CAT_LABEL[cat]),
  "Próximos passos",
] as const;

export function ResultadoPassos({ record }: { record: ResponseRecord }) {
  const { lead, diagnosis, answers } = record;
  const m = diagnosis.metricas;
  const findings = diagnosis.findings;
  const score = scoreOf(findings);
  const byCat = scoreByCategory(findings);
  const counts = countByTier(findings);
  const v = verdict(score);
  const grouped = CAT_ORDER.map((categoria) => ({
    categoria,
    score: byCat[categoria],
    items: findings.filter((f) => f.categoria === categoria),
  }));
  const prioridades = findings.filter((f) => f.tier !== "bom");
  const [step, setStep] = useState(0);
  const last = STEP_LABELS.length - 1;

  function go(next: number) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  return (
    <div className="laudo-page">
      <article className="laudo-doc">
        <header className="laudo-top">
          <Brand compact />
          <div className="laudo-who">
            <h1>Diagnóstico da oficina</h1>
            <p>
              {lead.empresa} · {lead.nome} · {lead.cidadeUf || "cidade n/d"} ·{" "}
              {lead.anoFundacao}
            </p>
          </div>
          <div className="laudo-actions no-print">
            <a href={publicPdfPath(record.id)} className="btn-ghost">
              Baixar PDF
            </a>
          </div>
        </header>

        <div className="laudo-progress" aria-label="Progresso do laudo">
          <p className="kicker">
            {STEP_LABELS[step]}
            <span>
              {step + 1} / {STEP_LABELS.length}
            </span>
          </p>
          <div className="laudo-progress-bars">
            {STEP_LABELS.map((label, i) => (
              <button
                key={label}
                type="button"
                className={
                  i < step ? "is-done" : i === step ? "is-now" : undefined
                }
                aria-label={label}
                aria-current={i === step ? "step" : undefined}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </div>

        {step === 0 ? (
          <section className="laudo-sec" aria-labelledby="laudo-resumo">
            <h2 id="laudo-resumo">Visão geral</h2>
            <div className="laudo-overview">
              <div className="laudo-score" aria-label="Nota geral">
                <ScoreRing score={score} tier={v.tier} />
                <p className={`laudo-verdict tier-${v.tier}`}>{v.label}</p>
                <ul className="laudo-counts">
                  <li>
                    <b>{counts.bom}</b> bom
                  </li>
                  <li>
                    <b>{counts.mediano}</b> mediano
                  </li>
                  <li>
                    <b>{counts.atencao}</b> atenção
                  </li>
                </ul>
              </div>
              <div className="laudo-cats">
                <p className="kicker">Quatro eixos</p>
                <CategoryBars scores={byCat} />
              </div>
              <div className="laudo-money">
                <p className="kicker">Capacidade × realizado</p>
                <MoneyBars
                  informado={answers.p2_faturamento}
                  esperado={m.faturamentoTotalEsperado}
                />
                <CustoFixoBar ratio={m.custoFixoSobreFaturamento} />
              </div>
            </div>
            <div className="laudo-kpis" aria-label="Indicadores">
              <Kpi
                label="Hora mínima"
                value={brl(answers.p8_horaMinima)}
                hint={`recomendada ${brl(m.horaMinimaRecomendada)}`}
                ok={answers.p8_horaMinima >= m.horaMinimaRecomendada}
              />
              <Kpi
                label="Elevadores"
                value={`${answers.p9_elevadores} / ${m.elevadoresIdeais.toFixed(1)}`}
                hint="ideal 1,5 por mecânico"
                ok={m.estruturaElevadoresOk}
              />
              <Kpi
                label="Caixa"
                value={m.caixaSaudavel ? "Saudável" : "Ajustar"}
                hint="2 meses e sem antecipar"
                ok={m.caixaSaudavel}
              />
              <Kpi
                label="Horas/mês"
                value={m.horasVendidasOficina.toFixed(0)}
                hint={`${m.horasVendidasPorMecanico.toFixed(0)} h por mecânico`}
                ok={m.atingeFaturamentoEsperado}
              />
            </div>
          </section>
        ) : null}

        {grouped.map((group, i) =>
          step === i + 1 ? (
            <SecaoEixo
              key={group.categoria}
              categoria={group.categoria}
              score={group.score}
              items={group.items}
            />
          ) : null,
        )}

        {step === last ? (
          <section className="laudo-sec" aria-labelledby="laudo-next">
            <h2 id="laudo-next">Próximos passos</h2>
            {prioridades.length ? (
              <div className="laudo-cards laudo-cards-read">
                {prioridades.map((item) => (
                  <article
                    key={item.id}
                    className={`laudo-card tier-${item.tier}`}
                  >
                    <p className={`kicker tier-${item.tier}`}>
                      {CAT_LABEL[item.categoria]} · {TIER_LABEL[item.tier]}
                    </p>
                    <h3>{item.titulo}</h3>
                    <p>{item.texto}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="laudo-close-ok">
                Nenhum ponto em atenção. Manter o padrão.
              </p>
            )}
            <div className="laudo-close-actions">
              <a
                href={CONSULTORIA_URL}
                className="btn-primary"
                target="_blank"
                rel="noreferrer"
              >
                Ver a consultoria
              </a>
              <a href={publicPdfPath(record.id)} className="btn-ghost">
                Baixar PDF
              </a>
              <Link href={publicPath("/quiz")} className="btn-ghost">
                Fazer de novo
              </Link>
            </div>
          </section>
        ) : null}

        <div className="laudo-nav">
          {step > 0 ? (
            <button type="button" className="btn-ghost" onClick={() => go(step - 1)}>
              Voltar
            </button>
          ) : (
            <span />
          )}
          {step < last ? (
            <button type="button" className="btn-primary" onClick={() => go(step + 1)}>
              Continuar
            </button>
          ) : null}
        </div>
      </article>
    </div>
  );
}

function SecaoEixo({
  categoria,
  score,
  items,
}: {
  categoria: Categoria;
  score: number;
  items: Finding[];
}) {
  return (
    <section className="laudo-sec" aria-labelledby={`sec-${categoria}`}>
      <h2 id={`sec-${categoria}`}>
        {CAT_LABEL[categoria]}
        <span>{score}</span>
      </h2>
      <div className="laudo-cards laudo-cards-read">
        {items.map((item) => (
          <article key={item.id} className={`laudo-card tier-${item.tier}`}>
            <p className={`kicker tier-${item.tier}`}>{TIER_LABEL[item.tier]}</p>
            <h3>{item.titulo}</h3>
            <p>{item.texto}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
