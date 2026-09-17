import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

export function Login() {
  const { user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"entrar" | "cadastro">("entrar");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isStudent, setIsStudent] = useState(true);
  const [period, setPeriod] = useState("");
  const [course, setCourse] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  function toggleInterest(i: string) {
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  }

  if (!loading && user) {
    return <Navigate to="/perfil" replace />;
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(loginEmail, loginPassword);
      navigate("/perfil");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register({
        name,
        email,
        password,
        isStudent,
        period: isStudent ? period : undefined,
        course,
        interests,
      });
      navigate("/perfil");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <section className="hero">
        <div className="eyebrow">SOFTWARE HOUSE</div>
        <h1>
          IT WORKS
          <br />
          GAMIFICAÇÃO DO EVENTO
        </h1>
      </section>

      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${tab === "entrar" ? "active" : ""}`}
            onClick={() => {
              setTab("entrar");
              setError(null);
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`auth-tab ${tab === "cadastro" ? "active" : ""}`}
            onClick={() => {
              setTab("cadastro");
              setError(null);
            }}
          >
            Criar conta
          </button>
        </div>

        {tab === "entrar" ? (
          <form onSubmit={handleLogin} className="panel glow-cyan">
            <div className="field">
              <label>E-mail</label>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                required
              />
            </div>
            <div className="field">
              <label>Senha</label>
              <div className="password-field">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowLoginPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showLoginPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>
            {error && <div className="error-text">⚠ {error}</div>}
            <button className="btn" type="submit" disabled={busy} style={{ marginTop: 10, width: "100%" }}>
              {busy ? "Entrando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="panel glow-cyan">
            <div className="field">
              <label>Nome completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>
            <div className="field">
              <label>E-mail</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                required
              />
            </div>
            <div className="field">
              <label>Senha</label>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>
            <div className="field">
              <label>Você é aluno(a)?</label>
              <div className="chip-select">
                <div
                  className={`chip ${isStudent ? "selected" : ""}`}
                  onClick={() => setIsStudent(true)}
                >
                  Sou aluno(a)
                </div>
                <div
                  className={`chip ${!isStudent ? "selected" : ""}`}
                  onClick={() => setIsStudent(false)}
                >
                  Externo(a)
                </div>
              </div>
            </div>

            {isStudent ? (
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
            ) : (
              <div className="field">
                <label>Curso / Área de atuação</label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="Ex: Desenvolvedor, Design, Marketing..."
                  required
                />
              </div>
            )}
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
            <button className="btn" type="submit" disabled={busy} style={{ marginTop: 10, width: "100%" }}>
              {busy ? "Criando..." : "Criar conta e gerar meu QR Code"}
            </button>
          </form>
        )}

        <div className="partner-logos">
          <img src="/assets/logo-tec-school.png" alt="Tec School" />
          <img src="/assets/logoundbpreta.png" alt="UNDB" />
        </div>
      </div>
    </div>
  );
}
