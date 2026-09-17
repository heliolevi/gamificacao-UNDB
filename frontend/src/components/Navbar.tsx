import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        <span className="spark">◆</span> IT WORKS
      </NavLink>
      {user && (
        <nav style={{ alignItems: "center" }}>
          <NavLink to="/perfil">Perfil</NavLink>
          <NavLink to="/ranking">Ranking</NavLink>
          <NavLink to="/scanner">Scanner</NavLink>
          {user.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
          <button
            type="button"
            onClick={handleLogout}
            className="chip"
            style={{ cursor: "pointer", marginLeft: 6 }}
          >
            Sair
          </button>
        </nav>
      )}
    </header>
  );
}
