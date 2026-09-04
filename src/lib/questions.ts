import type { Answers, Cargo, Canal, SistemaGestao } from "./types";

export type FieldKind =
  | "number"
  | "money"
  | "percent"
  | "boolean"
  | "select"
  | "stepper";

export type Question = {
  id: keyof Answers;
  n: number;
  categoria: "financeiro" | "operacao" | "gestao" | "comercial";
  enunciado: string;
  ajuda?: string;
  kind: FieldKind;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  options?: { value: string | boolean; label: string }[];
};

export const CARGOS: { value: Cargo; label: string }[] = [
  { value: "proprietario", label: "Proprietário" },
  { value: "socio", label: "Sócio" },
  { value: "gestor", label: "Gestor" },
  { value: "gestor_patio", label: "Gestor de pátio" },
  { value: "outro", label: "Outro" },
];

export const SISTEMAS: { value: SistemaGestao; label: string }[] = [
  { value: "ultracar", label: "Ultracar" },
  { value: "syscar", label: "Syscar" },
  { value: "oficina_inteligente", label: "Oficina Inteligente" },
  { value: "onmotors", label: "Onmotors" },
  { value: "griffo", label: "Griffo" },
  { value: "outros", label: "Outros" },
];

export const CANAIS: { value: Canal; label: string }[] = [
  { value: "indicacao", label: "Indicação" },
  { value: "google", label: "Google / internet" },
  { value: "redes_sociais", label: "Redes sociais e canais digitais" },
  {
    value: "fluxo_espontaneo",
    label: "Fluxo espontâneo / ponto comercial",
  },
];

export const QUESTIONS: Question[] = [
  {
    id: "p1_custoFixo",
    n: 1,
    categoria: "financeiro",
    enunciado: "Você sabe quanto de custo fixo tem sua oficina mensalmente?",
    ajuda: "Valor mensal em reais, como no laudo da Cambel.",
    kind: "money",
  },
  {
    id: "p2_faturamento",
    n: 2,
    categoria: "financeiro",
    enunciado: "Qual a média de faturamento mensal de sua oficina?",
    ajuda: "Média mensal em reais.",
    kind: "money",
  },
  {
    id: "p3_markup",
    n: 3,
    categoria: "financeiro",
    enunciado: "Qual markup você utiliza para venda de peças?",
    ajuda: "Percentual médio. Ex.: 100. A régua de mercado é 100%.",
    kind: "percent",
    suffix: "%",
  },
  {
    id: "p4_reserva",
    n: 4,
    categoria: "financeiro",
    enunciado:
      "Com o que tem em caixa, a oficina consegue se sustentar por quanto tempo com as portas fechadas?",
    kind: "select",
    options: [
      { value: "1_mes", label: "1 mês" },
      { value: "2_meses_ou_mais", label: "2 meses ou mais" },
      { value: "sem_caixa", label: "Sem caixa" },
    ],
  },
  {
    id: "p5_antecipa",
    n: 5,
    categoria: "financeiro",
    enunciado: "É feita a antecipação do cartão de crédito?",
    kind: "boolean",
    options: [
      { value: true, label: "Sim" },
      { value: false, label: "Não" },
    ],
  },
  {
    id: "p6_mecanicos",
    n: 6,
    categoria: "operacao",
    enunciado: "Quantos mecânicos possuem na operação?",
    kind: "stepper",
    min: 1,
    max: 15,
  },
  {
    id: "p7_comercializacao",
    n: 7,
    categoria: "operacao",
    enunciado: "Você vende peças e serviços ou somente serviço?",
    kind: "select",
    options: [
      { value: "pecas_servicos", label: "Peças e serviços" },
      { value: "somente_servico", label: "Somente serviço" },
    ],
  },
  {
    id: "p8_horaMinima",
    n: 8,
    categoria: "operacao",
    enunciado: "Qual o valor da hora mínima praticado na sua oficina?",
    ajuda: "Valor da hora mínima em reais.",
    kind: "money",
  },
  {
    id: "p9_elevadores",
    n: 9,
    categoria: "operacao",
    enunciado: "Quantos elevadores possui?",
    kind: "stepper",
    min: 1,
    max: 10,
  },
  {
    id: "p10_checklist",
    n: 10,
    categoria: "operacao",
    enunciado: "São feitos checklists de venda? De entrada e saída do veículo?",
    kind: "boolean",
    options: [
      { value: true, label: "Sim" },
      { value: false, label: "Não" },
    ],
  },
  {
    id: "p11_produtividade",
    n: 11,
    categoria: "operacao",
    enunciado: "Existe um controle de produtividade por técnico?",
    kind: "boolean",
    options: [
      { value: true, label: "Sim" },
      { value: false, label: "Não" },
    ],
  },
  {
    id: "p12_processos",
    n: 12,
    categoria: "gestao",
    enunciado: "A oficina possui processos para a operação?",
    kind: "select",
    options: [
      { value: "sem_processo", label: "Sem processo definido" },
      {
        value: "basico",
        label: "Existe um processo básico, mas nem sempre é seguido",
      },
      { value: "seguidos", label: "Existem processos e são seguidos por todos" },
    ],
  },
  {
    id: "p13_donoGestorPatio",
    n: 13,
    categoria: "gestao",
    enunciado: "O proprietário é o próprio gestor de pátio?",
    kind: "boolean",
    options: [
      { value: true, label: "Sim" },
      { value: false, label: "Não" },
    ],
  },
  {
    id: "p14_sistema",
    n: 14,
    categoria: "gestao",
    enunciado: "Qual o sistema de gestão da oficina?",
    kind: "select",
    options: SISTEMAS,
  },
  {
    id: "p15_softwarePrecificacao",
    n: 15,
    categoria: "gestao",
    enunciado: "Sua oficina possui software de precificação de mão de obra?",
    kind: "boolean",
    options: [
      { value: true, label: "Sim" },
      { value: false, label: "Não" },
    ],
  },
  {
    id: "p16_canal",
    n: 16,
    categoria: "comercial",
    enunciado: "Qual o principal canal de chegada dos clientes à oficina?",
    kind: "select",
    options: CANAIS,
  },
  {
    id: "p17_conversaoPosVenda",
    n: 17,
    categoria: "comercial",
    enunciado:
      "Existe acompanhamento de conversão de orçamentos e relacionamento pós-venda?",
    kind: "boolean",
    options: [
      { value: true, label: "Sim" },
      { value: false, label: "Não" },
    ],
  },
  {
    id: "p18_recorrencia",
    n: 18,
    categoria: "comercial",
    enunciado: "Existe acompanhamento da recorrência de clientes?",
    kind: "boolean",
    options: [
      { value: true, label: "Sim" },
      { value: false, label: "Não" },
    ],
  },
  {
    id: "p19_faturamentoDiario",
    n: 19,
    categoria: "comercial",
    enunciado: "Existe acompanhamento do faturamento diário?",
    kind: "boolean",
    options: [
      { value: true, label: "Sim" },
      { value: false, label: "Não" },
    ],
  },
];

export const CATEGORIA_LABEL: Record<Question["categoria"], string> = {
  financeiro: "Financeiro",
  operacao: "Operação",
  gestao: "Gestão",
  comercial: "Comercial",
};
