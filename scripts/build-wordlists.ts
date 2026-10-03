// Builds src/data/valid-words.txt and src/data/common-words.txt from raw sources.
//
// Usage: node scripts/build-wordlists.ts <path/to/enable1.txt> <path/to/scowl/final>
//
// Sources:
//   ENABLE (public domain): https://github.com/dolph/dictionary/blob/master/enable1.txt
//   SCOWL 2020.12.07: https://sourceforge.net/projects/wordlist/files/SCOWL/
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const COMMON_SIZE = 35;
const BASE_SIZE = 50;
const SCOWL_SIZES = [10, 20, 35, 40, 50];
const SCOWL_LISTS = ["english-words", "american-words"];

const [enablePath, scowlDir] = process.argv.slice(2);
if (!enablePath || !scowlDir) {
  console.error("Usage: node scripts/build-wordlists.ts <enable1.txt> <scowl/final>");
  process.exit(1);
}

const isWord5 = (w: string) => /^[a-z]{5}$/.test(w);

function readScowl(maxSize: number): Set<string> {
  const words = new Set<string>();
  for (const size of SCOWL_SIZES.filter((s) => s <= maxSize)) {
    for (const list of SCOWL_LISTS) {
      const text = readFileSync(join(scowlDir, `${list}.${size}`), "latin1");
      for (const line of text.split(/\r?\n/)) {
        if (/^[a-z]+$/.test(line)) words.add(line);
      }
    }
  }
  return words;
}

// Plurals and past tenses ("wisps", "mooed") make poor puzzle endpoints.
function isInflection(word: string, base: Set<string>): boolean {
  if (word.endsWith("s") && !word.endsWith("ss")) {
    if (base.has(word.slice(0, -1))) return true;
    if (word.endsWith("es") && base.has(word.slice(0, -2))) return true;
    if (word.endsWith("ies") && base.has(word.slice(0, -3) + "y")) return true;
  }
  if (word.endsWith("ed")) {
    if (base.has(word.slice(0, -2)) || base.has(word.slice(0, -1))) return true;
    if (word[2] === word[3] && base.has(word.slice(0, -3))) return true;
  }
  return false;
}

const valid = new Set(
  readFileSync(enablePath, "utf8").split(/\r?\n/).map((w) => w.trim()).filter(isWord5),
);
const base = readScowl(BASE_SIZE);
const common = [...readScowl(COMMON_SIZE)]
  .filter((w) => isWord5(w) && valid.has(w) && !isInflection(w, base))
  .sort();

writeFileSync("src/data/valid-words.txt", [...valid].sort().join("\n") + "\n");
writeFileSync("src/data/common-words.txt", common.join("\n") + "\n");
console.log(`valid: ${valid.size}, common: ${common.length}`);
