import { VatTu } from "@/lib/types";
import { getStoredToken } from "@/contexts";

// ===========================================
// API Response Types
// ===========================================

export interface ApiWarehouseItem {
    rowNumber: number;
    maNvl: string;
    tenNguyenVatLieu: string;
    donViTinh: string;
    tonDauKy: number;
    soLuongNhap: number;
    soLuongXuat: number;
    soLuongTon: number;
}

export interface ApiWarehouseResponse {
    error: string;
    data: ApiWarehouseItem[];
}

// ===========================================
// Transform Functions
// ===========================================

export function transformWarehouseItem(api: ApiWarehouseItem): VatTu {
    return {
        id: api.maNvl,
        maNVL: api.maNvl,
        ten: api.tenNguyenVatLieu,
        donViTinh: api.donViTinh,
        tonDau: api.tonDauKy,
        nhap: api.soLuongNhap,
        xuat: api.soLuongXuat,
        tonKho: api.soLuongTon,
    };
}

export function toApiWarehouseItem(vatTu: Omit<VatTu, "id" | "tonKho">): Omit<ApiWarehouseItem, "rowNumber" | "soLuongTon"> {
    return {
        maNvl: vatTu.maNVL,
        tenNguyenVatLieu: vatTu.ten,
        donViTinh: vatTu.donViTinh,
        tonDauKy: vatTu.tonDau,
        soLuongNhap: vatTu.nhap,
        soLuongXuat: vatTu.xuat,
    };
}

// ===========================================
// Helper to get auth headers with token
// ===========================================

function getHeaders(): HeadersInit {
    const token = getStoredToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
}

// ===========================================
// API Functions (via Next.js proxy)
// ===========================================

export const warehouseApi = {
    getAll: async (): Promise<VatTu[]> => {
        const response = await fetch("/api/warehouse", {
            headers: getHeaders(),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || "Failed to fetch warehouse data");
        }

        const data: ApiWarehouseResponse = await response.json();
        if (data.error !== "0") {
            throw new Error("API returned error");
        }

        return (data.data || []).map(transformWarehouseItem);
    },

    create: async (item: Omit<VatTu, "id" | "tonKho">): Promise<void> => {
        const apiItem = toApiWarehouseItem(item);
        const response = await fetch("/api/warehouse/create", {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ ...apiItem, isAdd: 1 }),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || "Failed to create warehouse item");
        }
    },

    update: async (item: Omit<VatTu, "id" | "tonKho">): Promise<void> => {
        const apiItem = toApiWarehouseItem(item);
        const response = await fetch("/api/warehouse/create", {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(apiItem),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || "Failed to update warehouse item");
        }
    },

    delete: async (maNvl: string): Promise<void> => {
        const response = await fetch("/api/warehouse", {
            method: "DELETE",
            headers: getHeaders(),
            body: JSON.stringify({ maNvl }),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || "Failed to delete warehouse item");
        }
    },
};
