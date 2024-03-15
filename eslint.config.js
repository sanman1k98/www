import antfu from "@antfu/eslint-config";

export default antfu(
  {
    stylistic: {
      quotes: "double",
      semi: true,
    },
    astro: true,
    unocss: true,
  },
  {
    rules: {
      "node/prefer-global/process": ["error", "always"],
    },
  },
);
