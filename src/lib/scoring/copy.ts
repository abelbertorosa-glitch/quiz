import type {
  Canal,
  Metricas,
  Processos,
  SistemaGestao,
  Tier,
} from "@/lib/types";
import { CONSULTORIA_URL } from "./constants";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const textos = {
  custoFixo(pct: number, dentro: boolean) {
    return dentro
      ? `Sua oficina está com custo fixo em ${pct}% do faturamento, dentro da faixa saudável de 25% a 32%. Quanto menor essa proporção, mais saudável tende a ser a estrutura de custos.`
      : `O custo fixo representa ${pct}% do faturamento. A referência da Cambel para oficinas que vendem peças e serviços é 25% a 32%. Quanto menor essa proporção, mais saudável a estrutura. Vale revisar despesas fixas e a composição do faturamento.`;
  },

  soServico() {
    return "O indicador de custo fixo sobre faturamento só se aplica a oficinas que vendem peças e serviços juntos. Quem vende só serviço deixa margem na mesa: a comercialização combinada é o caminho para melhorar a lucratividade bruta.";
  },

  markup(valor: number, tier: Tier) {
    const faixa =
      tier === "bom"
        ? "no patamar de mercado (100% ou mais)"
        : tier === "mediano"
          ? "abaixo do ideal de mercado, mas ainda recuperável"
          : "bem abaixo do ideal de 100%";
    return `Markup médio informado: ${valor}%. Esse número está ${faixa}. A régua geral é 100% sobre o custo da peça, o que tende a gerar margem de contribuição próxima de 60%. Duas exceções valem em qualquer faixa: peça de baixo valor pode e deve chegar a 400%, de preferência comprada em distribuidora; peça acima de R$ 5.000 (concessionária) já aceita markup perto de 30%, e se for menor que isso o ganho deve vir da mão de obra de instalação.`;
  },

  caixa(saudavel: boolean) {
    return saudavel
      ? "Reserva de 2 meses ou mais e sem antecipação de cartão: sua oficina está no grupo de caixa saudável, cerca de 5% das oficinas do país, na referência da Cambel."
      : "Caixa ainda não está no patamar saudável. A combinação que a Cambel considera referência é reserva de 2 meses ou mais e não antecipar cartão. Vale trabalhar gestão de fluxo de caixa até chegar lá.";
  },

  antecipacao(antecipa: boolean, idadeAnos: number) {
    if (!antecipa) {
      return "Não antecipar cartão preserva recebíveis programados, reduz despesa financeira e fortalece o capital de giro. Na visão da Cambel, receber hoje não significa fluxo melhor: saber esperar o recebimento é estratégia de resultado.";
    }
    if (idadeAnos <= 5) {
      return `A oficina tem cerca de ${idadeAnos} ano(s). Até 5 anos, a antecipação pode ser ferramenta de transição enquanto o capital de giro próprio se forma. O ponto de atenção é não transformar isso em dependência permanente. O objetivo não é simplesmente deixar de antecipar. É ter caixa suficiente para não precisar.`;
    }
    return `Com mais de 5 anos de operação (${idadeAnos} anos), a recomendação é fortalecer o capital de giro próprio e reduzir a antecipação. Três ganhos: menos despesa financeira, mais previsibilidade e segurança para férias coletivas ou meses fracos.`;
  },

  faturamentoEsperado(m: Metricas, informado: number) {
    const base = `Cada mecânico deveria vender ${m.horasVendidasPorMecanico.toFixed(1)} horas/mês (70% de 176). A oficina inteira: ${m.horasVendidasOficina.toFixed(1)} horas. Faturamento mínimo de serviços: ${brl(m.faturamentoServicosEsperado)}. Como serviço é 40% do faturamento, o total esperado é ${brl(m.faturamentoTotalEsperado)}. Você informou ${brl(informado)}.`;
    if (m.atingeFaturamentoEsperado) {
      return `${base} A oficina está no patamar das que entregam resultado financeiro aos sócios.`;
    }
    return `${base} O faturamento atual está abaixo da capacidade. Ordem de ajuste da Cambel: markup, precificação de mão de obra, gestão estratégica, processo de venda, checklist de entrada e gestão de pessoas. A Consultoria e Assessoria Gerencial foi desenhada para esse salto: ${CONSULTORIA_URL}`;
  },

  horaMinima(praticada: number, m: Metricas) {
    return `Hora mínima praticada: ${brl(praticada)}. Custo da hora produtiva (custo fixo ÷ 176h ÷ mecânicos): ${brl(m.custoHoraProdutiva)}. Com markup de 100%, a hora mínima recomendada é ${brl(m.horaMinimaRecomendada)}. A expectativa calculada a partir da hora mínima é conservadora. Particularidades do veículo e do cliente podem subir a venda de hora.`;
  },

  elevadores(mecanicos: number, elevadores: number, m: Metricas) {
    return m.estruturaElevadoresOk
      ? `${elevadores} elevadores para ${mecanicos} mecânicos (${m.elevadoresPorMecanico.toFixed(2)} por mecânico). A referência é 1,5. Exemplo: 3 elevadores para 2 mecânicos.`
      : `${elevadores} elevadores para ${mecanicos} mecânicos. O ideal é ${m.elevadoresIdeais.toFixed(1)} (1,5 por mecânico). Estrutura abaixo disso compromete a operação e o potencial de faturamento.`;
  },

  checklist(sim: boolean) {
    return sim
      ? "Checklist de entrada e saída coloca a oficina entre as que praticam boa venda. Além de padronizar a oferta, gera valor para o cliente: serviços que ele talvez não soubesse que precisava."
      : "Implementar checklist de vendas pode aumentar em até 10% a venda geral. Também permite oferecer ao cliente soluções que ele não pediria sozinho.";
  },

  produtividade(sim: boolean) {
    return sim
      ? "O controle por técnico mostra, com dado, se cada um gera a produtividade e a lucratividade esperadas, e onde dá para aproveitar melhor a especialização."
      : "Sem controle individual, a gestão fica no feeling. Mecânico ocupado não é o mesmo que mecânico que vende hora e gera lucro. Priorize essa metodologia.";
  },

  processos(nivel: Processos) {
    if (nivel === "seguidos") {
      return "Processos definidos e seguidos por todos colocam a oficina entre as que se destacam. Qualidade na jornada inteira do veículo e mais facilidade para o dono se ausentar. Empresas assim conseguem premiação pelo sucesso do cliente (sem retrabalho), em vez de só comissão por venda.";
    }
    if (nivel === "basico") {
      return "Roteiro básico existe, mas se não é seguido à risca a decisão fica a critério de cada colaborador. Roteiros precisam de detalhe. Sem disciplina, a qualidade do atendimento e do serviço cai.";
    }
    return "É preciso processo desde o primeiro contato visual com o cliente: cumprimento, expressão, cadastro do veículo. O padrão do fundador tem que valer mesmo quando ele não está no balcão.";
  },

  gestorPatio(donoEGestor: boolean) {
    return donoEGestor
      ? "O proprietário ser o próprio gestor de pátio é o cenário de risco: alta dependência no dia a dia. Comece a treinar um substituto. O empresário precisa de tempo para gestão estratégica, eventos do setor e férias sem parar a oficina."
      : "Já existe gestor de pátio dedicado. Mantenha líderes, processos e responsabilidades para a operação seguir sem o dono.";
  },

  sistema(sistema: SistemaGestao) {
    const elogio: Record<SistemaGestao, string> = {
      ultracar: "Ultracar: bom controle geral da operação.",
      syscar: "Syscar: sistema excelente, com boa facilidade em vários pontos da gestão.",
      oficina_inteligente: "Oficina Inteligente: o cliente está bem assessorado.",
      onmotors: "Onmotors: atende muito bem as oficinas mecânicas.",
      griffo: "Griffo: sistema simples, direto e objetivo.",
      outros:
        "Se o sistema não for específico para oficina, a operação pode estar perdendo produtividade. Sistemas especializados registram o que a gestão realmente precisa.",
    };
    return `${elogio[sistema]} A Cambel se conecta a cada software para extrair os indicadores que mudam o negócio e aceleram a decisão do gestor.`;
  },

  precificacao(tem: boolean) {
    return tem
      ? "Software de precificação significa padrão de margem e tabelas diferentes por perfil de cliente. Isso ajuda os sócios a alcançar a contribuição desejada."
      : "A Cambel recomenda um software especializado, o parceiro Tempário, com precificadores para leve, moto e caminhão e tabelas por tipo de cliente (locadora, empresa, PF). Em clientes da Cambel, a implantação já trouxe aumento de faturamento na ordem de 25%.";
  },

  canal(canal: Canal) {
    switch (canal) {
      case "indicacao":
        return "Indicação é forte, mas depender só dela não é saudável no longo prazo. Vale investir em Google com gestão profissional e manter a indicação como processo, não como acaso.";
      case "google":
        return "Google é excelente canal. Mantenha o perfil atualizado, de preferência com gestão profissional, e estimule indicação no momento da entrega do veículo, não só de forma espontânea.";
      case "redes_sociais":
        return "Converter cliente de oficina por rede social é resultado positivo e incomum: a maioria só visualiza. Mesmo assim, não deixe o Google Meu Negócio de lado.";
      case "fluxo_espontaneo":
        return "Fluxo espontâneo costuma indicar bom ponto e fachada. Continue o marketing constante: redes para mostrar o trabalho e Google Meu Negócio atualizado, com apoio profissional.";
    }
  },

  conversao(sim: boolean) {
    return sim
      ? "Acompanhar conversão é fundamental, mas alta aprovação de orçamento não é sinônimo de lucratividade. Pode haver preço defasado, sobretudo em cliente antigo. O pós-venda tira a satisfação do campo da suposição e vira avaliação no Google."
      : "Sem rotina de conversão e pós-venda, a oficina perde venda e não vê insatisfação. Cliente insatisfeito quase nunca reclama: só não volta e não indica. Estruture o acompanhamento e peça avaliação no Google a quem ficou bem.";
  },

  recorrencia(sim: boolean) {
    return sim
      ? "Recorrência é previsibilidade de faturamento. Nenhum cliente deve sair sem a próxima recomendação de retorno, quando for tecnicamente aplicável. Cliente de 6 meses a 1 ano sem contato é carteira para reativar. Recorrência não é esperar o cliente voltar. É criar motivo e data para ele voltar."
      : "Não acompanhar recorrência é deixar de enxergar a principal fonte de faturamento: a carteira que você já tem. Sem saber quem sumiu e quando é a próxima manutenção, a oficina vive de demanda espontânea.";
  },

  faturamentoDiario(sim: boolean) {
    return sim
      ? "Acompanhar o faturamento todo dia é controlar a velocidade da viagem, não só o km no fim. Dá para ver o ponto de equilíbrio ainda dentro do mês e corrigir antes do dia 20."
      : "Sem acompanhamento diário, a oficina só descobre o rombo no fechamento, quando já não dá para recuperar o mês. Isso pressiona o caixa.";
  },
};
