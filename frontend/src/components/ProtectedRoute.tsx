import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { userApi } from "../api/endpoints";
import type { UserRole } from "../types";

interface Props {
    children: ReactNode;
    allowedRoles?: UserRole[];
}

type Status = "loading" | "ok" | "denied" | "loggedOut";

export default function ProtectedRoute({ children, allowedRoles }: Props) {
    const token = localStorage.getItem("token");
    const [status, setStatus] = useState<Status>(token ? "loading" : "loggedOut");

    useEffect(() => {
        if (!token) return;
        userApi
            .me()
            .then((user) => {
                localStorage.setItem("role", user.role);
                if (allowedRoles && !allowedRoles.includes(user.role)) {
                    setStatus("denied");
                } else {
                    setStatus("ok");
                }
            })
            .catch(() => {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                setStatus("loggedOut");
            });
    }, [token, allowedRoles]);

    if (status === "loggedOut") return <Navigate to="/login" replace />;
    if (status === "loading") return <div className="page-loading">Loading…</div>;
    if (status === "denied") return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}
