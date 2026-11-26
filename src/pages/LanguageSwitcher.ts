import type { Locator, Page } from '@playwright/test';
import { type Script, UI_TEXT } from './Lang';

const OPTION_VALUE: Record<Script, string> = { cyrillic: 'sr', latin: 'sl' };

export class LanguageSwitcher {
  readonly select: Locator;

  constructor(private readonly page: Page) {
    this.select = page.getByRole('combobox', { name: UI_TEXT.languageSelect });
  }

  async switchTo(script: Script) {
    await Promise.all([
      this.page.waitForURL((url) => url.pathname.startsWith(`/${OPTION_VALUE[script]}/`)),
      this.select.selectOption(OPTION_VALUE[script]),
    ]);
  }
}
