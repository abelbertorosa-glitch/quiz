"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CARGOS, CATEGORIA_LABEL, QUESTIONS } from "@/lib/questions";
import {
  maskCnpj,
  maskWhatsappBR,
  validateContato,
  validateOficina,
  validatePessoa,
} from "@/lib/lead";
import {
  formatBRL,
  maskCidadeUf,
  maskIdade,
  maskPercent,
  maskYear,
  parseBRL,
  parsePercent,
} from "@/lib/mask";
import { parseUtm } from "@/lib/utm";
import type { Answers, Cargo, Genero, Lead } from "@/lib/types";
import { Brand } from "@/components/Brand";
import { submitQuiz } from "./actions";

const DRAFT = "qc-draft-1";
const CAT_BARS = ["Financeiro", "Operação", "Gestão", "Comercial"] as const;
const LEAD_BARS = ["Oficina", "Você", "Contato"] as const;
const LEAD_SCREENS = ["oficina", "pessoa", "contato"] as const;

type LeadScreen = (typeof LEAD_SCREENS)[number];
type Step =
  | { kind: "lead"; screen: LeadScreen }
  | { kind: "pergunta"; index: number }
  | { kind: "submit" };

const emptyLead = (): Lead => ({
  empresa: "",
  cnpj: "",
  anoFundacao: new Date().getFullYear() - 5,
  cidadeUf: "",
  nome: "",
  cargo: "proprietario",
  idade: 0,
  genero: "masculino",
  telefone: "",
  email: "",
});

export function QuizForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ kind: "lead", screen: "oficina" });
  const [lead, setLead] = useState<Lead>(emptyLead);
  const [answers, setAnswers] = useState<Partial<Answers>>(() =>
    Object.fromEntries(
      QUESTIONS.filter((item) => item.kind === "stepper").map((item) => [
        item.id,
        item.min ?? 1,
      ]),
    ),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [ready, setReady] = useState(false);
  const [pending, startTransition] = useTransition();

  // Restaura o rascunho do sessionStorage no mount (refresh não perde o quiz).
  /* eslint-disable react-hooks/set-state-in-effect -- sync com storage externo */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT);
      if (raw) {
        const saved = JSON.parse(raw) as {
          step?: Step;
          lead?: Lead;
          answers?: Partial<Answers>;
        };
        if (saved.lead) setLead((prev) => ({ ...prev, ...saved.lead }));
        if (saved.answers) setAnswers(saved.answers);
        if (saved.step && saved.step.kind !== "submit") setStep(saved.step);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(DRAFT, JSON.stringify({ step, lead, answers }));
    } catch {
      /* ignore */
    }
  }, [step, lead, answers, ready]);

  const pergunta = step.kind === "pergunta" ? QUESTIONS[step.index] : null;
  const tituloLead =
    step.kind === "lead"
      ? step.screen === "oficina"
        ? "Dados da oficina"
        : step.screen === "pessoa"
          ? "Sobre você"
          : "Contato"
      : null;
  const categoriaAtual = pergunta ? CATEGORIA_LABEL[pergunta.categoria] : null;
  const isLead = step.kind === "lead";
  const bars = isLead ? LEAD_BARS : CAT_BARS;
  const barIndex = isLead
    ? Math.max(0, LEAD_SCREENS.indexOf(step.screen))
    : Math.max(0, CAT_BARS.indexOf((categoriaAtual ?? "Financeiro") as (typeof CAT_BARS)[number]));
  const totalSteps = LEAD_SCREENS.length + QUESTIONS.length;
  const currentIndex =
    step.kind === "pergunta"
      ? LEAD_SCREENS.length + step.index + 1
      : step.kind === "submit"
        ? totalSteps
        : LEAD_SCREENS.indexOf(step.screen) + 1;
  const progressPct = Math.round((currentIndex / totalSteps) * 100);

  function setLeadField<K extends keyof Lead>(key: K, value: Lead[K]) {
    setLead((prev) => ({ ...prev, [key]: value }));
  }

  function avancarLead() {
    const bag =
      step.kind === "lead" && step.screen === "oficina"
        ? validateOficina(lead)
        : step.kind === "lead" && step.screen === "pessoa"
          ? validatePessoa(lead)
          : validateContato(lead);
    setErrors(bag);
    if (Object.keys(bag).length) return;
    if (step.kind !== "lead") return;
    const i = LEAD_SCREENS.indexOf(step.screen);
    if (i < LEAD_SCREENS.length - 1) {
      setStep({ kind: "lead", screen: LEAD_SCREENS[i + 1] });
      return;
    }
    setStep({ kind: "pergunta", index: 0 });
  }

  function voltar() {
    setErrors({});
    setSubmitError("");
    if (step.kind === "pergunta") {
      if (step.index > 0) setStep({ kind: "pergunta", index: step.index - 1 });
      else setStep({ kind: "lead", screen: "contato" });
      return;
    }
    if (step.kind === "lead") {
      const i = LEAD_SCREENS.indexOf(step.screen);
      if (i > 0) setStep({ kind: "lead", screen: LEAD_SCREENS[i - 1] });
    }
  }

  function setAnswer(value: unknown) {
    if (!pergunta) return;
    setAnswers((prev) => ({ ...prev, [pergunta.id]: value as Answers[typeof pergunta.id] }));
    setErrors({});
  }

  const canAdvanceQuestion = useMemo(() => {
    if (!pergunta) return false;
    const value = answers[pergunta.id];
    return value !== undefined && value !== null;
  }, [pergunta, answers]);

  function avancarPergunta() {
    if (!pergunta) return;
    if (!canAdvanceQuestion) {
      setErrors({ [pergunta.id]: "Responda para continuar." });
      return;
    }
    if (step.kind !== "pergunta") return;
    if (step.index >= QUESTIONS.length - 1) {
      finalizar();
      return;
    }
    setStep({ kind: "pergunta", index: step.index + 1 });
  }

  function finalizar() {
    setSubmitError("");
    setStep({ kind: "submit" });
    startTransition(async () => {
      const result = await submitQuiz({
        lead,
        answers: answers as Answers,
        utm: parseUtm(window.location.search),
      });
      if (!result.ok) {
        setSubmitError(result.error);
        setStep({ kind: "pergunta", index: QUESTIONS.length - 1 });
        return;
      }
      sessionStorage.removeItem(DRAFT);
      router.push(result.redirect);
    });
  }

  return (
    <article className="glass-card quiz-card relative">
      <div className="absolute inset-x-0 top-0 h-1 bg-[var(--line)]">
        <div
          className="h-full bg-[var(--orange)] transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <header className="quiz-card__brand">
        <Brand compact />
      </header>
      <div className="quiz-body">
        {step.kind !== "submit" && (
          <>
            <div className="flex items-baseline justify-between gap-3">
              {tituloLead ? (
                <h2 className="quiz-title">{tituloLead}</h2>
              ) : (
                <span className="kicker">{categoriaAtual}</span>
              )}
              <span className="kicker shrink-0 opacity-60">
                {barIndex + 1} / {bars.length}
              </span>
            </div>
            <div className="mt-2 flex gap-1.5" aria-hidden>
              {bars.map((nome, i) => (
                <span
                  key={nome}
                  className="h-[3px] flex-1 rounded-full"
                  style={{
                    background: i <= barIndex ? "var(--teal)" : "var(--line)",
                  }}
                />
              ))}
            </div>
          </>
        )}

        <div className="quiz-step">
          {step.kind === "lead" && step.screen === "oficina" && (
            <LeadOficina lead={lead} setLeadField={setLeadField} errors={errors} onAvancar={avancarLead} />
          )}
          {step.kind === "lead" && step.screen === "pessoa" && (
            <LeadPessoa
              lead={lead}
              setLeadField={setLeadField}
              errors={errors}
              onAvancar={avancarLead}
              onVoltar={voltar}
            />
          )}
          {step.kind === "lead" && step.screen === "contato" && (
            <LeadContato
              lead={lead}
              setLeadField={setLeadField}
              errors={errors}
              onAvancar={avancarLead}
              onVoltar={voltar}
            />
          )}
          {step.kind === "pergunta" && pergunta && (
            <PerguntaStep
              numero={pergunta.n}
              enunciado={pergunta.enunciado}
              ajuda={pergunta.ajuda}
              kind={pergunta.kind}
              options={pergunta.options}
              min={pergunta.min}
              max={pergunta.max}
              suffix={pergunta.suffix}
              value={answers[pergunta.id]}
              erro={errors[pergunta.id]}
              onChange={setAnswer}
              onAvancar={avancarPergunta}
              onVoltar={voltar}
              ultima={step.index === QUESTIONS.length - 1}
            />
          )}
          {step.kind === "submit" && (
            <div className="py-12 text-center">
              {pending ? (
                <>
                  <div
                    className="mx-auto h-12 w-12 animate-spin rounded-full"
                    style={{
                      border: "2px solid var(--line)",
                      borderTopColor: "var(--orange)",
                    }}
                  />
                  <p className="mt-6 text-[var(--muted)]">Gerando o diagnóstico…</p>
                </>
              ) : submitError ? (
                <p className="field-error">{submitError}</p>
              ) : (
                <p className="text-[var(--muted)]">Redirecionando…</p>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      {children}
      <span className="field-error">{error ?? "\u00a0"}</span>
    </label>
  );
}

function FluxoNav({
  onVoltar,
  onAvancar,
  texto = "Continuar",
  primeiro = false,
}: {
  onVoltar?: () => void;
  onAvancar: () => void;
  texto?: string;
  primeiro?: boolean;
}) {
  return (
    <div
      className={`quiz-nav flex items-center gap-3 ${
        primeiro || !onVoltar ? "justify-end" : "justify-between"
      }`}
    >
      {primeiro || !onVoltar ? null : (
        <button type="button" className="btn-ghost" onClick={onVoltar}>
          Voltar
        </button>
      )}
      <button type="submit" className="btn-primary" onClick={onAvancar}>
        {texto}
      </button>
    </div>
  );
}

function LeadOficina({
  lead,
  setLeadField,
  errors,
  onAvancar,
}: {
  lead: Lead;
  setLeadField: <K extends keyof Lead>(key: K, value: Lead[K]) => void;
  errors: Record<string, string>;
  onAvancar: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAvancar();
      }}
      className="quiz-form"
    >
      <Field label="Nome da empresa / oficina" error={errors.empresa}>
        <input
          value={lead.empresa}
          onChange={(e) => setLeadField("empresa", e.target.value)}
        />
      </Field>
      <div className="quiz-pair">
        <Field label="CNPJ" error={errors.cnpj}>
          <input
            inputMode="numeric"
            placeholder="00.000.000/0000-00"
            value={lead.cnpj}
            onChange={(e) => setLeadField("cnpj", maskCnpj(e.target.value))}
          />
        </Field>
        <Field label="Ano de fundação" error={errors.anoFundacao}>
          <input
            inputMode="numeric"
            placeholder="2018"
            maxLength={4}
            value={lead.anoFundacao || ""}
            onChange={(e) =>
              setLeadField("anoFundacao", Number(maskYear(e.target.value)) || 0)
            }
          />
        </Field>
      </div>
      <Field label="Cidade / UF" error={errors.cidadeUf}>
        <input
          placeholder="Belo Horizonte/MG"
          value={lead.cidadeUf}
          onChange={(e) => setLeadField("cidadeUf", maskCidadeUf(e.target.value))}
        />
      </Field>
      <FluxoNav primeiro onAvancar={onAvancar} />
    </form>
  );
}

function LeadPessoa({
  lead,
  setLeadField,
  errors,
  onAvancar,
  onVoltar,
}: {
  lead: Lead;
  setLeadField: <K extends keyof Lead>(key: K, value: Lead[K]) => void;
  errors: Record<string, string>;
  onAvancar: () => void;
  onVoltar: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAvancar();
      }}
      className="quiz-form"
    >
      <Field label="Seu nome" error={errors.nome}>
        <input
          value={lead.nome}
          onChange={(e) => setLeadField("nome", e.target.value)}
        />
      </Field>
      <div className="quiz-pair">
        <Field label="Cargo" error={errors.cargo}>
          <select
            value={lead.cargo}
            onChange={(e) => setLeadField("cargo", e.target.value as Cargo)}
          >
            {CARGOS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Idade" error={errors.idade}>
          <input
            inputMode="numeric"
            placeholder="38"
            maxLength={2}
            value={lead.idade || ""}
            onChange={(e) =>
              setLeadField("idade", Number(maskIdade(e.target.value)) || 0)
            }
          />
        </Field>
      </div>
      <Field label="Gênero" error={errors.genero}>
        <select
          value={lead.genero}
          onChange={(e) => setLeadField("genero", e.target.value as Genero)}
        >
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
        </select>
      </Field>
      <FluxoNav onVoltar={onVoltar} onAvancar={onAvancar} />
    </form>
  );
}

function LeadContato({
  lead,
  setLeadField,
  errors,
  onAvancar,
  onVoltar,
}: {
  lead: Lead;
  setLeadField: <K extends keyof Lead>(key: K, value: Lead[K]) => void;
  errors: Record<string, string>;
  onAvancar: () => void;
  onVoltar: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAvancar();
      }}
      className="quiz-form"
    >
      <Field label="Telefone / WhatsApp" error={errors.telefone}>
        <input
          inputMode="numeric"
          placeholder="(31) 99999-0000"
          value={lead.telefone}
          onChange={(e) => setLeadField("telefone", maskWhatsappBR(e.target.value))}
        />
      </Field>
      <Field label="E-mail" error={errors.email}>
        <input
          type="email"
          placeholder="seu@email.com"
          value={lead.email}
          onChange={(e) => setLeadField("email", e.target.value)}
        />
      </Field>
      <FluxoNav onVoltar={onVoltar} onAvancar={onAvancar} texto="Começar as perguntas" />
    </form>
  );
}

function PerguntaStep({
  numero,
  enunciado,
  ajuda,
  kind,
  options,
  min,
  max,
  suffix,
  value,
  erro,
  onChange,
  onAvancar,
  onVoltar,
  ultima,
}: {
  numero: number;
  enunciado: string;
  ajuda?: string;
  kind: (typeof QUESTIONS)[number]["kind"];
  options?: { value: string | boolean; label: string }[];
  min?: number;
  max?: number;
  suffix?: string;
  value: unknown;
  erro?: string;
  onChange: (value: unknown) => void;
  onAvancar: () => void;
  onVoltar: () => void;
  ultima: boolean;
}) {
  let input: React.ReactNode;
  if (kind === "boolean" || kind === "select") {
    input = (
      <div className="quiz-ask__input">
        {options?.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              className={`option ${selected ? "option-on" : ""}`}
              onClick={() => onChange(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  } else if (kind === "stepper") {
    const n = typeof value === "number" ? value : (min ?? 1);
    input = (
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="stepper-btn"
          onClick={() => onChange(Math.max(min ?? 1, n - 1))}
        >
          −
        </button>
        <span className="text-4xl font-bold tabular-nums text-[var(--navy)]">{n}</span>
        <button
          type="button"
          className="stepper-btn"
          onClick={() => onChange(Math.min(max ?? 15, n + 1))}
        >
          +
        </button>
      </div>
    );
  } else if (kind === "money") {
    input = (
      <input
        className="text-2xl"
        inputMode="numeric"
        placeholder="R$ 0,00"
        value={typeof value === "number" ? formatBRL(value) : ""}
        onChange={(e) => onChange(parseBRL(e.target.value))}
      />
    );
  } else {
    input = (
      <div className="relative">
        <input
          className="text-2xl"
          inputMode="numeric"
          placeholder="100"
          value={typeof value === "number" ? maskPercent(String(value)) : ""}
          onChange={(e) => onChange(parsePercent(e.target.value))}
        />
        {suffix ? (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
            {suffix}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="quiz-ask">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--orange)] text-[10px] font-semibold text-white">
          {numero}
        </span>
        <div>
          <h2 className="font-bold text-[var(--navy)]">{enunciado}</h2>
          {ajuda ? <p className="mt-1 text-xs text-[var(--muted)]">{ajuda}</p> : null}
        </div>
      </div>
      {input}
      {erro ? <p className="field-error">{erro}</p> : null}
      <FluxoNav
        onVoltar={onVoltar}
        onAvancar={onAvancar}
        texto={ultima ? "Ver resultado" : "Continuar"}
      />
    </div>
  );
}
