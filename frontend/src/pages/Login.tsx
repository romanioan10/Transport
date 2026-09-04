import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, userApi } from "../api/endpoints";
import { ApiError } from "../api/client";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { token } = await authApi.login(email, password);
            localStorage.setItem("token", token);
            const user = await userApi.me();
            localStorage.setItem("role", user.role);
            navigate(user.role === "ADMIN" ? "/admin" : "/dashboard");
        } catch (err) {
            const message = err instanceof ApiError ? err.message : "Login failed";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="card auth-card">
                <h2>Sign in</h2>
                <p className="muted">Welcome back to Transport.</p>

                <form onSubmit={handleSubmit} className="form">
                    <label>
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>

                    {error && <p className="form-error">{error}</p>}

                    <button className="btn primary" type="submit" disabled={loading}>
                        {loading ? "Signing in…" : "Sign in"}
                    </button>
                </form>

                <p className="muted center">
                    No account yet? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
}
