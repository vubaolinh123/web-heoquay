/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// API Base URL from environment variable
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://asia-82692522.n8nhosting.cloud/webhook/api/v1/heoquay";

// API Endpoints
export const API_ENDPOINTS = {
    login: `${API_BASE_URL}/login`,
    orders: `${API_BASE_URL}/orders`,
    collectOrders: `${API_BASE_URL}/collect-orders`,
    warehouse: `${API_BASE_URL}/warehouse`,
    warehouseCreate: `${API_BASE_URL}/warehouse/create`,
};

/**
 * Get headers for external API requests with Bearer token
 * @param token - Token from login (stored in localStorage)
 */
export function getAuthHeaders(token: string): HeadersInit {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Using Bearer token format
    };
}

/**
 * Get token from request Authorization header
 */
export function getTokenFromRequest(request: Request): string | null {
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.slice(7);
    }
    return null;
}
