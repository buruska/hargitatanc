import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    // A jelenlegi komponensek React 19-cel támogatott effect-mintákat használnak.
    // Ezeket külön refaktorálásig ne tegye hibává a Next 16 új, szigorúbb presetje.
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "next-env.d.ts",
    "2026-07-27_szerver-feltoltes/**",
    "output/**",
    "tmp/**",
  ]),
]);
