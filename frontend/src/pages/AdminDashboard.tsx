import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { assignmentApi, userApi, vehicleApi } from "../api/endpoints";
import { ApiError } from "../api/client";
import type {
    AssignmentDto,
    NewUserPayload,
    NewVehiclePayload,
    UpdateUserProfilePayload,
    UpdateVehiclePayload,
    UserDto,
    UserRole,
    UserStatus,
    VehicleDto,
} from "../types";

const emptyNewVehicle: NewVehiclePayload = {
    licensePlate: "",
    model: "",
    capacityVolume: 0,
    capacityWeight: 0,
};

const emptyNewUser: NewUserPayload = {
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    role: "CLIENT",
    status: "ACTIVE",
};

type Tab = "vehicles" | "users" | "assignments";

export default function AdminDashboard() {
    const [tab, setTab] = useState<Tab>("vehicles");
    const [error, setError] = useState("");
    const [me, setMe] = useState<UserDto | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        userApi.me().then(setMe).catch(() => setMe(null));
    }, []);

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    }

    return (
        <div className="page">
            <header className="top-bar">
                <div>
                    <h1>Admin dashboard</h1>
                    <p className="muted">
                        Signed in as {me?.email ?? "…"} · Fleet, users and assignments.
                    </p>
                </div>
                <button className="btn secondary" onClick={logout}>
                    Log out
                </button>
            </header>

            {error && <div className="alert">{error}</div>}

            <nav className="tabs">
                <button
                    className={tab === "vehicles" ? "active" : ""}
                    onClick={() => setTab("vehicles")}
                >
                    Vehicles
                </button>
                <button
                    className={tab === "users" ? "active" : ""}
                    onClick={() => setTab("users")}
                >
                    Users
                </button>
                <button
                    className={tab === "assignments" ? "active" : ""}
                    onClick={() => setTab("assignments")}
                >
                    Assignments
                </button>
            </nav>

            {tab === "vehicles" && <VehiclesTab onGlobalError={setError} />}
            {tab === "users" && <UsersTab currentUserId={me?.id ?? null} onGlobalError={setError} />}
            {tab === "assignments" && <AssignmentsTab onGlobalError={setError} />}
        </div>
    );
}

/* --------------------------------- Vehicles -------------------------------- */

function VehiclesTab({ onGlobalError }: { onGlobalError: (msg: string) => void }) {
    const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
    const [drivers, setDrivers] = useState<UserDto[]>([]);
    const [pendingDriver, setPendingDriver] = useState<Record<number, number>>({});
    const [newVehicle, setNewVehicle] = useState<NewVehiclePayload>(emptyNewVehicle);
    const [filters, setFilters] = useState<{ active: string; plate: string; model: string }>({
        active: "",
        plate: "",
        model: "",
    });
    const [editing, setEditing] = useState<VehicleDto | null>(null);

    const load = useCallback(async () => {
        try {
            const [v, d] = await Promise.all([
                vehicleApi.list({
                    active: filters.active === "" ? undefined : filters.active === "true",
                    plate: filters.plate || undefined,
                    model: filters.model || undefined,
                }),
                userApi.list({ role: "DRIVER" }),
            ]);
            setVehicles(v);
            setDrivers(d);
        } catch (e) {
            onGlobalError(e instanceof ApiError ? e.message : "Failed to load vehicles.");
        }
    }, [filters.active, filters.plate, filters.model, onGlobalError]);

    useEffect(() => {
        void load();
    }, [load]);

    async function submitNewVehicle(e: FormEvent) {
        e.preventDefault();
        try {
            await vehicleApi.create(newVehicle);
            setNewVehicle(emptyNewVehicle);
            await load();
        } catch (e) {
            alert(e instanceof ApiError ? e.message : "Failed to add vehicle.");
        }
    }

    async function assign(vehicleId: number) {
        const driverId = pendingDriver[vehicleId];
        if (!driverId) {
            alert("Pick a driver first.");
            return;
        }
        try {
            await assignmentApi.assign(vehicleId, driverId);
            await load();
        } catch (e) {
            alert(e instanceof ApiError ? e.message : "Assign failed.");
        }
    }

    async function unassign(vehicleId: number) {
        try {
            await assignmentApi.unassign(vehicleId);
            await load();
        } catch (e) {
            alert(e instanceof ApiError ? e.message : "Unassign failed.");
        }
    }

    async function toggleStatus(v: VehicleDto) {
        try {
            await vehicleApi.updateStatus(v.id, !v.active);
            await load();
        } catch (e) {
            alert(e instanceof ApiError ? e.message : "Status update failed.");
        }
    }

    async function removeVehicle(v: VehicleDto) {
        if (!confirm(`Delete vehicle ${v.licensePlate}? This cannot be undone.`)) return;
        try {
            await vehicleApi.remove(v.id);
            await load();
        } catch (e) {
            alert(e instanceof ApiError ? e.message : "Delete failed.");
        }
    }

    return (
        <>
            <section className="card">
                <h2>Add a vehicle</h2>
                <form className="form form-row-fluid" onSubmit={submitNewVehicle}>
                    <label>
                        Plate
                        <input
                            value={newVehicle.licensePlate}
                            onChange={(e) =>
                                setNewVehicle({ ...newVehicle, licensePlate: e.target.value })
                            }
                            required
                        />
                    </label>
                    <label>
                        Model
                        <input
                            value={newVehicle.model}
                            onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                            required
                        />
                    </label>
                    <label>
                        Volume (m³)
                        <input
                            type="number"
                            step="0.1"
                            value={newVehicle.capacityVolume}
                            onChange={(e) =>
                                setNewVehicle({
                                    ...newVehicle,
                                    capacityVolume: Number(e.target.value),
                                })
                            }
                        />
                    </label>
                    <label>
                        Weight (kg)
                        <input
                            type="number"
                            step="0.1"
                            value={newVehicle.capacityWeight}
                            onChange={(e) =>
                                setNewVehicle({
                                    ...newVehicle,
                                    capacityWeight: Number(e.target.value),
                                })
                            }
                        />
                    </label>
                    <button type="submit" className="btn primary">
                        Add vehicle
                    </button>
                </form>
            </section>

            <section className="card">
                <div className="section-head">
                    <h2>Vehicles ({vehicles.length})</h2>
                </div>
                <div className="filter-bar">
                    <label>
                        Status
                        <select
                            value={filters.active}
                            onChange={(e) => setFilters({ ...filters, active: e.target.value })}
                        >
                            <option value="">All</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </label>
                    <label>
                        Plate contains
                        <input
                            value={filters.plate}
                            onChange={(e) => setFilters({ ...filters, plate: e.target.value })}
                            placeholder="e.g. B123"
                        />
                    </label>
                    <label>
                        Model contains
                        <input
                            value={filters.model}
                            onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                            placeholder="e.g. Ford"
                        />
                    </label>
                    <button
                        className="btn small secondary"
                        type="button"
                        onClick={() => setFilters({ active: "", plate: "", model: "" })}
                    >
                        Reset
                    </button>
                </div>

                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Plate</th>
                                <th>Model</th>
                                <th>Volume</th>
                                <th>Weight</th>
                                <th>Status</th>
                                <th>Driver</th>
                                <th>Assignment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((v) => (
                                <tr key={v.id}>
                                    <td>{v.id}</td>
                                    <td>{v.licensePlate}</td>
                                    <td>{v.model}</td>
                                    <td>{v.capacityVolume}</td>
                                    <td>{v.capacityWeight}</td>
                                    <td>
                                        <span
                                            className={`badge ${
                                                v.active ? "success" : "muted-badge"
                                            }`}
                                        >
                                            {v.active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td>
                                        {v.driver ? (
                                            `${v.driver.firstName} ${v.driver.lastName}`
                                        ) : (
                                            <span className="muted">—</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="cell-actions">
                                            <select
                                                value={pendingDriver[v.id] || ""}
                                                onChange={(e) =>
                                                    setPendingDriver({
                                                        ...pendingDriver,
                                                        [v.id]: Number(e.target.value),
                                                    })
                                                }
                                            >
                                                <option value="">Select driver…</option>
                                                {drivers.map((d) => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.firstName} {d.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                className="btn small"
                                                onClick={() => assign(v.id)}
                                            >
                                                Assign
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="cell-actions">
                                            <button
                                                className="btn small secondary"
                                                onClick={() => setEditing(v)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn small secondary"
                                                onClick={() => toggleStatus(v)}
                                            >
                                                {v.active ? "Deactivate" : "Reactivate"}
                                            </button>
                                            {v.driver && (
                                                <button
                                                    className="btn small danger"
                                                    onClick={() => unassign(v.id)}
                                                >
                                                    Unassign
                                                </button>
                                            )}
                                            <button
                                                className="btn small danger"
                                                onClick={() => removeVehicle(v)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {vehicles.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="empty">
                                        No vehicles match the filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {editing && (
                <EditVehicleModal
                    vehicle={editing}
                    onClose={() => setEditing(null)}
                    onSaved={async () => {
                        setEditing(null);
                        await load();
                    }}
                />
            )}
        </>
    );
}

function EditVehicleModal({
    vehicle,
    onClose,
    onSaved,
}: {
    vehicle: VehicleDto;
    onClose: () => void;
    onSaved: () => void | Promise<void>;
}) {
    const [form, setForm] = useState<UpdateVehiclePayload>({
        licensePlate: vehicle.licensePlate,
        model: vehicle.model,
        capacityVolume: vehicle.capacityVolume,
        capacityWeight: vehicle.capacityWeight,
        active: vehicle.active,
    });
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

    async function submit(e: FormEvent) {
        e.preventDefault();
        setErr("");
        setSaving(true);
        try {
            await vehicleApi.update(vehicle.id, form);
            await onSaved();
        } catch (e) {
            setErr(e instanceof ApiError ? e.message : "Update failed.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal title={`Edit vehicle #${vehicle.id}`} onClose={onClose}>
            <form className="form" onSubmit={submit}>
                <div className="form-row">
                    <label>
                        Plate
                        <input
                            value={form.licensePlate}
                            onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
                            required
                        />
                    </label>
                    <label>
                        Model
                        <input
                            value={form.model}
                            onChange={(e) => setForm({ ...form, model: e.target.value })}
                            required
                        />
                    </label>
                </div>
                <div className="form-row">
                    <label>
                        Volume (m³)
                        <input
                            type="number"
                            step="0.1"
                            value={form.capacityVolume}
                            onChange={(e) =>
                                setForm({ ...form, capacityVolume: Number(e.target.value) })
                            }
                        />
                    </label>
                    <label>
                        Weight (kg)
                        <input
                            type="number"
                            step="0.1"
                            value={form.capacityWeight}
                            onChange={(e) =>
                                setForm({ ...form, capacityWeight: Number(e.target.value) })
                            }
                        />
                    </label>
                </div>
                <label className="checkbox-row">
                    <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    />
                    Active
                </label>
                {err && <p className="form-error">{err}</p>}
                <div className="cell-actions">
                    <button type="submit" className="btn primary" disabled={saving}>
                        {saving ? "Saving…" : "Save"}
                    </button>
                    <button type="button" className="btn secondary" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/* ---------------------------------- Users --------------------------------- */

function UsersTab({
    currentUserId,
    onGlobalError,
}: {
    currentUserId: number | null;
    onGlobalError: (msg: string) => void;
}) {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [filters, setFilters] = useState<{ role: string; status: string; q: string }>({
        role: "",
        status: "",
        q: "",
    });
    const [detail, setDetail] = useState<UserDto | null>(null);
    const [editing, setEditing] = useState<UserDto | null>(null);
    const [newUser, setNewUser] = useState<NewUserPayload>(emptyNewUser);

    const load = useCallback(async () => {
        try {
            const data = await userApi.list({
                role: (filters.role || undefined) as UserRole | undefined,
                status: (filters.status || undefined) as UserStatus | undefined,
                q: filters.q || undefined,
            });
            setUsers(data);
        } catch (e) {
            onGlobalError(e instanceof ApiError ? e.message : "Failed to load users.");
        }
    }, [filters.role, filters.status, filters.q, onGlobalError]);

    useEffect(() => {
        void load();
    }, [load]);

    async function changeRole(user: UserDto, role: UserRole) {
        if (role === user.role) return;
        try {
            await userApi.updateRole(user.id, role);
            await load();
            if (user.id === currentUserId) {
                alert(
                    "You changed your own role. Please log out and log back in for it to take effect."
                );
            }
        } catch (e) {
            alert(e instanceof ApiError ? e.message : "Role update failed.");
        }
    }

    async function toggleStatus(user: UserDto) {
        const next: UserStatus = user.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
        try {
            await userApi.updateStatus(user.id, next);
            await load();
        } catch (e) {
            alert(e instanceof ApiError ? e.message : "Status update failed.");
        }
    }

    async function submitNewUser(e: FormEvent) {
        e.preventDefault();
        try {
            await userApi.create(newUser);
            setNewUser(emptyNewUser);
            await load();
        } catch (e) {
            alert(e instanceof ApiError ? e.message : "Failed to create user.");
        }
    }

    async function removeUser(user: UserDto) {
        if (
            !confirm(
                `Delete user ${user.firstName} ${user.lastName} (${user.email})? This also removes their assignment history and cannot be undone.`
            )
        ) {
            return;
        }
        try {
            await userApi.remove(user.id);
            await load();
        } catch (e) {
            alert(e instanceof ApiError ? e.message : "Delete failed.");
        }
    }

    const counts = useMemo(() => {
        const c = { ADMIN: 0, DRIVER: 0, CLIENT: 0, ACTIVE: 0, DISABLED: 0 };
        for (const u of users) {
            c[u.role]++;
            c[u.status]++;
        }
        return c;
    }, [users]);

    return (
        <>
            <section className="card">
                <h2>Add a user</h2>
                <form className="form form-row-fluid" onSubmit={submitNewUser}>
                    <label>
                        Email
                        <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            required
                        />
                    </label>
                    <label>
                        Password
                        <input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            minLength={6}
                            required
                        />
                    </label>
                    <label>
                        First name
                        <input
                            value={newUser.firstName}
                            onChange={(e) =>
                                setNewUser({ ...newUser, firstName: e.target.value })
                            }
                            required
                        />
                    </label>
                    <label>
                        Last name
                        <input
                            value={newUser.lastName}
                            onChange={(e) =>
                                setNewUser({ ...newUser, lastName: e.target.value })
                            }
                            required
                        />
                    </label>
                    <label>
                        Phone
                        <input
                            value={newUser.phoneNumber}
                            onChange={(e) =>
                                setNewUser({ ...newUser, phoneNumber: e.target.value })
                            }
                            placeholder="+40 712 345 678"
                        />
                    </label>
                    <label>
                        Role
                        <select
                            value={newUser.role}
                            onChange={(e) =>
                                setNewUser({ ...newUser, role: e.target.value as UserRole })
                            }
                        >
                            <option value="CLIENT">CLIENT</option>
                            <option value="DRIVER">DRIVER</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </label>
                    <label>
                        Status
                        <select
                            value={newUser.status ?? "ACTIVE"}
                            onChange={(e) =>
                                setNewUser({
                                    ...newUser,
                                    status: e.target.value as UserStatus,
                                })
                            }
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="DISABLED">DISABLED</option>
                        </select>
                    </label>
                    <button type="submit" className="btn primary">
                        Add user
                    </button>
                </form>
            </section>

            <section className="card">
                <div className="section-head">
                    <h2>Users ({users.length})</h2>
                    <p className="muted">
                        Admins: {counts.ADMIN} · Drivers: {counts.DRIVER} · Clients:{" "}
                        {counts.CLIENT} · Active: {counts.ACTIVE} · Disabled: {counts.DISABLED}
                    </p>
                </div>
                <div className="filter-bar">
                    <label>
                        Role
                        <select
                            value={filters.role}
                            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        >
                            <option value="">All</option>
                            <option value="ADMIN">Admin</option>
                            <option value="DRIVER">Driver</option>
                            <option value="CLIENT">Client</option>
                        </select>
                    </label>
                    <label>
                        Status
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">All</option>
                            <option value="ACTIVE">Active</option>
                            <option value="DISABLED">Disabled</option>
                        </select>
                    </label>
                    <label>
                        Search
                        <input
                            value={filters.q}
                            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                            placeholder="Name, email or phone"
                        />
                    </label>
                    <button
                        type="button"
                        className="btn small secondary"
                        onClick={() => setFilters({ role: "", status: "", q: "" })}
                    >
                        Reset
                    </button>
                </div>

                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Since</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => {
                                const isSelf = u.id === currentUserId;
                                return (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td>
                                            {u.firstName} {u.lastName}
                                            {isSelf && (
                                                <span className="badge muted-badge tag-you">
                                                    you
                                                </span>
                                            )}
                                        </td>
                                        <td>{u.email}</td>
                                        <td>{u.phoneNumber || "—"}</td>
                                        <td>
                                            <select
                                                value={u.role}
                                                onChange={(e) =>
                                                    changeRole(u, e.target.value as UserRole)
                                                }
                                            >
                                                <option value="ADMIN">ADMIN</option>
                                                <option value="DRIVER">DRIVER</option>
                                                <option value="CLIENT">CLIENT</option>
                                            </select>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    u.status === "ACTIVE"
                                                        ? "success"
                                                        : "muted-badge"
                                                }`}
                                            >
                                                {u.status}
                                            </span>
                                        </td>
                                        <td>{formatDate(u.createdAt)}</td>
                                        <td>
                                            <div className="cell-actions">
                                                <button
                                                    className="btn small secondary"
                                                    onClick={() => setDetail(u)}
                                                >
                                                    Details
                                                </button>
                                                <button
                                                    className="btn small secondary"
                                                    onClick={() => setEditing(u)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className={`btn small ${
                                                        u.status === "ACTIVE"
                                                            ? "danger"
                                                            : "secondary"
                                                    }`}
                                                    onClick={() => toggleStatus(u)}
                                                    disabled={isSelf}
                                                    title={
                                                        isSelf
                                                            ? "You can't disable yourself"
                                                            : undefined
                                                    }
                                                >
                                                    {u.status === "ACTIVE" ? "Disable" : "Enable"}
                                                </button>
                                                <button
                                                    className="btn small danger"
                                                    onClick={() => removeUser(u)}
                                                    disabled={isSelf}
                                                    title={
                                                        isSelf
                                                            ? "You can't delete yourself"
                                                            : undefined
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="empty">
                                        No users match the filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {detail && <UserDetailsModal user={detail} onClose={() => setDetail(null)} />}
            {editing && (
                <EditUserModal
                    user={editing}
                    onClose={() => setEditing(null)}
                    onSaved={async () => {
                        setEditing(null);
                        await load();
                    }}
                />
            )}
        </>
    );
}

function UserDetailsModal({ user, onClose }: { user: UserDto; onClose: () => void }) {
    return (
        <Modal title={`User #${user.id}`} onClose={onClose}>
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
                    <dt>Created</dt>
                    <dd>{formatDateTime(user.createdAt)}</dd>
                </div>
            </dl>
            <div className="cell-actions" style={{ marginTop: 16 }}>
                <button className="btn secondary" onClick={onClose}>
                    Close
                </button>
            </div>
        </Modal>
    );
}

function EditUserModal({
    user,
    onClose,
    onSaved,
}: {
    user: UserDto;
    onClose: () => void;
    onSaved: () => void | Promise<void>;
}) {
    const [form, setForm] = useState<UpdateUserProfilePayload>({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phoneNumber: user.phoneNumber ?? "",
    });
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

    function change(e: ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function submit(e: FormEvent) {
        e.preventDefault();
        setErr("");
        setSaving(true);
        try {
            await userApi.updateProfile(user.id, form);
            await onSaved();
        } catch (e) {
            setErr(e instanceof ApiError ? e.message : "Update failed.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal title={`Edit user #${user.id}`} onClose={onClose}>
            <form className="form" onSubmit={submit}>
                <p className="muted">{user.email}</p>
                <div className="form-row">
                    <label>
                        First name
                        <input name="firstName" value={form.firstName} onChange={change} required />
                    </label>
                    <label>
                        Last name
                        <input name="lastName" value={form.lastName} onChange={change} required />
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
                {err && <p className="form-error">{err}</p>}
                <div className="cell-actions">
                    <button className="btn primary" type="submit" disabled={saving}>
                        {saving ? "Saving…" : "Save"}
                    </button>
                    <button type="button" className="btn secondary" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/* ---------------------------------- Modal --------------------------------- */

function Modal({
    title,
    children,
    onClose,
}: {
    title: string;
    children: ReactNode;
    onClose: () => void;
}) {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal card"
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="section-head">
                    <h2>{title}</h2>
                    <button
                        type="button"
                        className="btn small secondary"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
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

function formatDateTime(iso: string | null): string {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
}

/* ------------------------------- Assignments ------------------------------ */

function AssignmentsTab({ onGlobalError }: { onGlobalError: (msg: string) => void }) {
    const [view, setView] = useState<"active" | "history">("active");
    const [rows, setRows] = useState<AssignmentDto[]>([]);
    const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
    const [drivers, setDrivers] = useState<UserDto[]>([]);
    const [pickVehicle, setPickVehicle] = useState<number | "">("");
    const [pickDriver, setPickDriver] = useState<number | "">("");
    const [filterDriver, setFilterDriver] = useState<number | "">("");
    const [filterVehicle, setFilterVehicle] = useState<number | "">("");

    const load = useCallback(async () => {
        try {
            const [list, v, d] = await Promise.all([
                view === "active"
                    ? assignmentApi.listActive()
                    : assignmentApi.listHistory(),
                vehicleApi.list(),
                userApi.list({ role: "DRIVER" }),
            ]);
            setRows(list);
            setVehicles(v);
            setDrivers(d);
        } catch (e) {
            onGlobalError(e instanceof ApiError ? e.message : "Failed to load assignments.");
        }
    }, [view, onGlobalError]);

    useEffect(() => {
        void load();
    }, [load]);

    async function doAssign(e: FormEvent) {
        e.preventDefault();
        if (!pickVehicle || !pickDriver) {
            alert("Pick a vehicle and a driver.");
            return;
        }
        try {
            await assignmentApi.assign(Number(pickVehicle), Number(pickDriver));
            setPickVehicle("");
            setPickDriver("");
            await load();
        } catch (e) {
            alert(e instanceof ApiError ? e.message : "Assign failed.");
        }
    }

    async function doUnassign(vehicleId: number) {
        try {
            await assignmentApi.unassign(vehicleId);
            await load();
        } catch (e) {
            alert(e instanceof ApiError ? e.message : "Unassign failed.");
        }
    }

    const filtered = useMemo(() => {
        return rows.filter((r) => {
            if (filterDriver && r.driver?.id !== Number(filterDriver)) return false;
            if (filterVehicle && r.vehicle?.id !== Number(filterVehicle)) return false;
            return true;
        });
    }, [rows, filterDriver, filterVehicle]);

    return (
        <>
            <section className="card">
                <h2>Assign a driver to a vehicle</h2>
                <form className="form form-row-fluid" onSubmit={doAssign}>
                    <label>
                        Vehicle
                        <select
                            value={pickVehicle}
                            onChange={(e) =>
                                setPickVehicle(e.target.value ? Number(e.target.value) : "")
                            }
                            required
                        >
                            <option value="">Select vehicle…</option>
                            {vehicles
                                .filter((v) => v.active)
                                .map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.licensePlate} · {v.model}
                                        {v.driver
                                            ? ` (currently: ${v.driver.firstName} ${v.driver.lastName})`
                                            : ""}
                                    </option>
                                ))}
                        </select>
                    </label>
                    <label>
                        Driver
                        <select
                            value={pickDriver}
                            onChange={(e) =>
                                setPickDriver(e.target.value ? Number(e.target.value) : "")
                            }
                            required
                        >
                            <option value="">Select driver…</option>
                            {drivers.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.firstName} {d.lastName} · {d.email}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button type="submit" className="btn primary">
                        Assign
                    </button>
                </form>
            </section>

            <section className="card">
                <div className="section-head">
                    <h2>
                        {view === "active" ? "Active assignments" : "Assignment history"} (
                        {filtered.length})
                    </h2>
                    <div className="cell-actions">
                        <button
                            className={`btn small ${view === "active" ? "primary" : "secondary"}`}
                            onClick={() => setView("active")}
                        >
                            Active
                        </button>
                        <button
                            className={`btn small ${view === "history" ? "primary" : "secondary"}`}
                            onClick={() => setView("history")}
                        >
                            History
                        </button>
                    </div>
                </div>

                <div className="filter-bar">
                    <label>
                        Driver
                        <select
                            value={filterDriver}
                            onChange={(e) =>
                                setFilterDriver(e.target.value ? Number(e.target.value) : "")
                            }
                        >
                            <option value="">All drivers</option>
                            {drivers.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.firstName} {d.lastName}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Vehicle
                        <select
                            value={filterVehicle}
                            onChange={(e) =>
                                setFilterVehicle(e.target.value ? Number(e.target.value) : "")
                            }
                        >
                            <option value="">All vehicles</option>
                            {vehicles.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.licensePlate}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button
                        className="btn small secondary"
                        type="button"
                        onClick={() => {
                            setFilterDriver("");
                            setFilterVehicle("");
                        }}
                    >
                        Reset
                    </button>
                </div>

                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Driver</th>
                                <th>Vehicle</th>
                                <th>Status</th>
                                <th>Assigned at</th>
                                <th>Unassigned at</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r) => (
                                <tr key={r.id}>
                                    <td>{r.id}</td>
                                    <td>
                                        {r.driver
                                            ? `${r.driver.firstName} ${r.driver.lastName}`
                                            : "—"}
                                    </td>
                                    <td>
                                        {r.vehicle
                                            ? `${r.vehicle.licensePlate} · ${r.vehicle.model}`
                                            : "—"}
                                    </td>
                                    <td>
                                        <span
                                            className={`badge ${
                                                r.active ? "success" : "muted-badge"
                                            }`}
                                        >
                                            {r.active ? "Active" : "Ended"}
                                        </span>
                                    </td>
                                    <td>{formatDateTime(r.assignedAt)}</td>
                                    <td>{formatDateTime(r.unassignedAt)}</td>
                                    <td>
                                        {r.active && r.vehicle && (
                                            <button
                                                className="btn small danger"
                                                onClick={() => doUnassign(r.vehicle.id)}
                                            >
                                                Unassign
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="empty">
                                        No assignments to show.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}
