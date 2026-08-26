import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/authApi";
import "./Register.css";

export default function Register() {
    const [form, setForm] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
    });
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            const data = await register(form);
            console.log("REGISTER SUCCESS:", data);

            localStorage.setItem("token", data.token);

            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError("Register failed. Please check your details and try again.");
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <h2>Create account</h2>
                <p className="register-subtitle">Sign up as a client and continue to your dashboard.</p>

                <form onSubmit={handleSubmit} className="register-form">
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="firstName"
                        placeholder="First Name"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="lastName"
                        placeholder="Last Name"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="phoneNumber"
                        placeholder="Phone Number"
                        value={form.phoneNumber}
                        onChange={handleChange}
                    />

                    {error && <p className="register-error">{error}</p>}

                    <button type="submit">Register</button>
                </form>
            </div>
        </div>
    );
}
