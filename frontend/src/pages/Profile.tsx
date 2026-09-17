import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiUser, api } from "../api";
import { RankBadge } from "../components/RankBadge";
import { XPBar } from "../components/XPBar";
import { useAuth } from "../context/AuthContext";

export function Profile() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!authUser) return;
    try {
      const u = await api.getUser(authUser.id);
      setUser(u);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id]);

  if (loading || !user) {
    return <p style={{ textAlign: "center", marginTop: 60 }}>Carregando…</p>;
  }

  return (
    <div style={{ maxWidth: 720, margin: "30px auto" }}>
      <div className="section-title">
        <span className="bar" />
        <h2>Meu Perfil</h2>
      </div>

      {error && <div className="error-text">⚠ {error}</div>}

      <div className="panel glow-cyan">
        <div className="grid-2">
          <div>
            <h1 style={{ fontSize: "1.6rem" }}>{user.name}</h1>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
              {user.course}
              {user.period ? ` · ${user.period}` : ""}
            </p>
            <div style={{ margin: "14px 0" }}>
              <RankBadge rank={user.rank} color={user.rankColor} icon={user.rankIcon} />
            </div>
            <XPBar xp={user.xp} pct={user.rankProgressPct} nextRankXp={user.nextRankXp} />

            {user.interests.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <label
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.7rem",
                    color: "var(--neon-cyan)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Interesses
                </label>
                <div className="chip-select" style={{ marginTop: 8 }}>
                  {user.interests.map((i) => (
                    <div key={i} className="chip selected">
                      {i}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="stat-grid">
              <div className="stat-box">
                <div className="value">{user.stats?.presences ?? 0}</div>
                <div className="label">Presenças</div>
              </div>
              <div className="stat-box">
                <div className="value">{user.stats?.connections ?? 0}</div>
                <div className="label">Conexões</div>
              </div>
              <div className="stat-box">
                <div className="value">{user.xp}</div>
                <div className="label">XP Total</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <div className="qr-wrap">
              <QRCodeSVG value={user.qrPayload} size={180} />
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "center" }}>
              Mostre este QR para alguém escanear e ganhar XP de networking
            </p>
            <Link to="/scanner" className="btn btn-outline">
              Ir para o Scanner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
