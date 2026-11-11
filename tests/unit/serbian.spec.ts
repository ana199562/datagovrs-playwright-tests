import { test, expect } from '@playwright/test';
import { cyrillicToLatin, spellingVariants, stripDiacritics } from '../../src/utils/serbian';

// Checks the helper that generates spellings for TC-S09.
test.describe('Transliteration helper', () => {
  for (const [cyrillic, latin] of [
    ['буџет', 'budžet'],
    ['Шабац', 'Šabac'],
    ['Љубовија', 'Ljubovija'],
    ['Њујорк', 'Njujork'],
    ['Џеп', 'Džep'],
    ['ЉУБОВИЈА', 'LJUBOVIJA'],
    ['Ђорђе Ћосић', 'Đorđe Ćosić'],
    ['Нови Сад 2026.', 'Novi Sad 2026.'],
  ] as const) {
    test(`${cyrillic} -> ${latin}`, () => {
      expect(cyrillicToLatin(cyrillic)).toBe(latin);
    });
  }

  test('leaves Latin text and digits untouched', () => {
    expect(cyrillicToLatin('Open data 2026')).toBe('Open data 2026');
  });

  test('strips diacritics', () => {
    expect(stripDiacritics('Đorđe Ćosić, Šabac, budžet, čaj')).toBe('Djordje Cosic, Sabac, budzet, caj');
  });

  test('returns all three spellings', () => {
    expect(spellingVariants('буџет')).toEqual({ cyrillic: 'буџет', latin: 'budžet', ascii: 'budzet' });
  });
});
