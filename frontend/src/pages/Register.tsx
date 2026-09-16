import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, storeUserId } from "../api";

const INTEREST_OPTIONS = [
  "Front-end",
  "Back-end",
  "Mobile",
  "Dados / IA",
  "DevOps / Cloud",
  "UX/UI",
  "Segurança",
  "Games",
  "QA",
  "Produto",
];

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [period, setPeriod] = useState("");
  const [course, setCourse] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleInterest(i: string) {
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await api.createUser({ name, period, course, interests });
      storeUserId(user.id);
      navigate("/perfil");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar perfil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "40px auto" }}>
      <div className="section-title">
        <span className="bar" />
        <h2>Criar Perfil de Jogador</h2>
      </div>

      <form onSubmit={handleSubmit} className="panel glow-cyan">
        <div className="field">
          <label>Nome completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Hélio Levi"
            required
          />
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Período</label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="Ex: 5º período"
              required
            />
          </div>
          <div className="field">
            <label>Curso</label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Ex: Ciência da Computação"
              required
            />
          </div>
        </div>

        <div className="field">
          <label>Áreas de interesse</label>
          <div className="chip-select">
            {INTEREST_OPTIONS.map((i) => (
              <div
                key={i}
                className={`chip ${interests.includes(i) ? "selected" : ""}`}
                onClick={() => toggleInterest(i)}
              >
                {i}
              </div>
            ))}
          </div>
        </div>

        {error && <div className="error-text">⚠ {error}</div>}

        <button className="btn" type="submit" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? "Criando..." : "Gerar meu QR Code"}
        </button>
      </form>
    </div>
  );
}
