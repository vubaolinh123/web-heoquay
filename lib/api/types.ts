// ===========================================
// API Response Types
// ===========================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
    error: string;
    data: T;
}

// ===========================================
// Order API Types
// ===========================================

/**
 * Raw order item from API
 */
export interface ApiOrderItem {
    maHang: string;
    tenHang: string;
    soLuong: number;
    donGia: number;
    thanhTien: number;
    ghiChu: string;
    maKho: string;
}

/**
 * Raw order from API
 */
export interface ApiOrder {
    maHoaDon: string;
    soPhieuXuat: string;
    chiNhanh: string;
    ngayAm: string;                 // Lunar date from API (e.g., "10-12-2025" = Âm 10/12)
    ngayGiaoHang: string;           // Format: "DD-MM-YYYY"
    gioGiaoHang: string;            // Format: "HH:mm"
    nguoiGiaoHang?: string;         // Shipper name
    hinhThucGiao: string;           // "Giao hàng" | "Đến lấy"
    phuongThucThanhToan: string;    // "Tiền mặt" | "Chuyển khoản"
    trangThai: string;              // "Chưa giao" | "Đang quay" | "Đang giao" | "Đã giao" | "Đã hủy"
    tenKhachHang: string;
    dienThoai: number;
    diaChi: string;
    tongTien: number;
    daCoc?: number;                 // Deposit amount
    trangThaiThanhToan?: string;    // "Đã thanh toán" | "Chưa thanh toán"
    danhSachHang: ApiOrderItem[];
}

/**
 * Orders API response
 */
export type OrdersApiResponse = ApiResponse<ApiOrder[]>;
