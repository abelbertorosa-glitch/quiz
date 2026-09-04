export type Cargo =
  | "proprietario"
  | "socio"
  | "gestor"
  | "gestor_patio"
  | "outro";

export type Genero = "feminino" | "masculino";

export type Comercializacao = "pecas_servicos" | "somente_servico";

export type ReservaCaixa = "1_mes" | "2_meses_ou_mais" | "sem_caixa";

export type Processos = "sem_processo" | "basico" | "seguidos";

export type SistemaGestao =
  | "ultracar"
  | "syscar"
  | "oficina_inteligente"
  | "onmotors"
  | "griffo"
  | "outros";

export type Canal =
  | "indicacao"
  | "google"
  | "redes_sociais"
  | "fluxo_espontaneo";

export type Tier = "bom" | "mediano" | "atencao";

export type Categoria = "financeiro" | "operacao" | "gestao" | "comercial";

export type Lead = {
  empresa: string;
  cnpj: string;
  anoFundacao: number;
  cidadeUf: string;
  nome: string;
  cargo: Cargo;
  idade: number;
  genero: Genero;
  telefone: string;
  email: string;
};

export type Answers = {
  p1_custoFixo: number;
  p2_faturamento: number;
  p3_markup: number;
  p4_reserva: ReservaCaixa;
  p5_antecipa: boolean;
  p6_mecanicos: number;
  p7_comercializacao: Comercializacao;
  p8_horaMinima: number;
  p9_elevadores: number;
  p10_checklist: boolean;
  p11_produtividade: boolean;
  p12_processos: Processos;
  /** true = o proprietário É o gestor de pátio → cenário de atenção */
  p13_donoGestorPatio: boolean;
  p14_sistema: SistemaGestao;
  p15_softwarePrecificacao: boolean;
  p16_canal: Canal;
  p17_conversaoPosVenda: boolean;
  p18_recorrencia: boolean;
  p19_faturamentoDiario: boolean;
};

export type Metricas = {
  idadeEmpresaAnos: number;
  custoFixoSobreFaturamento: number | null;
  horasVendidasPorMecanico: number;
  horasVendidasOficina: number;
  faturamentoServicosEsperado: number;
  faturamentoTotalEsperado: number;
  gapFaturamento: number;
  atingeFaturamentoEsperado: boolean;
  elevadoresPorMecanico: number;
  elevadoresIdeais: number;
  estruturaElevadoresOk: boolean;
  custoHoraProdutiva: number;
  horaMinimaRecomendada: number;
  caixaSaudavel: boolean;
};

export type Finding = {
  id: string;
  categoria: Categoria;
  pergunta: number | "cruzado";
  tier: Tier;
  titulo: string;
  texto: string;
};

export type Diagnosis = {
  metricas: Metricas;
  findings: Finding[];
};

export type Utm = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
};

export type ResponseRecord = {
  id: string;
  createdAt: string;
  lead: Lead;
  answers: Answers;
  diagnosis: Diagnosis;
  utm: Utm;
};
