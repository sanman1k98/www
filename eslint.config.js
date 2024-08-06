import antfu from "@antfu/eslint-config";

export default antfu(
  {
    stylistic: {
      quotes: "double",
      semi: true,
      overrides: {
        "style/brace-style": [
          "error",
          "1tbs",
          { allowSingleLine: true },
        ],
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
    name: "user/overrides",
    rules: {
      "node/prefer-global/process": ["off"],
    },
  },
  {
    // https://sindresorhus.com/blog/goodbye-nodejs-buffer
    name: "user/node/buffer/rules",
    rules: {
      "node/prefer-global/buffer": ["off"],
      "no-restricted-globals": [
        "error",
        {
          name: "Buffer",
          message: "Use Uint8Array instead.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          name: "buffer",
          message: "Use Uint8Array instead.",
        },
        {
          name: "node:buffer",
          message: "Use Uint8Array instead.",
        },
      ],
      "ts/no-restricted-types": [
        "error",
        {
          types: {
            Buffer: {
              message: "Use Uint8Array instead.",
              suggest: ["Uint8Array"],
            },
          },
        },
      ],
    },
  },
);
