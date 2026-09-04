import Link from "next/link";
import { Brand } from "@/components/Brand";
import { publicPath } from "@/lib/pdf-path";

export default function Home() {
  return (
    <div className="flex min-h-[100svh] flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <div className="flex w-full max-w-4xl flex-col items-center">
          <header className="no-print mb-8">
            <Brand compact />
          </header>
          <h1 className="text-wipe whitespace-nowrap pb-[0.18em] text-[clamp(1.2rem,6.4vw,2.75rem)] font-bold leading-[1.15] text-[var(--navy)]">
            Diagnóstico da sua oficina
          </h1>
          <p
            className="text-wipe mt-4 max-w-lg whitespace-nowrap text-[clamp(0.88rem,3.4vw,1.125rem)] leading-6 text-[var(--muted)]"
            style={{ animationDelay: "0.05s" }}
          >
            19 perguntas. Resultado e PDF na hora.
          </p>
          <div className="mt-8">
            <Link
              href={publicPath("/quiz")}
              className="btn-primary text-wipe"
              style={{ animationDelay: "0.1s" }}
            >
              Começar
            </Link>
          </div>
        </div>
      </div>
      <footer className="px-6 pb-8 text-center">
        <Link
          href={publicPath("/privacidade")}
          className="privacy-link text-wipe"
          style={{ animationDelay: "0.22s" }}
        >
          Privacidade
        </Link>
      </footer>
    </div>
  );
}
