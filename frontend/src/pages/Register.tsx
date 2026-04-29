import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/authApi";

export default function Register() {
    const [form, setForm] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        role: "CLIENT",
    });

    const navigate = useNavigate();

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            const data = await register(form);
            console.log("REGISTER SUCCESS:", data);

            localStorage.setItem("token", data.token);

            navigate("/dashboard"); // 🔥 redirect corect
        } catch (err) {
            console.error(err);
            alert("Register failed");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Register</h2>

            <form onSubmit={handleSubmit}>
                <input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                /><br />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                /><br />

                <input
                    name="firstName"
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={handleChange}
                /><br />

                <input
                    name="lastName"
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={handleChange}
                /><br />

                <input
                    name="phoneNumber"
                    placeholder="Phone"
                    value={form.phoneNumber}
                    onChange={handleChange}
                /><br />

                <select name="role" value={form.role} onChange={handleChange}>
                    <option value="CLIENT">CLIENT</option>
                    <option value="DRIVER">DRIVER</option>
                </select><br /><br />

                <button type="submit">Register</button>
            </form>
        </div>
    );
}