/**
 * i18next-cli configuration.
 *
 * The project uses English source strings as keys, so English is the "source"
 * locale and zh-CN is the only catalog that needs manual translations.
 */
export default {
  locales: ['en', 'zh-CN'],
  extract: {
    input: ['src/**/*.{ts,tsx}'],
    output: 'src/i18n/locales/{{language}}.json',
  },
};
