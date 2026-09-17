import { useEffect, useState } from "react";
import { LeaderboardEntry, api } from "../api";

const MEDALS = ["🥇", "🥈", "🥉"];
const PREVIEW_COUNT = 7;

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  async function load() {
    try {
      const data = await api.getLeaderboard(1000);
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const top3 = entries.slice(0, 3);
  const restAll = entries.slice(3);
  const rest = showAll ? restAll : restAll.slice(0, PREVIEW_COUNT);
  const hiddenCount = restAll.length - rest.length;
  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd for visual podium

  return (
    <div style={{ maxWidth: 760, margin: "30px auto" }}>
      <div className="section-title">
        <span className="bar" />
        <h2>Ranking ao Vivo</h2>
      </div>

      {loading && <p>Carregando…</p>}

      {!loading && entries.length === 0 && (
        <div className="panel" style={{ textAlign: "center" }}>
          <p>Ninguém pontuou ainda. Seja o primeiro! 🚀</p>
        </div>
      )}

      {top3.length > 0 && (
        <div className="podium">
          {podiumOrder.map((entry, idx) =>
            entry ? (
              <div key={entry.id} className="podium-slot">
                <span className={`medal ${idx === 1 ? "place-1" : ""}`}>{MEDALS[entry.position - 1]}</span>
                <div className="name">{entry.name}</div>
                <div className="xp">{entry.xp} XP</div>
              </div>
            ) : null
          )}
        </div>
      )}

      {rest.length > 0 && (
        <div className="panel glow-cyan">
          {rest.map((entry) => (
            <div key={entry.id} className="lb-row">
              <div className="position">#{entry.position}</div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem" }}>{entry.name}</div>
                <div className="meta">
                  {entry.course}
                  {entry.period ? ` · ${entry.period}` : ""}
                </div>
              </div>
              <div style={{ color: entry.rankColor, fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                {entry.rankIcon} {entry.rank}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", color: "var(--neon-cyan)" }}>{entry.xp} XP</div>
            </div>
          ))}
        </div>
      )}

      {restAll.length > PREVIEW_COUNT && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button className="btn btn-outline" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Mostrar menos" : `Ver ranking completo (+${hiddenCount})`}
          </button>
        </div>
      )}
    </div>
  );
}
