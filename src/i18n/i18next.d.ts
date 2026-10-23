/**
 * Type augmentation for i18next.
 *
 * Keys are English source strings, so `en.json` mirrors every key. With this
 * augmentation a typo such as `t('Sav')` fails at compile time instead of
 * silently rendering the key at runtime.
 */

import 'i18next';
import type en from './locales/en.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof en;
    };
    keySeparator: false;
    nsSeparator: false;
    returnNull: false;
  }
}
