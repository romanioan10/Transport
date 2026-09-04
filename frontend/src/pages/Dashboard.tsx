import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { driverApi, userApi } from "../api/endpoints";
import { ApiError } from "../api/client";
import type { UserDto, VehicleDto } from "../types";

export default function Dashboard() {
    const [user, setUser] = useState<UserDto | null>(null);
    const [vehicle, setVehicle] = useState<VehicleDto | null>(null);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ firstName: "", lastName: "", phoneNumber: "" });
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        userApi
            .me()
            .then((u) => {
                setUser(u);
                setForm({
                    firstName: u.firstName ?? "",
                    lastName: u.lastName ?? "",
                    phoneNumber: u.phoneNumber ?? "",
                });
                if (u.role === "DRIVER") {
                    driverApi
                        .me()
                        .then((d) => setVehicle(d.vehicle))
                        .catch(() => setVehicle(null));
                }
                if (u.role === "ADMIN") {
                    navigate("/admin", { replace: true });
                }
            })
            .catch(() => setError("Failed to load your profile."));
    }, [navigate]);

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    }

    function onFormChange(e: ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function startEdit() {
        if (!user) return;
        setForm({
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
            phoneNumber: user.phoneNumber ?? "",
        });
        setSaveError("");
        setEditing(true);
    }

    async function saveProfile(e: FormEvent) {
        e.preventDefault();
        setSaveError("");
        setSaving(true);
        try {
            const updated = await userApi.updateMe(form);
            setUser(updated);
            setEditing(false);
        } catch (err) {
            setSaveError(err instanceof ApiError ? err.message : "Update failed.");
        } finally {
            setSaving(false);
        }
    }

    if (error) return <div className="page-error">{error}</div>;
    if (!user) return <div className="page-loading">Loading…</div>;

    return (
        <div className="page">
            <header className="top-bar">
                <div>
                    <h1>Welcome, {user.firstName}</h1>
                    <p className="muted">{user.role} account</p>
                </div>
                <button className="btn secondary" onClick={logout}>
                    Log out
                </button>
            </header>

            <section className="card">
                <div className="section-head">
                    <h2>Your profile</h2>
                    {!editing && (
                        <button className="btn small secondary" onClick={startEdit}>
                            Edit
                        </button>
                    )}
                </div>

                {!editing ? (
                    <dl className="info-grid">
                        <div>
                            <dt>Email</dt>
                            <dd>{user.email}</dd>
                        </div>
                        <div>
                            <dt>Full name</dt>
                            <dd>
                                {user.firstName} {user.lastName}
                            </dd>
                        </div>
                        <div>
                            <dt>Phone</dt>
                            <dd>{user.phoneNumber || "—"}</dd>
                        </div>
                        <div>
                            <dt>Role</dt>
                            <dd>{user.role}</dd>
                        </div>
                        <div>
                            <dt>Status</dt>
                            <dd>
                                <span
                                    className={`badge ${
                                        user.status === "ACTIVE" ? "success" : "muted-badge"
                                    }`}
                                >
                                    {user.status}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt>Member since</dt>
                            <dd>{formatDate(user.createdAt)}</dd>
                        </div>
                    </dl>
                ) : (
                    <form className="form" onSubmit={saveProfile}>
                        <div className="form-row">
                            <label>
                                First name
                                <input
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={onFormChange}
                                    required
                                />
                            </label>
                            <label>
                                Last name
                                <input
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={onFormChange}
                                    required
                                />
                            </label>
                        </div>
                        <label>
                            Phone number
                            <input
                                name="phoneNumber"
                                value={form.phoneNumber}
                                onChange={onFormChange}
                                placeholder="+40712345678"
                            />
                        </label>
                        {saveError && <p className="form-error">{saveError}</p>}
                        <div className="cell-actions">
                            <button className="btn primary" type="submit" disabled={saving}>
                                {saving ? "Saving…" : "Save changes"}
                            </button>
                            <button
                                type="button"
                                className="btn secondary"
                                onClick={() => setEditing(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </section>

            {user.role === "DRIVER" && (
                <section className="card">
                    <h2>Assigned vehicle</h2>
                    {vehicle ? (
                        <dl className="info-grid">
                            <div>
                                <dt>Plate</dt>
                                <dd>{vehicle.licensePlate}</dd>
                            </div>
                            <div>
                                <dt>Model</dt>
                                <dd>{vehicle.model}</dd>
                            </div>
                            <div>
                                <dt>Volume</dt>
                                <dd>{vehicle.capacityVolume} m³</dd>
                            </div>
                            <div>
                                <dt>Weight</dt>
                                <dd>{vehicle.capacityWeight} kg</dd>
                            </div>
                            <div>
                                <dt>Status</dt>
                                <dd>
                                    <span
                                        className={`badge ${
                                            vehicle.active ? "success" : "muted-badge"
                                        }`}
                                    >
                                        {vehicle.active ? "Active" : "Inactive"}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    ) : (
                        <p className="muted">No vehicle assigned yet.</p>
                    )}
                </section>
            )}

            {user.role === "CLIENT" && (
                <section className="card">
                    <h2>What's next</h2>
                    <p className="muted">
                        Your client area will grow here — orders, delivery tracking and
                        billing will show up on this dashboard.
                    </p>
                </section>
            )}
        </div>
    );
}

function formatDate(iso: string | null): string {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString();
    } catch {
        return iso;
    }
}
