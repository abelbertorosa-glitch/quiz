const BASE = "/diagnostico";

function withSlash(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

/** Path for Next <Link> and router.push. Next already prefixes `basePath`. */
export function publicPath(path: string): string {
  const p = withSlash(path);
  if (p === BASE || p.startsWith(`${BASE}/`)) {
    return p.slice(BASE.length) || "/";
  }
  return p;
}

/** Raw href including basePath. Use on plain <a> and <img>, not Next Link. */
export function publicAsset(path: string): string {
  const p = withSlash(path);
  if (p === BASE || p.startsWith(`${BASE}/`)) return p;
  return `${BASE}${p}`;
}

export function publicPdfPath(id: string): string {
  return publicAsset(`/api/pdf/${id}`);
}
