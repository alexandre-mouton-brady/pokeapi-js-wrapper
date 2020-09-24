import { babel } from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import cjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import pkg from "./package.json";

/**
 * @type {import('rollup').RollupOptions}
 */
const defaultConfig = {
  input: "src/index.ts",
  output: [
    {
      file: pkg.module,
      format: "esm",
    },
    {
      file: pkg.main,
      format: "commonjs",
    },
  ],
  plugins: [
    json(),
    replace({ "process.env.NODE_ENV": process.env.NODE_ENV || "production" }),
    babel({
      babelHelpers: "bundled",
      presets: ["@babel/preset-typescript"],
      extensions: [".js", ".json", ".ts"],
    }),
    cjs({ extensions: [".js", ".json", ".ts"] }),
    nodeResolve({
      preferBuiltins: false,
      module: true,
      jsnext: true,
      main: true,
      browser: true,
      extensions: [".js", ".json", ".ts"],
    }),
  ],
};

export default [
  { ...defaultConfig, external: ["redaxios", "idb-keyval"] },
  {
    ...defaultConfig,
    output: {
      file: pkg.browser,
      name: "Pokedex",
      format: "umd",
      plugins: [terser()],
    },
  },
];
