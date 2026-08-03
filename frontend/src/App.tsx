import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const token = localStorage.getItem("token");

  return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

          <Route path="/admin" element={<AdminDashboard />} />
        <Route
            path="/dashboard"
            element={token ? <Dashboard /> : <Navigate to="/login" />}
        />
      </Routes>
  );
}

export default App;