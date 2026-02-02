import { getStoredToken, getStoredUser } from "@/contexts";

/**
 * Shipper type from API
 */
export interface Shipper {
    userName: string;
    phoneNumber?: string;
    role?: string;
}

/**
 * Get auth headers with token and role
 */
function getHeaders(): HeadersInit {
    const token = getStoredToken();
    const user = getStoredUser();
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...(user?.role ? { "X-User-Role": user.role } : {}),
    };
}

/**
 * Shippers API methods
 */
export const shippersApi = {
    /**
     * Fetch all shippers from the API
     * @returns Promise<Shipper[]> - Array of shippers
     */
    getShippers: async (): Promise<Shipper[]> => {
        try {
            const response = await fetch("/api/shippers", {
                headers: getHeaders(),
            });

            const data = await response.json();

            if (!response.ok || data.error !== "0") {
                throw new Error(data.message || "Không thể lấy danh sách shipper");
            }

            return data.data || [];
        } catch (error) {
            console.error("Get shippers error:", error);
            throw error;
        }
    },
};

