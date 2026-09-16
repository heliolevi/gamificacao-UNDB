import { Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Admin } from "./pages/Admin";
import { Home } from "./pages/Home";
import { Leaderboard } from "./pages/Leaderboard";
import { Profile } from "./pages/Profile";
import { Register } from "./pages/Register";
import { Scanner } from "./pages/Scanner";

export function App() {
  return (
    <div>
      <Navbar />
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/ranking" element={<Leaderboard />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </div>
  );
}
