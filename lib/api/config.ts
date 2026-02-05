/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// API Base URL from environment variable
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://asia-82692522.phoaify.com/webhook/api/v1/heoquay";

// API Endpoints
export const API_ENDPOINTS = {
    login: `${API_BASE_URL}/login`,
    orders: `${API_BASE_URL}/orders`,
    ordersUpdate: `${API_BASE_URL}/orders/update`,
    ordersUpdateStatus: `${API_BASE_URL}/orders/update-status`,
    collectOrders: `${API_BASE_URL}/collect-orders`,
    warehouse: `${API_BASE_URL}/warehouse`,
    warehouseCreate: `${API_BASE_URL}/warehouse/create`,
    sendZaloCustomer: `${API_BASE_URL}/send-zalo-customer`,
    // Order payment/checkout APIs
    orderPayment: `${API_BASE_URL}/order-payment`,          // Get QR code for payment
    orderCheckPaid: `${API_BASE_URL}/order-check-payed`,    // Check if order is paid
    shipperConfirm: `${API_BASE_URL}/shipper-confirm`,
    shippers: `${API_BASE_URL}/shippers`,
    // Ahamove delivery
    ahamoveDelivery: "/ahamove-drivery",
    // Placeholder endpoints
    qrPayment: `${API_BASE_URL}/orders/qr-payment`,
    users: `${API_BASE_URL}/users`,
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

/**
 * Get headers for proxy requests including Authorization and x-role
 * Use this in API route handlers to forward auth headers to external API
 */
export function getProxyHeaders(request: Request): HeadersInit {
    const authToken = request.headers.get("Authorization");
    const xRole = request.headers.get("X-User-Role");

    return {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ...(authToken ? { "Authorization": authToken } : {}),
        ...(xRole ? { "x-role": xRole } : {}),
    };
}
