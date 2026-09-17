import { Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { Admin } from "./pages/Admin";
import { Leaderboard } from "./pages/Leaderboard";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { Scanner } from "./pages/Scanner";

export function App() {
  return (
    <AuthProvider>
      <div>
        <Navbar />
        <div className="app-shell">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ranking"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scanner"
              element={
                <ProtectedRoute>
                  <Scanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>

        <div className="footer-logo">
          <img src="/assets/LOGO_CURTA_COLORIDA.png" alt="Logo" />
        </div>
      </div>
    </AuthProvider>
  );
}
