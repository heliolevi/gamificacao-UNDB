import { NavLink } from "react-router-dom";

export function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        <span className="spark">◆</span> IT WORKS
      </NavLink>
      <nav>
        <NavLink to="/" end>
          Início
        </NavLink>
        <NavLink to="/cadastro">Cadastro</NavLink>
        <NavLink to="/perfil">Perfil</NavLink>
        <NavLink to="/ranking">Ranking</NavLink>
        <NavLink to="/scanner">Scanner</NavLink>
        <NavLink to="/admin">Admin</NavLink>
      </nav>
    </header>
  );
}
