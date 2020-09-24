const { readJsonSync, outputFileSync, readFileSync } = require("fs-extra");
const { join, dirname } = require("path");
const pkg = require("../package.json");

const ROOT_DIR = dirname(__dirname);
const POG_DIR = join(ROOT_DIR, pkg.types);

const endpoints = readJsonSync(join(ROOT_DIR, "src/endpoints.json"));
const rootEndpoints = readJsonSync(join(ROOT_DIR, "src/rootEndpoints.json"));
const typeContent = readFileSync(POG_DIR, { encoding: "utf-8" });

let type = "class PatchYoloClass {\n";

for (const [n] of endpoints) {
  type += `\t${n}: <T = any>(input?: string | number | (string | number)[]) => Promise<T>;\n`;
}

for (const [n] of rootEndpoints) {
  type += `\t${n}: <T = any>(config?: Partial<Config> = {}) => Promise<T>;\n`;
}

type += `}\n`;

outputFileSync(
  POG_DIR,
  typeContent.replace("class Pokedex", "class Pokedex extends PatchYoloClass") +
    type,
  { encoding: "utf-8" }
);
