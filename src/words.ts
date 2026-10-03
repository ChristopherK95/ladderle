import { parseWordList, WordGraph } from "./core/ladder.ts";
import validText from "./data/valid-words.txt?raw";
import commonText from "./data/common-words.txt?raw";
import dailyList from "./data/daily.json";

export const validWords: ReadonlySet<string> = new Set(parseWordList(validText));
export const commonWords: readonly string[] = parseWordList(commonText);
export const commonSet: ReadonlySet<string> = new Set(commonWords);
export const graph = new WordGraph(validWords);
export const daily: readonly string[] = dailyList;
