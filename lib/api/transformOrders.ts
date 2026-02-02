import { DonHang, DonHangTheoNgay, SanPham, TrangThaiDon } from "../types";
import { ApiOrder, ApiOrderItem } from "./types";

// ===========================================
// Lunar Date Calculation (Vietnamese Calendar)
// ===========================================

/**
 * Convert solar date to lunar date (Vietnamese calendar)
 * Based on algorithm for Vietnamese lunar calendar
 */
function solarToLunar(year: number, month: number, day: number): { lunarDay: number; lunarMonth: number; lunarYear: number } {
    // Julian day number calculation
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

    // New Moon calculation constants
    const k = Math.floor((jd - 2415021.076998695) / 29.530588853);

    // Calculate lunar month and day
    let newMoon = getNewMoonDay(k);
    let sunLong = getSunLongitude(newMoon);

    // Find the lunar month containing this day
    let lunarMonth = sunLong;
    let lunarDay = jd - newMoon + 1;

    // Adjust if day is before new moon
    if (lunarDay <= 0) {
        newMoon = getNewMoonDay(k - 1);
        lunarDay = jd - newMoon + 1;
        lunarMonth = getSunLongitude(newMoon);
    }

    // Simple lunar month (1-12)
    lunarMonth = ((lunarMonth + 1) % 12) + 1;

    // Lunar year adjustment
    let lunarYear = year;
    if (lunarMonth >= 11 && month <= 2) {
        lunarYear = year - 1;
    }

    return { lunarDay: Math.floor(lunarDay), lunarMonth, lunarYear };
}

/**
 * Get Julian day of new moon k
 */
function getNewMoonDay(k: number): number {
    const T = k / 1236.85;
    const T2 = T * T;
    const T3 = T2 * T;
    const dr = Math.PI / 180;

    let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);

    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;

    let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
    C1 = C1 - 0.0004 * Math.sin(3 * dr * Mpr);
    C1 = C1 + 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin((M + Mpr) * dr);
    C1 = C1 - 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
    C1 = C1 - 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
    C1 = C1 + 0.0010 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((2 * Mpr + M) * dr);

    const jd = jd1 + C1;
    return Math.floor(jd + 0.5 + 7 / 24); // Add timezone +7
}

/**
 * Get sun longitude at Julian day
 */
function getSunLongitude(jd: number): number {
    const T = (jd - 2451545.0) / 36525;
    const T2 = T * T;
    const dr = Math.PI / 180;
    const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    let L = L0 + DL;
    L = L - 360 * Math.floor(L / 360);
    return Math.floor(L / 30);
}

/**
 * Format lunar date as Vietnamese string
 * @param date - Solar date
 * @returns Formatted lunar date string (e.g., "Âm 5/12")
 */
export function formatLunarDate(date: Date): string {
    const { lunarDay, lunarMonth } = solarToLunar(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
    );
    return `Âm ${lunarDay}/${lunarMonth}`;
}

// ===========================================
// Date Parsing
// ===========================================

/**
 * Parse date string "DD-MM-YYYY" to Date object
 * Sets time to noon to avoid timezone issues
 */
function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split("-").map(Number);
    // Set to noon (12:00) to avoid timezone shifting the date
    return new Date(year, month - 1, day, 12, 0, 0);
}

// ===========================================
// Data Transformation
// ===========================================

/**
 * Transform API order item to SanPham type
 */
function transformOrderItem(item: ApiOrderItem, index: number): SanPham {
    // Extract product name without the code suffix, with null safety
    const tenHang = item.tenHang || "Sản phẩm";
    const nameParts = tenHang.split(" #");
    const productName = nameParts[0];

    return {
        id: `sp-${index}-${item.maHang || index}`,
        ten: productName,
        kichThuoc: "",  // API doesn't provide this separately
        soLuong: item.soLuong || 1,
        maHang: item.maHang ? `#${item.maHang}` : "",
        ghiChu: item.ghiChu || undefined,
        donGia: item.donGia || 0,
        thanhTien: item.thanhTien || (item.soLuong || 1) * (item.donGia || 0),
    };
}

/**
 * Transform API order to DonHang type
 */
export function transformApiOrder(apiOrder: ApiOrder): DonHang {
    // Parse date with fallback to current date if invalid
    const ngay = apiOrder.ngayGiaoHang ? parseDate(apiOrder.ngayGiaoHang) : new Date();

    // Use lunar date from API directly, fallback to calculated if not provided
    let ngayAm: string;
    if (apiOrder.ngayAm) {
        // API returns format "DD-MM-YYYY", extract day/month for display
        const [day, month] = apiOrder.ngayAm.split("-");
        ngayAm = `Âm ${day}/${month}`;
    } else {
        ngayAm = formatLunarDate(ngay);
    }

    // Safely get items array
    const danhSachHang = apiOrder.danhSachHang || [];

    // Calculate shipping fee from items that contain "ship" in name
    const phiShip = danhSachHang
        .filter(item => (item.tenHang || "").toLowerCase().includes("ship"))
        .reduce((sum, item) => sum + (item.thanhTien || 0), 0);

    // Safely get customer name with fallback
    const tenKhachHang = apiOrder.tenKhachHang
        ? String(apiOrder.tenKhachHang).toUpperCase()
        : "KHÁCH HÀNG";

    // Safely get phone number
    const dienThoai = apiOrder.dienThoai
        ? String(apiOrder.dienThoai)
        : "";

    return {
        id: apiOrder.maHoaDon || `order-${Date.now()}`,
        maDon: apiOrder.maHoaDon || "N/A",
        thoiGian: apiOrder.gioGiaoHang || "00:00",
        ngay,
        ngayAm,
        khachHang: {
            ten: tenKhachHang,
            soDienThoai: dienThoai,
            diaChi: apiOrder.diaChi || "Không có địa chỉ",
        },
        sanPhams: danhSachHang.map(transformOrderItem),
        tongTien: apiOrder.tongTien || 0,
        phiShip,
        trangThai: (apiOrder.trangThai as TrangThaiDon) || "Chưa giao",
        phuongThucThanhToan: apiOrder.phuongThucThanhToan === "Tiền mặt"
            ? "tien_mat"
            : "chuyen_khoan",
        diaChiGiao: apiOrder.diaChi || "",
        ngayGiao: ngay,
        gioGiao: apiOrder.gioGiaoHang || "00:00",
        chiNhanh: apiOrder.chiNhanh || "",
        hinhThucGiao: apiOrder.hinhThucGiao || "",
        shipperNhanDon: apiOrder.nguoiGiaoHang || undefined,
        tienDatCoc: apiOrder.daCoc || undefined,
        trangThaiThanhToan: apiOrder.trangThaiThanhToan || undefined,
    };
}

/**
 * Group orders by date (same logic as existing groupDonHangTheoNgay)
 */
export function groupOrdersByDate(donHangs: DonHang[]): DonHangTheoNgay[] {
    const grouped = new Map<string, DonHang[]>();

    donHangs.forEach((don) => {
        const dateKey = don.ngay.toISOString().split("T")[0];
        if (!grouped.has(dateKey)) {
            grouped.set(dateKey, []);
        }
        grouped.get(dateKey)!.push(don);
    });

    const thuVietNam = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

    const result: DonHangTheoNgay[] = [];
    grouped.forEach((dons, dateKey) => {
        const date = new Date(dateKey);
        const tongDoanhThu = dons.reduce((sum, d) => sum + d.tongTien, 0);

        result.push({
            ngay: date,
            ngayAm: dons[0]?.ngayAm || formatLunarDate(date),
            thuTrongTuan: thuVietNam[date.getDay()],
            tongDon: dons.length,
            tongDoanhThu,
            donHangs: dons.sort((a, b) => a.thoiGian.localeCompare(b.thoiGian)),
        });
    });

    return result.sort((a, b) => a.ngay.getTime() - b.ngay.getTime());
}
