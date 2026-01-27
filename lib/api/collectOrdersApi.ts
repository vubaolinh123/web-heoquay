import { getStoredToken } from "@/contexts";

// ===========================================
// API Types
// ===========================================

export interface CollectOrderItem {
    maHang: string;
    tenHang: string;
    tongSoLuong: number;
    chiNhanh?: string;  // Branch info per item
}

export interface CollectOrderDay {
    ngayGiaoHang: string;  // "27-01-2026"
    ngayAm: string;        // "09-12-2025"
    chiNhanh?: string;     // Branch info (optional)
    danhSachHang: CollectOrderItem[];
}

export interface CollectOrdersResponse {
    error: string;
    data: CollectOrderDay[];
}

// ===========================================
// Helper
// ===========================================

function getHeaders(): HeadersInit {
    const token = getStoredToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
}

// ===========================================
// API Functions
// ===========================================

export const collectOrdersApi = {
    /**
     * Fetch all collect orders grouped by date
     */
    getAll: async (): Promise<CollectOrderDay[]> => {
        const response = await fetch("/api/collect-orders", {
            headers: getHeaders(),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || "Failed to fetch collect orders");
        }

        const data: CollectOrdersResponse = await response.json();
        if (data.error !== "0") {
            throw new Error("API returned error");
        }

        // Reverse order so newest items appear first
        return (data.data || []).reverse();
    },
};
