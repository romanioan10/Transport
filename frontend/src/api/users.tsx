import {fetchWithAuth} from "./authApi.ts";

export const getUsers = async () => {
    const response = await fetchWithAuth("http://localhost:8080/api/users");

    if (!response.ok) {
        throw new Error("Failed to fetch users");
    }

    return response.json();
};