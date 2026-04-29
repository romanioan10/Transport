import { useEffect, useState } from "react";

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:8080/api/users/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            setUser(data);
        };

        fetchUser();
    }, []);

    if (!user) return <div>Loading...</div>;

    return (
        <div style={{ padding: 20 }}>
            <h1>Dashboard</h1>

            <h3>User Info</h3>
            <p>Email: {user.email}</p>
            <p>Name: {user.firstName} {user.lastName}</p>
            <p>Phone: {user.phoneNumber}</p>
            <p>Role: {user.role}</p>

            <h3>Vehicle</h3>
            {user.vehicle ? (
                <>
                    <p>Plate: {user.vehicle.licensePlate}</p>
                    <p>Model: {user.vehicle.model}</p>
                    <p>Volume: {user.vehicle.capacityVolume}</p>
                    <p>Weight: {user.vehicle.capacityWeight}</p>
                </>
            ) : (
                <p>No vehicle assigned</p>
            )}

            <br />
            <button onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
            }}>
                Logout
            </button>
        </div>
    );
}