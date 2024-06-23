import antfu from "@antfu/eslint-config";

export default antfu(
  {
    stylistic: {
      quotes: "double",
      semi: true,
      overrides: {
        "style/multiline-ternary": [
          "error",
          "always-multiline",
          { ignoreJSX: true },
        ],
      },
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
