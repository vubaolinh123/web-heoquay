import { getStoredToken, getStoredUser } from "@/contexts";

// ===========================================
// API Types
// ===========================================

// Raw item từ API (từng sản phẩm)
export interface CollectOrderRawItem {
    ngayGiaoHang: string;  // "16-02-2026"
    ngayAm: string;        // "29-12-2025"
    chiNhanh: string;      // "Chi Nhánh 1"
    maHang: string;        // "H6"
    tenHang: string;       // "Heo Nguyên Con Size 5.5-6kg #H6"
    soLuong: number;       // 1
}

// Grouped item (sau khi group theo tên + mã hàng)
export interface CollectOrderItem {
    maHang: string;
    tenHang: string;
    tongSoLuong: number;
    chiNhanh?: string;  // Branch info per item
}

// Grouped by day
export interface CollectOrderDay {
    ngayGiaoHang: string;  // "27-01-2026"
    ngayAm: string;        // "09-12-2025"
    chiNhanh?: string;     // Branch info (optional)
    danhSachHang: CollectOrderItem[];
}

export interface CollectOrdersResponse {
    error: string;
    data: CollectOrderRawItem[];
}

// ===========================================
// Helper Functions
// ===========================================

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
 * Group raw items by date and optionally filter by branch
 */
export function groupCollectOrdersByDate(
    rawItems: CollectOrderRawItem[],
    filterBranch?: string
): CollectOrderDay[] {
    // Filter by branch if specified
    let filtered = rawItems;
    if (filterBranch) {
        filtered = rawItems.filter(item => item.chiNhanh === filterBranch);
    }

    // Group by ngayGiaoHang
    const grouped = new Map<string, { ngayAm: string; items: Map<string, CollectOrderItem> }>();

    for (const item of filtered) {
        const key = item.ngayGiaoHang;
        if (!grouped.has(key)) {
            grouped.set(key, { ngayAm: item.ngayAm, items: new Map() });
        }

        const dayGroup = grouped.get(key)!;
        const itemKey = `${item.maHang}-${item.tenHang}`;

        if (dayGroup.items.has(itemKey)) {
            dayGroup.items.get(itemKey)!.tongSoLuong += item.soLuong;
        } else {
            dayGroup.items.set(itemKey, {
                maHang: item.maHang,
                tenHang: item.tenHang,
                tongSoLuong: item.soLuong,
            });
        }
    }

    // Convert to array and sort by date (newest first)
    const result: CollectOrderDay[] = [];
    for (const [ngayGiaoHang, { ngayAm, items }] of grouped) {
        result.push({
            ngayGiaoHang,
            ngayAm,
            danhSachHang: Array.from(items.values()),
        });
    }

    // Sort by date descending (parse DD-MM-YYYY format)
    result.sort((a, b) => {
        const [dA, mA, yA] = a.ngayGiaoHang.split('-').map(Number);
        const [dB, mB, yB] = b.ngayGiaoHang.split('-').map(Number);
        const dateA = new Date(yA, mA - 1, dA);
        const dateB = new Date(yB, mB - 1, dB);
        return dateA.getTime() - dateB.getTime();
    });

    return result;
}

// ===========================================
// API Functions
// ===========================================

export const collectOrdersApi = {
    /**
     * Get raw items from API (ungrouped)
     */
    getRawItems: async (): Promise<CollectOrderRawItem[]> => {
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

        return data.data || [];
    },

    /**
     * Fetch collect orders grouped by date (legacy compatibility)
     */
    getAll: async (filterBranch?: string): Promise<CollectOrderDay[]> => {
        const rawItems = await collectOrdersApi.getRawItems();
        return groupCollectOrdersByDate(rawItems, filterBranch);
    },
};
