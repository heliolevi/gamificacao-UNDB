export interface RankInfo {
  name: string;
  minXp: number;
  nextXp: number | null; // null = patente maxima
  color: string;
  icon: string;
}

// Patentes do IT WORKS. Ordem crescente por minXp.
export const RANKS: RankInfo[] = [
  { name: "Estagiário", minXp: 0, nextXp: 150, color: "#7dffb3", icon: "🌱" },
  { name: "Júnior", minXp: 150, nextXp: 400, color: "#4ee1ff", icon: "⚡" },
  { name: "Pleno", minXp: 400, nextXp: 800, color: "#c86bff", icon: "🔥" },
  { name: "Sênior", minXp: 800, nextXp: 1400, color: "#ff5ecb", icon: "💎" },
  { name: "Staff / Tech Lead", minXp: 1400, nextXp: null, color: "#ffd23f", icon: "👑" },
];

export function rankForXp(xp: number): RankInfo {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXp) current = r;
  }
  return current;
}

export function progressToNext(xp: number): { pct: number; current: RankInfo } {
  const current = rankForXp(xp);
  if (current.nextXp === null) return { pct: 100, current };
  const span = current.nextXp - current.minXp;
  const done = xp - current.minXp;
  const pct = Math.max(0, Math.min(100, Math.round((done / span) * 100)));
  return { pct, current };
}
