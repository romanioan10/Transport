import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate(); // 🔥 TREBUIE AICI

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            const data = await login(email, password);

            console.log("LOGIN SUCCESS:", data);

            localStorage.setItem("token", data.token);

            navigate("/dashboard"); // 🔥 redirect
        } catch (err) {
            console.error(err);
            alert("Login failed");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                /><br />



                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                /><br /><br />

                <button type="submit">Login</button>
            </form>
        </div>
    );

}