// Every page exists twice: /sr/ in Cyrillic and /sl/ in Latin (see DGR-04 about "sl").
export type Script = 'cyrillic' | 'latin';

export const PATH_PREFIX: Record<Script, string> = {
  cyrillic: '/sr',
  latin: '/sl',
};

export const UI_TEXT = {
  datasetsHeading: { cyrillic: 'Скупови података', latin: 'Skupovi podataka' },
  totalCount: /([\d.\s]+)\s+(?:сет|set)\S*\s+(?:укупно|ukupno)/i, // "166 сетова укупно"
  languageSelect: /Одабир језика|Odabir jezika/,
};
