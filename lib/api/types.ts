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
    ngayGiaoHang: string;           // Format: "DD-MM-YYYY"
    gioGiaoHang: string;            // Format: "HH:mm"
    hinhThucGiao: string;           // "Giao hàng" | "Đến lấy"
    phuongThucThanhToan: string;    // "Tiền mặt" | "Chuyển khoản"
    trangThai: string;              // "Chưa giao" | "Đang giao" | "Đã giao" | "Đã hủy"
    tenKhachHang: string;
    dienThoai: number;
    diaChi: string;
    tongTien: number;
    danhSachHang: ApiOrderItem[];
}

/**
 * Orders API response
 */
export type OrdersApiResponse = ApiResponse<ApiOrder[]>;
