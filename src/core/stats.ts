export const DISTRIBUTION_BUCKETS = ["0", "1", "2", "3", "4+", "gave-up"] as const;
export type DistributionBucket = (typeof DISTRIBUTION_BUCKETS)[number];

export interface Stats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDay: number | null;
  lastWonDay: number | null;
  /** Daily results bucketed by steps over par. */
  distribution: Record<DistributionBucket, number>;
}

export function emptyStats(): Stats {
  return {
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedDay: null,
    lastWonDay: null,
    distribution: { "0": 0, "1": 0, "2": 0, "3": 0, "4+": 0, "gave-up": 0 },
  };
}

export function bucketFor(steps: number, par: number): DistributionBucket {
  const over = steps - par;
  return over >= 4 ? "4+" : (String(over) as DistributionBucket);
}

export type DailyResult = { day: number; gaveUp: true } | { day: number; gaveUp: false; steps: number; par: number };

/** Records a finished daily puzzle. Recording the same day twice is a no-op. */
export function recordResult(stats: Stats, result: DailyResult): Stats {
  if (stats.lastPlayedDay === result.day) return stats;
  const next: Stats = {
    ...stats,
    played: stats.played + 1,
    lastPlayedDay: result.day,
    distribution: { ...stats.distribution },
  };
  if (result.gaveUp) {
    next.distribution["gave-up"]++;
    next.currentStreak = 0;
    return next;
  }
  next.distribution[bucketFor(result.steps, result.par)]++;
  next.won++;
  next.currentStreak = stats.lastWonDay === result.day - 1 ? stats.currentStreak + 1 : 1;
  next.maxStreak = Math.max(stats.maxStreak, next.currentStreak);
  next.lastWonDay = result.day;
  return next;
}

/** The streak shown today: it is broken once a full day passes without a win. */
export function displayStreak(stats: Stats, today: number): number {
  return stats.lastWonDay !== null && stats.lastWonDay >= today - 1 ? stats.currentStreak : 0;
}
