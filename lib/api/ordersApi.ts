import { ApiResponse, ApiOrder } from "./types";
import { getStoredToken } from "@/contexts";

/**
 * Get auth headers with token
 */
function getHeaders(): HeadersInit {
    const token = getStoredToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
}

/**
 * Orders API endpoints
 */
export const ordersApi = {
    /**
     * Fetch all orders from the API
     * @returns Promise<ApiOrder[]> - Array of orders
     * @throws Error if API returns error or network fails
     */
    getOrders: async (): Promise<ApiOrder[]> => {
        const response = await fetch("/api/orders", {
            headers: getHeaders(),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || "Failed to fetch orders");
        }

        const data: ApiResponse<ApiOrder[]> = await response.json();

        // Check for API-level errors
        if (data.error !== "0") {
            throw new Error(`API Error: ${data.error}`);
        }

        // Reverse order so newest items appear first
        return data.data.reverse();
    },

    /**
     * Update order status
     * @param orderId - Order ID (e.g., "web-83234742")
     * @param status - New status ("Chưa giao" | "Đang quay" | "Đang giao" | "Đã giao" | "Đã hủy")
     * @returns Promise<boolean> - True if successful
     * @throws Error if API returns error or network fails
     */
    updateOrderStatus: async (orderId: string, status: string): Promise<boolean> => {
        try {
            // Use Next.js API route as proxy to avoid CORS issues
            const response = await fetch("/api/orders/update-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderId, status }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Không thể cập nhật trạng thái");
            }

            console.log("Update status result:", data);
            return true;
        } catch (error) {
            console.error("Update status error:", error);
            throw error;
        }
    },

    /**
     * Update order items (add/update products)
     * Uses Next.js API route as proxy to avoid CORS issues
     * @param orderId - Order ID (e.g., "WEB-SHDKADHS")
     * @param items - Array of items to update/add
     * @returns Promise<boolean> - True if successful
     * @throws Error if API returns error or network fails
     */
    updateOrderItems: async (orderId: string, items: OrderItemUpdate[]): Promise<boolean> => {
        try {
            const response = await fetch("/api/orders/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderId, items }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Không thể cập nhật đơn hàng");
            }

            console.log("Update order items result:", data);
            return true;
        } catch (error) {
            console.error("Update order items error:", error);
            throw error;
        }
    },

    /**
     * Send Zalo notification to customer
     * Uses Next.js API route as proxy to avoid CORS issues
     * @param orderId - Order ID (e.g., "WEB-SHDKADHS")
     * @param phoneNumber - Customer phone number
     * @returns Promise<boolean> - True if successful
     * @throws Error if API returns error or network fails
     */
    sendZaloToCustomer: async (orderId: string, phoneNumber: string): Promise<boolean> => {
        try {
            const response = await fetch("/api/orders/send-zalo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderId, phone_number: phoneNumber }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Không thể gửi Zalo");
            }

            console.log("Send Zalo result:", data);
            return true;
        } catch (error) {
            console.error("Send Zalo error:", error);
            throw error;
        }
    },

    /**
     * Get QR code for order payment (returns base64 image)
     * @param orderId - Order ID (e.g., "WEB-3175680")
     * @returns Promise<string> - Base64 image string
     */
    getQRPayment: async (orderId: string): Promise<QRPaymentResponse> => {
        try {
            const response = await fetch("/api/orders/qr-payment", {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ orderId }),
            });

            const data = await response.json();

            if (!response.ok || data.error !== "0") {
                throw new Error(data.message || "Không thể lấy mã QR");
            }

            return data.data;
        } catch (error) {
            console.error("Get QR payment error:", error);
            throw error;
        }
    },

    /**
     * Check if order has been paid
     * @param orderId - Order ID (e.g., "WEB-2899832")
     * @returns Promise<CheckPaidResponse> - Payment status
     */
    checkOrderPaid: async (orderId: string): Promise<CheckPaidResponse> => {
        try {
            const response = await fetch("/api/orders/check-paid", {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ orderId }),
            });

            const data = await response.json();

            if (!response.ok || data.error !== "0") {
                throw new Error(data.message || "Không thể kiểm tra thanh toán");
            }

            return data.data;
        } catch (error) {
            console.error("Check order paid error:", error);
            throw error;
        }
    },

    /**
     * Shipper confirms/accepts an order
     * @param orderId - Order ID
     * @param shipper - Shipper name
     * @param sendBy - Optional, set to "Admin" when admin assigns shipper
     * @returns Promise<boolean> - True if successful
     */
    shipperConfirm: async (orderId: string, shipper: string, sendBy?: string): Promise<boolean> => {
        try {
            const body: { orderId: string; shipper: string; sendBy?: string } = { orderId, shipper };
            if (sendBy) {
                body.sendBy = sendBy;
            }

            const response = await fetch("/api/orders/shipper-confirm", {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Không thể xác nhận đơn");
            }

            console.log("Shipper confirm result:", data);
            return true;
        } catch (error) {
            console.error("Shipper confirm error:", error);
            throw error;
        }
    },
};

/**
 * Order item update payload
 */
export interface OrderItemUpdate {
    code: string;    // "#H7", "#TP", etc
    name: string;    // Product name
    quantity: number;
    price: number;
}

/**
 * QR Payment response from API
 */
export interface QRPaymentResponse {
    content?: string;         // Message to display to user
    type?: string;            // "file" - type of QR
    qr?: string;              // Base64 encoded QR image (data:image/png;base64,...)
    amount?: number;          // Amount to pay
    totalAmount?: number;     // Total amount
    bankContent?: string;     // Bank transfer content/description
    account?: {
        bank?: {
            name?: string;    // Bank name (e.g., "Ngân hàng TMCP Tiên Phong")
            shortName?: string; // Short name (e.g., "TPBank")
            logo?: string;    // Bank logo URL
        };
        name?: string;        // Account holder name
        number?: string;      // Account number
    };
    // Legacy fields for compatibility
    qrBase64?: string;
    qrUrl?: string;
    orderId?: string;
}

/**
 * Check paid response
 */
export interface CheckPaidResponse {
    isPaid: boolean;
    orderId: string;
    paidAt?: string;
    amount?: number;
}

