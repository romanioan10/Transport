import { apiFetch } from "./client";
import type {
    AssignmentDto,
    AuthResponse,
    DriverDto,
    NewUserPayload,
    NewVehiclePayload,
    RegisterPayload,
    UpdateUserProfilePayload,
    UpdateVehiclePayload,
    UserDto,
    UserFilters,
    UserRole,
    UserStatus,
    VehicleDto,
    VehicleFilters,
} from "../types";

function buildQuery(params: Record<string, unknown>): string {
    const parts = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== "" && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    return parts.length ? `?${parts.join("&")}` : "";
}

export const authApi = {
    login: (email: string, password: string) =>
        apiFetch<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        }),
    register: (data: RegisterPayload) =>
        apiFetch<AuthResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        }),
};

export const userApi = {
    me: () => apiFetch<UserDto>("/users/me"),
    updateMe: (data: UpdateUserProfilePayload) =>
        apiFetch<UserDto>("/users/me", {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    list: (filters: UserFilters = {}) =>
        apiFetch<UserDto[]>(`/users${buildQuery({ ...filters })}`),
    drivers: () => apiFetch<UserDto[]>("/users/drivers"),
    clients: () => apiFetch<UserDto[]>("/users/clients"),
    getById: (id: number) => apiFetch<UserDto>(`/users/${id}`),
    create: (data: NewUserPayload) =>
        apiFetch<UserDto>("/users", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    updateProfile: (id: number, data: UpdateUserProfilePayload) =>
        apiFetch<UserDto>(`/users/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    updateRole: (id: number, role: UserRole) =>
        apiFetch<UserDto>(`/users/${id}/role`, {
            method: "PUT",
            body: JSON.stringify({ role }),
        }),
    updateStatus: (id: number, status: UserStatus) =>
        apiFetch<UserDto>(`/users/${id}/status`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        }),
    remove: (id: number) =>
        apiFetch<void>(`/users/${id}`, {
            method: "DELETE",
        }),
};

export const vehicleApi = {
    list: (filters: VehicleFilters = {}) =>
        apiFetch<VehicleDto[]>(`/vehicles${buildQuery({ ...filters })}`),
    getById: (id: number) => apiFetch<VehicleDto>(`/vehicles/${id}`),
    create: (data: NewVehiclePayload) =>
        apiFetch<VehicleDto>("/vehicles", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: number, data: UpdateVehiclePayload) =>
        apiFetch<VehicleDto>(`/vehicles/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    updateStatus: (id: number, active: boolean) =>
        apiFetch<VehicleDto>(`/vehicles/${id}/status?active=${active}`, {
            method: "PUT",
        }),
    remove: (id: number) =>
        apiFetch<void>(`/vehicles/${id}`, {
            method: "DELETE",
        }),
};

export const assignmentApi = {
    listActive: () => apiFetch<AssignmentDto[]>("/assignments"),
    listHistory: () => apiFetch<AssignmentDto[]>("/assignments/history"),
    historyForVehicle: (vehicleId: number) =>
        apiFetch<AssignmentDto[]>(`/assignments/history/vehicle/${vehicleId}`),
    historyForDriver: (driverId: number) =>
        apiFetch<AssignmentDto[]>(`/assignments/history/driver/${driverId}`),
    assign: (vehicleId: number, driverId: number) =>
        apiFetch<VehicleDto>("/assignments", {
            method: "POST",
            body: JSON.stringify({ vehicleId, driverId }),
        }),
    unassign: (vehicleId: number) =>
        apiFetch<VehicleDto>(`/assignments/vehicle/${vehicleId}`, {
            method: "DELETE",
        }),
};

export const driverApi = {
    me: () => apiFetch<DriverDto>("/drivers/me"),
};
