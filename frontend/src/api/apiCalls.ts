const API_URL = "http://localhost:8080/api";

export async function getDrivers() {
    const response = await fetch(`${API_URL}/users/drivers`);
    if (!response.ok) throw new Error("Failed to fetch drivers");
    return response.json();
}

export async function getVehicles() {
    const response = await fetch(`${API_URL}/vehicles`);
    if (!response.ok) throw new Error("Failed to fetch vehicles");
    return response.json();
}

export async function assignDriverToVehicle(vehicleId: number, driverId: number) {
    const response = await fetch(
        `${API_URL}/vehicles/${vehicleId}/assign-driver/${driverId}`,
        {
            method: "PUT",
        }
    );

    if (!response.ok) throw new Error("Failed to assign driver");
    return response.json();
}

export async function updateVehicleStatus(vehicleId: number, active: boolean) {
    const response = await fetch(
        `${API_URL}/vehicles/${vehicleId}/status?active=${active}`,
        {
            method: "PUT",
        }
    );

    if (!response.ok) throw new Error("Failed to update vehicle status");
    return response.json();
}

export async function unassignDriverFromVehicle(vehicleId: number) {
    const response = await fetch(
        `${API_URL}/vehicles/${vehicleId}/unassign-driver`,
        {
            method: "PUT",
        }
    );

    if (!response.ok) throw new Error("Failed to unassign driver");

    return response.json();
}