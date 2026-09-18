const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  hellip: "…",
  ldquo: "“",
  lsquo: "‘",
  nbsp: " ",
  quot: '"',
  rdquo: "”",
  rsquo: "’",
};

export function decodeHtmlText(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&([a-z]+);/gi, (entity, name: string) =>
      NAMED_ENTITIES[name.toLowerCase()] ?? entity,
    )
    .replace(/\s+/g, " ")
    .trim();
}

export function cleanSeoTitle(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const cleaned = decodeHtmlText(value)
    .replace(/\s+[-|–—]\s*$/, "")
    .trim();

  return cleaned || null;
}

