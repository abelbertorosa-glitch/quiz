import Link from "next/link";
import { publicAsset, publicPath } from "@/lib/pdf-path";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href={publicPath("/")} className="brand">
      {/* next/image optimizer requests /logo without basePath and 404s. */}
      <img
        src={publicAsset("/logo-cambel.png")}
        alt="Cambel Contabilidade"
        className="brand-mark"
        width={88}
        height={88}
      />
      {compact ? null : (
        <span className="brand-label">Diagnóstico de oficina</span>
      )}
    </Link>
  );
}
