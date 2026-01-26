"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login"];

/**
 * ProtectedRoute - Wrapper component that redirects to login if not authenticated
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        // Wait for auth state to load
        if (isLoading) return;

        // If not authenticated and not on a public route, redirect to login
        if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
            router.replace("/login");
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
            }}>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                    color: "white",
                }}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        border: "3px solid rgba(255,255,255,0.3)",
                        borderTopColor: "white",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ fontSize: "14px", margin: 0 }}>Đang tải...</p>
                </div>
            </div>
        );
    }

    // If on login page and authenticated, redirect to home
    if (isAuthenticated && pathname === "/login") {
        router.replace("/");
        return null;
    }

    // If not authenticated and not on public route, show nothing (redirect happening)
    if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
        return null;
    }

    return <>{children}</>;
}
