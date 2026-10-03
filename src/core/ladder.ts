export const WORD_LENGTH = 5;

export type StepError = "too-short" | "not-a-word" | "not-one-change";

export const STEP_ERROR_MESSAGES: Record<StepError, string> = {
  "too-short": "Not enough letters",
  "not-a-word": "Not in word list",
  "not-one-change": "Change exactly one letter",
};

export function parseWordList(text: string): string[] {
  return text.split(/\r?\n/).map((w) => w.trim()).filter(Boolean);
}

export function diffCount(a: string, b: string): number {
  let n = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++;
  return n;
}

/** Index of the single letter that differs between two adjacent ladder words, or -1. */
export function changedIndex(prev: string, next: string): number {
  if (diffCount(prev, next) !== 1) return -1;
  for (let i = 0; i < prev.length; i++) if (prev[i] !== next[i]) return i;
  return -1;
}

export function validateStep(prev: string, next: string, valid: ReadonlySet<string>): StepError | null {
  if (next.length < WORD_LENGTH) return "too-short";
  if (!valid.has(next)) return "not-a-word";
  if (diffCount(prev, next) !== 1) return "not-one-change";
  return null;
}

/** Word graph where edges join words that differ by exactly one letter. */
export class WordGraph {
  readonly words: ReadonlySet<string>;
  private readonly buckets = new Map<string, string[]>();

  constructor(words: Iterable<string>) {
    this.words = new Set(words);
    for (const word of this.words) {
      for (const key of bucketKeys(word)) {
        const bucket = this.buckets.get(key);
        if (bucket) bucket.push(word);
        else this.buckets.set(key, [word]);
      }
    }
  }

  neighbors(word: string, allowed?: ReadonlySet<string>): string[] {
    const result: string[] = [];
    for (const key of bucketKeys(word)) {
      for (const other of this.buckets.get(key) ?? []) {
        if (other !== word && (!allowed || allowed.has(other))) result.push(other);
      }
    }
    return result;
  }

  /** BFS distances from `from`, optionally restricted to an `allowed` subset of words. */
  distances(from: string, allowed?: ReadonlySet<string>): Map<string, number> {
    return this.bfs(from, allowed).dist;
  }

  shortestPath(from: string, to: string, allowed?: ReadonlySet<string>): string[] | null {
    const { prev } = this.bfs(from, allowed, to);
    if (from !== to && !prev.has(to)) return null;
    const path = [to];
    while (path[0] !== from) path.unshift(prev.get(path[0])!);
    return path;
  }

  /** Number of steps in the shortest ladder, or null if unreachable. */
  par(from: string, to: string): number | null {
    return this.distances(from).get(to) ?? null;
  }

  private bfs(from: string, allowed?: ReadonlySet<string>, stopAt?: string) {
    const dist = new Map([[from, 0]]);
    const prev = new Map<string, string>();
    const queue = [from];
    for (let head = 0; head < queue.length; head++) {
      const word = queue[head];
      if (word === stopAt) break;
      for (const next of this.neighbors(word, allowed)) {
        if (dist.has(next)) continue;
        dist.set(next, dist.get(word)! + 1);
        prev.set(next, word);
        queue.push(next);
      }
    }
    return { dist, prev };
  }
}

function bucketKeys(word: string): string[] {
  const keys: string[] = [];
  for (let i = 0; i < word.length; i++) keys.push(word.slice(0, i) + "_" + word.slice(i + 1));
  return keys;
}
