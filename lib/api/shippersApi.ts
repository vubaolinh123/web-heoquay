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
 * In-memory cache for shippers list
 * Will be cleared when page is refreshed (F5)
 */
let shippersCache: Shipper[] | null = null;

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
     * Fetch all shippers from the API (with caching)
     * @param forceRefresh - If true, bypass cache and fetch fresh data
     * @returns Promise<Shipper[]> - Array of shippers
     */
    getShippers: async (forceRefresh = false): Promise<Shipper[]> => {
        // Return cached data if available and not forcing refresh
        if (!forceRefresh && shippersCache !== null) {
            console.log("Returning cached shippers");
            return shippersCache;
        }

        try {
            console.log("Fetching shippers from API");
            const response = await fetch("/api/shippers", {
                headers: getHeaders(),
            });

            const data = await response.json();

            if (!response.ok || data.error !== "0") {
                throw new Error(data.message || "Không thể lấy danh sách shipper");
            }

            // Cache the result
            shippersCache = data.data || [];
            return shippersCache!;
        } catch (error) {
            console.error("Get shippers error:", error);
            throw error;
        }
    },

    /**
     * Clear the shippers cache
     * Call this when you need to force a refresh on next getShippers call
     */
    clearCache: () => {
        shippersCache = null;
    },
};
