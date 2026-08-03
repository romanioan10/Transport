import { useEffect, useState } from "react";
import {
    getDrivers,
    getVehicles,
    assignDriverToVehicle,
    updateVehicleStatus,
    unassignDriverFromVehicle,
} from "../api/apiCalls";

type Driver = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
};

type Vehicle = {
    id: number;
    licensePlate: string;
    model: string;
    capacityVolume: number;
    capacityWeight: number;
    active: boolean;
    driver?: Driver | null;
};

export default function AdminDashboard() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedDrivers, setSelectedDrivers] = useState<Record<number, number>>({});

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const driversData = await getDrivers();
            const vehiclesData = await getVehicles();

            setDrivers(driversData);
            setVehicles(vehiclesData);
        } catch (error) {
            console.error(error);
            alert("Nu s-au putut încărca datele.");
        }
    }

    async function removeDriver(vehicleId: number) {
        try {
            await unassignDriverFromVehicle(vehicleId);
            await loadData();
        } catch (error) {
            console.error(error);
            alert("Nu s-a putut elimina șoferul.");
        }
    }

    async function assignDriver(vehicleId: number) {
        const driverId = selectedDrivers[vehicleId];

        if (!driverId) {
            alert("Selectează un șofer.");
            return;
        }

        try {
            await assignDriverToVehicle(vehicleId, driverId);
            await loadData();
        } catch (error) {
            console.error(error);
            alert("Nu s-a putut asigna șoferul.");
        }
    }

    async function toggleVehicleStatus(vehicle: Vehicle) {
        try {
            await updateVehicleStatus(vehicle.id, !vehicle.active);
            await loadData();
        } catch (error) {
            console.error(error);
            alert("Nu s-a putut modifica statusul mașinii.");
        }
    }

    return (
        <div style={{ padding: "32px", fontFamily: "Arial, sans-serif" }}>
            <h1>Admin Dashboard</h1>
            <p>Gestionează flota, șoferii și asignarea mașinilor.</p>

            <h2>Mașini</h2>

            <table border={1} cellPadding={10} style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Număr</th>
                    <th>Model</th>
                    <th>Volum</th>
                    <th>Greutate</th>
                    <th>Status</th>
                    <th>Șofer asignat</th>
                    <th>Asignare</th>
                    <th>Acțiuni</th>
                </tr>
                </thead>

                <tbody>
                {vehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                        <td>{vehicle.id}</td>
                        <td>{vehicle.licensePlate}</td>
                        <td>{vehicle.model}</td>
                        <td>{vehicle.capacityVolume}</td>
                        <td>{vehicle.capacityWeight}</td>
                        <td>{vehicle.active ? "Activă" : "Inactivă"}</td>
                        <td>
                            {vehicle.driver
                                ? `${vehicle.driver.firstName} ${vehicle.driver.lastName}`
                                : "Neasignată"}
                        </td>

                        <td>
                            <select
                                value={selectedDrivers[vehicle.id] || ""}
                                onChange={(e) =>
                                    setSelectedDrivers({
                                        ...selectedDrivers,
                                        [vehicle.id]: Number(e.target.value),
                                    })
                                }
                            >
                                <option value="">Alege șofer</option>
                                {drivers.map((driver) => (
                                    <option key={driver.id} value={driver.id}>
                                        {driver.firstName} {driver.lastName} - {driver.email}
                                    </option>
                                ))}
                            </select>

                            <button onClick={() => assignDriver(vehicle.id)} style={{ marginLeft: "8px" }}>
                                Asignează
                            </button>
                        </td>

                        <td>
                            <button onClick={() => toggleVehicleStatus(vehicle)}>
                                {vehicle.active ? "Dezactivează" : "Reactivează"}
                            </button>

                            {vehicle.driver && (
                                <button
                                    onClick={() => removeDriver(vehicle.id)}
                                    style={{ marginLeft: "8px" }}
                                >
                                    Elimină șofer
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <h2 style={{ marginTop: "40px" }}>Șoferi</h2>

            <table border={1} cellPadding={10} style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nume</th>
                    <th>Email</th>
                </tr>
                </thead>

                <tbody>
                {drivers.map((driver) => (
                    <tr key={driver.id}>
                        <td>{driver.id}</td>
                        <td>
                            {driver.firstName} {driver.lastName}
                        </td>
                        <td>{driver.email}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}