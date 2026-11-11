// Generates the spellings a user might type for a Serbian word:
// Cyrillic (буџет), Latin (budžet) and Latin without diacritics (budzet).

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'đ', е: 'e', ж: 'ž', з: 'z', и: 'i',
  ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', ћ: 'ć', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'č', џ: 'dž', ш: 'š',
};

const WITHOUT_DIACRITICS: Record<string, string> = {
  č: 'c', ć: 'c', ž: 'z', š: 's', đ: 'dj',
  Č: 'C', Ć: 'C', Ž: 'Z', Š: 'S', Đ: 'Dj',
};

export const CYRILLIC = /[Ѐ-ӿ]/;

export function cyrillicToLatin(text: string): string {
  const chars = [...text];
  return chars
    .map((char, i) => {
      const lower = char.toLowerCase();
      const latin = CYRILLIC_TO_LATIN[lower];
      if (latin === undefined) return char;
      if (char === lower) return latin;
      // Љ -> Lj in "Љубовија", but LJ in "ЉУБОВИЈА"
      const next = chars[i + 1];
      const nextIsUpper = next !== undefined && next !== next.toLowerCase();
      return nextIsUpper ? latin.toUpperCase() : latin[0].toUpperCase() + latin.slice(1);
    })
    .join('');
}

export function stripDiacritics(text: string): string {
  return [...text].map((c) => WITHOUT_DIACRITICS[c] ?? c).join('');
}

export function spellingVariants(cyrillic: string) {
  const latin = cyrillicToLatin(cyrillic);
  return { cyrillic, latin, ascii: stripDiacritics(latin) };
}
