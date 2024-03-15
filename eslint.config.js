import antfu from '@antfu/eslint-config';

export default antfu({
  stylistic: {
    quotes: "double",
    semi: true,
  },
  astro: true,
  unocss: true,
});
