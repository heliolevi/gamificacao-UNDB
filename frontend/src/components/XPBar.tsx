interface Props {
  xp: number;
  pct: number;
  nextRankXp: number | null;
}

export function XPBar({ xp, pct, nextRankXp }: Props) {
  return (
    <div>
      <div className="xp-bar-track">
        <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
        {xp} XP{nextRankXp !== null ? ` · faltam ${Math.max(0, nextRankXp - xp)} XP para a próxima patente` : " · patente máxima atingida"}
      </p>
    </div>
  );
}
