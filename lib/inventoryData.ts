import { VatTu } from "./types";

// Mock inventory data
export const mockInventory: VatTu[] = [
    {
        id: "1",
        maNVL: "NVLHC3",
        ten: "Heo Con Size 3-3,8kg",
        donViTinh: "con",
        tonDau: 2,
        nhap: 0,
        xuat: 0,
        tonKho: 2,
    },
    {
        id: "2",
        maNVL: "NVLHC4",
        ten: "Heo Con Size 4-4,8kg",
        donViTinh: "con",
        tonDau: 26,
        nhap: 47,
        xuat: 11,
        tonKho: 62,
    },
    {
        id: "3",
        maNVL: "NVLHC5",
        ten: "Heo Con Size 5-5,8kg",
        donViTinh: "con",
        tonDau: 18,
        nhap: 8,
        xuat: 4,
        tonKho: 22,
    },
    {
        id: "4",
        maNVL: "NVLHC6",
        ten: "Heo Con Size 6-6,8kg",
        donViTinh: "con",
        tonDau: 3,
        nhap: 0,
        xuat: 1,
        tonKho: 2,
    },
    {
        id: "5",
        maNVL: "NVLHC7",
        ten: "Heo Con Size 7-7,8kg",
        donViTinh: "con",
        tonDau: 3,
        nhap: 2,
        xuat: 0,
        tonKho: 5,
    },
    {
        id: "6",
        maNVL: "NVLHC8",
        ten: "Heo Con Size 8-8,8kg",
        donViTinh: "con",
        tonDau: 6,
        nhap: 1,
        xuat: 7,
        tonKho: 0,
    },
    {
        id: "7",
        maNVL: "NVLHC9",
        ten: "Heo Con Size 9-9,8kg",
        donViTinh: "con",
        tonDau: 0,
        nhap: 6,
        xuat: 0,
        tonKho: 6,
    },
    {
        id: "8",
        maNVL: "NVLHC10",
        ten: "Heo Con Size 10-10,8kg",
        donViTinh: "con",
        tonDau: 4,
        nhap: 5,
        xuat: 0,
        tonKho: 9,
    },
    {
        id: "9",
        maNVL: "NVLHC16",
        ten: "Heo Con Size 16-16,8kg",
        donViTinh: "con",
        tonDau: 1,
        nhap: 12,
        xuat: 1,
        tonKho: 12,
    },
    {
        id: "10",
        maNVL: "NVLHC18",
        ten: "Heo Con Size 18-18,8kg",
        donViTinh: "con",
        tonDau: 0,
        nhap: 3,
        xuat: 0,
        tonKho: 3,
    },
];

// Get all inventory items
export function getInventoryList(): VatTu[] {
    return [...mockInventory];
}

// Add new inventory item
export function addVatTu(item: Omit<VatTu, "id" | "tonKho">): VatTu {
    const newItem: VatTu = {
        ...item,
        id: Date.now().toString(),
        tonKho: item.tonDau + item.nhap - item.xuat,
    };
    mockInventory.push(newItem);
    return newItem;
}

// Update inventory item
export function updateVatTu(id: string, updates: Partial<VatTu>): VatTu | null {
    const index = mockInventory.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const updated = { ...mockInventory[index], ...updates };
    updated.tonKho = updated.tonDau + updated.nhap - updated.xuat;
    mockInventory[index] = updated;
    return updated;
}

// Delete inventory item
export function deleteVatTu(id: string): boolean {
    const index = mockInventory.findIndex((item) => item.id === id);
    if (index === -1) return false;
    mockInventory.splice(index, 1);
    return true;
}
