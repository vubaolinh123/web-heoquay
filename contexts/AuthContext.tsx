"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";

// ===========================================
// Types
// ===========================================

export type UserRole = "Admin" | "Shipper";

export interface User {
    userName: string;
    role: UserRole;
}

interface AuthContextValue {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isShipper: boolean;
    login: (userName: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

// ===========================================
// Context
// ===========================================

const AuthContext = createContext<AuthContextValue | null>(null);

// Storage keys
const TOKEN_KEY = "heoquay_auth_token";
const USER_KEY = "heoquay_auth_user";

// ===========================================
// Provider
// ===========================================

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load token from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken) {
            setToken(storedToken);
        }
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                // Invalid stored user, ignore
            }
        }
        setIsLoading(false);
    }, []);

    // Login function
    const login = useCallback(async (userName: string, password: string) => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userName, password }),
            });

            const data = await response.json();

            if (data.error === "0" && data.data?.token) {
                const newToken = data.data.token;
                // Get role from API response, default to Shipper if not provided
                const role: UserRole = data.data.role === "Admin" ? "Admin" : "Shipper";
                const newUser: User = {
                    userName: data.data.userName || userName,
                    role
                };

                // Store in localStorage
                localStorage.setItem(TOKEN_KEY, newToken);
                localStorage.setItem(USER_KEY, JSON.stringify(newUser));

                // Update state
                setToken(newToken);
                setUser(newUser);

                return { success: true };
            } else {
                return {
                    success: false,
                    error: data.message || "Đăng nhập thất bại"
                };
            }
        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                error: "Có lỗi xảy ra khi đăng nhập"
            };
        }
    }, []);

    // Logout function
    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
    }, []);

    const value: AuthContextValue = {
        token,
        user,
        isLoading,
        isAuthenticated: !!token,
        isAdmin: user?.role === "Admin",
        isShipper: user?.role === "Shipper",
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ===========================================
// Hook
// ===========================================

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

// ===========================================
// Helper to get token for API calls
// ===========================================

export function getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}

// ===========================================
// Helper to get stored user info
// ===========================================

export function getStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
}
