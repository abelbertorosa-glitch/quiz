import Link from "next/link";
import { Brand } from "@/components/Brand";
import { publicPath } from "@/lib/pdf-path";

export const metadata = {
  title: "Privacidade",
  description:
    "Como a Cambel Contabilidade trata os dados do diagnóstico de oficina, nos termos da LGPD.",
};

export default function PrivacidadePage() {
  return (
    <div className="flex min-h-[100svh] flex-col">
      <div className="shell flex-1">
        <div className="flex justify-center">
          <Brand compact />
        </div>
        <div className="mx-auto max-w-xl">
        <p className="kicker mt-8 text-wipe">LGPD</p>
        <h1 className="text-wipe mt-2 text-4xl font-bold text-[var(--navy)]">
          Privacidade
        </h1>
        <p
          className="text-wipe mt-4 max-w-xl leading-7 text-[var(--muted)]"
          style={{ animationDelay: "0.05s" }}
        >
          A Cambel Contabilidade trata os dados deste diagnóstico para gerar o
          laudo da oficina e, se você deixou contato, para falar sobre o
          resultado e os serviços da casa. Lei nº 13.709/2018.
        </p>

        <section className="mt-10 max-w-xl">
          <h2
            className="text-wipe text-lg font-bold text-[var(--navy)]"
            style={{ animationDelay: "0.08s" }}
          >
            Quem trata
          </h2>
          <p
            className="text-wipe mt-2 leading-7 text-[var(--muted)]"
            style={{ animationDelay: "0.1s" }}
          >
            Cambel Contadores Associados Ltda, organização contábil CRC/MG 13713.
            Responsável técnico: Abel Berto Rosa, CRC 78467/O-4. Endereço: Rua
            Benjamin Dias, 535, sala 43, Barreiro, Belo Horizonte/MG, 30640-520.
          </p>
        </section>

        <section className="mt-8 max-w-xl">
          <h2
            className="text-wipe text-lg font-bold text-[var(--navy)]"
            style={{ animationDelay: "0.12s" }}
          >
            O que coletamos
          </h2>
          <p
            className="text-wipe mt-2 leading-7 text-[var(--muted)]"
            style={{ animationDelay: "0.14s" }}
          >
            Dados da oficina (nome, CNPJ, ano de fundação, cidade e UF), seus
            dados (nome, cargo, idade e gênero), WhatsApp, e-mail, as 19
            respostas do diagnóstico e, se vierem na URL, parâmetros de campanha
            (utm).
          </p>
        </section>

        <section className="mt-8 max-w-xl">
          <h2
            className="text-wipe text-lg font-bold text-[var(--navy)]"
            style={{ animationDelay: "0.16s" }}
          >
            Para que usamos
          </h2>
          <p
            className="text-wipe mt-2 leading-7 text-[var(--muted)]"
            style={{ animationDelay: "0.18s" }}
          >
            Cruzar as respostas, entregar o laudo na tela e em PDF, e contatar
            você sobre o resultado e sobre a Consultoria e Assessoria Gerencial
            da Cambel. Não vendemos esses dados.
          </p>
        </section>

        <section className="mt-8 max-w-xl">
          <h2
            className="text-wipe text-lg font-bold text-[var(--navy)]"
            style={{ animationDelay: "0.2s" }}
          >
            Seus direitos
          </h2>
          <p
            className="text-wipe mt-2 leading-7 text-[var(--muted)]"
            style={{ animationDelay: "0.22s" }}
          >
            Você pode pedir confirmação, acesso, correção, exclusão, portabilidade
            e informação sobre o uso dos seus dados. Fale com a Cambel:
            contato@cambelcontabilidade.com.br ou (31) 3567-9146. Também é
            possível reclamar à ANPD.
          </p>
        </section>
        </div>
      </div>
      <footer className="px-6 pb-8 text-center">
        <Link href={publicPath("/")} className="privacy-link">
          Voltar ao diagnóstico
        </Link>
      </footer>
    </div>
  );
}
