import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

/**
 * Workaround for DGR-08. The site's theme script replaces Element.classList with an old
 * polyfill, and axe-core crashes on it. The polyfill locks itself onto elements, so it
 * can't be removed after the page loads. Instead, this blocks it from installing, in the
 * test browser only. The page then uses the browser's own classList, which is what the
 * polyfill imitates anyway.
 *
 * Call before page.goto().
 */
export async function useNativeClassList(page: Page) {
  await page.addInitScript(() => {
    const isElement = (obj: unknown) =>
      obj === Element.prototype || (typeof obj === 'object' && obj !== null && Element.prototype.isPrototypeOf(obj));

    const defineProperty = Object.defineProperty;
    Object.defineProperty = function (obj: object, prop: PropertyKey, descriptor: PropertyDescriptor) {
      if (prop === 'classList' && isElement(obj)) return obj;
      return defineProperty(obj, prop, descriptor);
    } as typeof Object.defineProperty;

    const defineProperties = Object.defineProperties;
    Object.defineProperties = function (obj: object, props: PropertyDescriptorMap) {
      if (isElement(obj) && 'classList' in props) {
        const { classList: _skip, ...rest } = props;
        return defineProperties(obj, rest);
      }
      return defineProperties(obj, props);
    } as typeof Object.defineProperties;

    const proto = Object.prototype as unknown as { __defineGetter__: (prop: string, getter: () => unknown) => void };
    const defineGetter = proto.__defineGetter__;
    proto.__defineGetter__ = function (this: object, prop: string, getter: () => unknown) {
      if (prop === 'classList' && isElement(this)) return;
      return defineGetter.call(this, prop, getter);
    };
  });
}

export async function scanAccessibility(page: Page) {
  const notNative = await page.evaluate(
    () =>
      [document.documentElement, ...document.querySelectorAll('*')].filter(
        (el) => typeof (el.classList as unknown as Iterable<string>)?.[Symbol.iterator] !== 'function',
      ).length,
  );
  if (notNative > 0) {
    throw new Error(`${notNative} elements still use the polyfill. Call useNativeClassList(page) before goto().`);
  }
  return new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
}
