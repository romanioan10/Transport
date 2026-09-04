import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, userApi } from "../api/endpoints";
import { ApiError } from "../api/client";

export default function Register() {
    const [form, setForm] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function change(e: ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { token } = await authApi.register(form);
            localStorage.setItem("token", token);
            const user = await userApi.me();
            localStorage.setItem("role", user.role);
            navigate("/dashboard");
        } catch (err) {
            const message = err instanceof ApiError ? err.message : "Registration failed";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="card auth-card">
                <h2>Create account</h2>
                <p className="muted">Sign up as a client and continue to your dashboard.</p>

                <form onSubmit={handleSubmit} className="form">
                    <label>
                        Email
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={change}
                            required
                        />
                    </label>

                    <label>
                        Password
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={change}
                            required
                        />
                    </label>

                    <div className="form-row">
                        <label>
                            First name
                            <input
                                name="firstName"
                                value={form.firstName}
                                onChange={change}
                                required
                            />
                        </label>
                        <label>
                            Last name
                            <input
                                name="lastName"
                                value={form.lastName}
                                onChange={change}
                                required
                            />
                        </label>
                    </div>

                    <label>
                        Phone number
                        <input
                            name="phoneNumber"
                            value={form.phoneNumber}
                            onChange={change}
                            placeholder="+40712345678"
                        />
                    </label>

                    {error && <p className="form-error">{error}</p>}

                    <button className="btn primary" type="submit" disabled={loading}>
                        {loading ? "Creating account…" : "Register"}
                    </button>
                </form>

                <p className="muted center">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
