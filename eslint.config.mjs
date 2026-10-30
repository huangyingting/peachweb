import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
    ignores: [
      ".next/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
];

export default eslintConfig;
