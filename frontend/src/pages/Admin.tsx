import { QRCodeSVG } from "qrcode.react";
import { FormEvent, useEffect, useState } from "react";
import { ApiActivity, api } from "../api";

const TYPE_LABELS: Record<string, string> = {
  palestra: "Palestra",
  workshop: "Workshop",
  mesa_redonda: "Mesa Redonda",
  keynote: "Keynote",
  oficina: "Oficina",
};

export function Admin() {
  const [activities, setActivities] = useState<ApiActivity[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("palestra");
  const [projecting, setProjecting] = useState<ApiActivity | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await api.listActivities();
    setActivities(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const activity = await api.createActivity({ name, type });
      setName("");
      await load();
      setProjecting(activity);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar atividade");
    }
  }

  if (projecting) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <span className="tag">{TYPE_LABELS[projecting.type] ?? projecting.type} · +{projecting.points} XP</span>
        <h1 style={{ textAlign: "center", fontSize: "2.2rem" }}>{projecting.name}</h1>
        <div className="qr-wrap">
          <QRCodeSVG value={projecting.qrPayload} size={320} />
        </div>
        <p>Escaneie para pontuar sua presença nesta atividade</p>
        <button className="btn btn-outline" onClick={() => setProjecting(null)}>
          Voltar ao painel
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "30px auto" }}>
      <div className="section-title">
        <span className="bar" />
        <h2>Painel do Organizador</h2>
      </div>

      <div className="grid-2">
        <form onSubmit={handleCreate} className="panel glow-magenta">
          <h3>Nova Atividade</h3>
          <div className="field">
            <label>Nome da atividade</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Palestra de Abertura"
              required
            />
          </div>
          <div className="field">
            <label>Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {error && <div className="error-text">⚠ {error}</div>}
          <button className="btn btn-magenta" type="submit">
            Criar e Projetar QR
          </button>
        </form>

        <div className="panel glow-cyan">
          <h3>Atividades criadas</h3>
          {activities.length === 0 && <p>Nenhuma atividade ainda.</p>}
          {activities.map((a) => (
            <div key={a.id} className="activity-row">
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem" }}>{a.name}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {TYPE_LABELS[a.type] ?? a.type} · +{a.points} XP
                </div>
              </div>
              <button className="btn btn-outline" onClick={() => setProjecting(a)}>
                Projetar QR
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
