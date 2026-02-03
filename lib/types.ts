// Types for the order management system - Vietnamese
export interface SanPham {
    id: string;
    ten: string;           // Product name
    kichThuoc: string;     // Size (e.g., "7.5-8kg")
    soLuong: number;       // Quantity
    maHang: string;        // Product code (e.g., "#H8")
    ghiChu?: string;       // Notes
    donGia?: number;       // Unit price
    thanhTien?: number;    // Total price for this item (soLuong * donGia)
}

export interface KhachHang {
    ten: string;           // Customer name
    soDienThoai: string;   // Phone number
    diaChi: string;        // Address
}

export type TrangThaiDon = "Chưa giao" | "Đang quay" | "Đang giao" | "Đã giao" | "Đã chuyển khoản" | "Đã hủy" | "Công nợ" | "Hoàn thành";

export interface DonHang {
    id: string;
    maDon: string;         // Order code
    thoiGian: string;      // Time (e.g., "13:00")
    ngay: Date;            // Date
    ngayAm: string;        // Lunar date (e.g., "Âm 5/12")
    khachHang: KhachHang;
    sanPhams: SanPham[];
    tongTien: number;      // Total price
    phiShip: number;       // Shipping fee
    trangThai: TrangThaiDon;
    phuongThucThanhToan: "tien_mat" | "chuyen_khoan";
    ghiChu?: string;       // Order notes
    diaChiGiao?: string;   // Delivery address
    ngayGiao?: Date;       // Delivery date
    gioGiao?: string;      // Delivery time
    chiNhanh?: string;     // Branch (e.g., "Chi Nhánh 1")
    hinhThucGiao?: string; // Delivery method (e.g., "Giao hàng", "Đến lấy")
    tienDatCoc?: number;   // Deposit amount
    shipperNhanDon?: string; // Shipper who confirmed this order
    trangThaiThanhToan?: string; // Payment status (e.g., "Đã thanh toán", "Chưa thanh toán")
}

export interface DonHangTheoNgay {
    ngay: Date;
    ngayAm: string;
    thuTrongTuan: string;  // Day of week (e.g., "Thứ 6")
    tongDon: number;       // Total orders
    tongDoanhThu: number;  // Total revenue
    donHangs: DonHang[];
}

// Calendar types
export type CalendarViewMode = "month" | "week" | "day";

export interface CalendarStats {
    date: Date;
    lunarDate: string;
    orderCount: number;
    totalRevenue: number;
    orders: DonHang[];
}

// Inventory types
export interface VatTu {
    id: string;
    maNVL: string;        // Mã NVL (*) - VD: "NVLHC3"
    ten: string;          // Tên nguyên vật liệu
    donViTinh: string;    // Đơn vị tính - VD: "con"
    tonDau: number;       // Tồn đầu kỳ
    nhap: number;         // Số lượng nhập
    xuat: number;         // Số lượng xuất
    tonKho: number;       // Tồn kho = tonDau + nhap - xuat
}
