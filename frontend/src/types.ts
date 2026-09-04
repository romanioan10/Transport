export type UserRole = "ADMIN" | "DRIVER" | "CLIENT";
export type UserStatus = "ACTIVE" | "DISABLED";

export interface UserDto {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string | null;
}

export interface VehicleDto {
    id: number;
    licensePlate: string;
    model: string;
    capacityVolume: number;
    capacityWeight: number;
    active: boolean;
    driver: UserDto | null;
}

export interface DriverDto {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: UserRole;
    vehicle: VehicleDto | null;
}

export interface AuthResponse {
    token: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
}

export interface NewVehiclePayload {
    licensePlate: string;
    model: string;
    capacityVolume: number;
    capacityWeight: number;
}

export interface UpdateVehiclePayload {
    licensePlate: string;
    model: string;
    capacityVolume: number;
    capacityWeight: number;
    active: boolean;
}

export interface UpdateUserProfilePayload {
    firstName: string;
    lastName: string;
    phoneNumber: string;
}

export interface NewUserPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: UserRole;
    status?: UserStatus;
}

export interface UserFilters {
    role?: UserRole;
    status?: UserStatus;
    q?: string;
}

export interface VehicleFilters {
    active?: boolean;
    plate?: string;
    model?: string;
}

export interface AssignmentDto {
    id: number;
    driver: UserDto;
    vehicle: VehicleDto;
    active: boolean;
    assignedAt: string | null;
    unassignedAt: string | null;
}
