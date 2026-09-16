import { Link } from "react-router-dom"; 

const PILLARS = [
  {
    icon: "",
    title: "Presença",
    text: "Escaneie o QR Code exibido no telão ao final de cada palestra, workshop ou mesa redonda e ganhe XP na hora.",
  },
  {
    icon: "",
    title: "Networking",
    text: "Escaneie o QR de outro participante para conectar. Os dois ganham XP — e ainda mais se forem de cursos ou períodos diferentes.",
  },
  {
    icon: "",
    title: "Ranking & Patentes",
    text: "Acompanhe o placar em tempo real e suba de patente: Estagiário, Júnior, Pleno, Sênior e Staff / Tech Lead.",
  },
];

export function Home() {
  return (
    <div>
      <section className="hero">
        <div className="eyebrow">SOFTWARE HOUSE // SISTEMA DE ENGAJAMENTO</div>
        <h1>
          IT WORKS
          <br />
          GAMIFICAÇÃO DO EVENTO
        </h1>
        <p className="lead">
          Chega de carimbo no papel. Participe das atividades, conecte-se com outras pessoas e
          suba no ranking em tempo real — tudo escaneando QR Codes.
        </p>
        <div className="hero-actions">
          <Link to="/cadastro" className="btn">
            Criar meu perfil
          </Link>
          <Link to="/ranking" className="btn btn-outline">
            Ver ranking
          </Link>
        </div>
      </section>

      <div className="pillars">
        {PILLARS.map((p) => (
          <div key={p.title} className="panel pillar-card glow-cyan">
            <span className="icon">{p.icon}</span>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </div>
        ))}
      </div>

      <div className="footer-note">
        feito com ⚡ para conectar a galera à Software House
      </div>

      <div className="footer-logo">
        <img src="/assets/LOGO_CURTA_COLORIDA.png" alt="Logo" />
      </div>
    </div>
  );
}
