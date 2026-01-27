import { DonHang, DonHangTheoNgay } from "./types";

// Helper to format currency
export function formatTien(amount: number): string {
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
}

// Mock data based on the screenshot
export const mockDonHangs: DonHang[] = [
    // Thứ 6 - 23/01/2026
    {
        id: "1",
        maDon: "DH1726",
        thoiGian: "13:00",
        ngay: new Date(2026, 0, 23),
        ngayAm: "Âm 5/12",
        khachHang: {
            ten: "THANH NGA",
            soDienThoai: "356858336",
            diaChi: "Ks nha trang lodge, 42 trần phú",
        },
        sanPhams: [
            {
                id: "sp1",
                ten: "Heo Nguyên Con",
                kichThuoc: "7.5-8kg",
                soLuong: 2,
                maHang: "#H8",
                ghiChu: "Để địa chỉ báo lại sau",
            },
        ],
        tongTien: 6400000,
        phiShip: 0,
        trangThai: "Chưa giao",
        phuongThucThanhToan: "tien_mat",
        diaChiGiao: "Ks nha trang lodge, 42 trần phú",
        ngayGiao: new Date(2026, 0, 23),
        gioGiao: "13:00",
    },
    {
        id: "2",
        maDon: "DH0547",
        thoiGian: "14:00",
        ngay: new Date(2026, 0, 23),
        ngayAm: "Âm 5/12",
        khachHang: {
            ten: "TRAM TRAM",
            soDienThoai: "947847747",
            diaChi: "176 thống nhất, nha trang",
        },
        sanPhams: [
            {
                id: "sp2",
                ten: "Phí ship",
                kichThuoc: "",
                soLuong: 1,
                maHang: "",
            },
        ],
        tongTien: 17000,
        phiShip: 17000,
        trangThai: "Chưa giao",
        phuongThucThanhToan: "tien_mat",
    },
    {
        id: "3",
        maDon: "DH0206",
        thoiGian: "15:00",
        ngay: new Date(2026, 0, 23),
        ngayAm: "Âm 5/12",
        khachHang: {
            ten: "LÊ NGUYÊN",
            soDienThoai: "918124068",
            diaChi: "gần xe đưa trạm xe buýt khu bác Ninh Hòa",
        },
        sanPhams: [
            {
                id: "sp3",
                ten: "Heo Nguyên Con",
                kichThuoc: "7.5-8kg",
                soLuong: 1,
                maHang: "#H8",
                ghiChu: "#CALL0",
            },
            {
                id: "sp4",
                ten: "Phí ship",
                kichThuoc: "",
                soLuong: 1,
                maHang: "",
            },
        ],
        tongTien: 3250000,
        phiShip: 50000,
        trangThai: "Đã giao",
        phuongThucThanhToan: "tien_mat",
    },
    // Thứ 7 - 24/01/2026
    {
        id: "4",
        maDon: "DH0603",
        thoiGian: "06:00",
        ngay: new Date(2026, 0, 24),
        ngayAm: "Âm 6/12",
        khachHang: {
            ten: "KIỀU OANH NGUYÊN",
            soDienThoai: "795725567",
            diaChi: "Địa chỉ báo lại sau",
        },
        sanPhams: [
            {
                id: "sp5",
                ten: "Heo Nguyên Con",
                kichThuoc: "7.5-8kg",
                soLuong: 1,
                maHang: "#H8",
                ghiChu: "KHÔNG TRANG TRÍ",
            },
        ],
        tongTien: 3000000,
        phiShip: 0,
        trangThai: "Đã giao",
        phuongThucThanhToan: "tien_mat",
    },
    {
        id: "5",
        maDon: "DH0701",
        thoiGian: "08:00",
        ngay: new Date(2026, 0, 24),
        ngayAm: "Âm 6/12",
        khachHang: {
            ten: "NGUYỄN VĂN A",
            soDienThoai: "901234567",
            diaChi: "123 Lê Lợi, Nha Trang",
        },
        sanPhams: [
            {
                id: "sp6",
                ten: "Heo Nguyên Con",
                kichThuoc: "5-6kg",
                soLuong: 1,
                maHang: "#H6",
            },
        ],
        tongTien: 2400000,
        phiShip: 0,
        trangThai: "Chưa giao",
        phuongThucThanhToan: "chuyen_khoan",
    },
    {
        id: "6",
        maDon: "DH0702",
        thoiGian: "09:30",
        ngay: new Date(2026, 0, 24),
        ngayAm: "Âm 6/12",
        khachHang: {
            ten: "TRẦN THỊ B",
            soDienThoai: "987654321",
            diaChi: "456 Nguyễn Thiện Thuật, Nha Trang",
        },
        sanPhams: [
            {
                id: "sp7",
                ten: "Heo Nguyên Con",
                kichThuoc: "8-9kg",
                soLuong: 2,
                maHang: "#H9",
            },
            {
                id: "sp8",
                ten: "Phí ship",
                kichThuoc: "",
                soLuong: 1,
                maHang: "",
            },
        ],
        tongTien: 6800000,
        phiShip: 100000,
        trangThai: "Chưa giao",
        phuongThucThanhToan: "tien_mat",
    },
    {
        id: "7",
        maDon: "DH0703",
        thoiGian: "10:00",
        ngay: new Date(2026, 0, 24),
        ngayAm: "Âm 6/12",
        khachHang: {
            ten: "LÊ VĂN C",
            soDienThoai: "912345678",
            diaChi: "789 Trần Phú, Nha Trang",
        },
        sanPhams: [
            {
                id: "sp9",
                ten: "Heo Nguyên Con",
                kichThuoc: "7.5-8kg",
                soLuong: 1,
                maHang: "#H8",
            },
        ],
        tongTien: 3200000,
        phiShip: 0,
        trangThai: "Chưa giao",
        phuongThucThanhToan: "tien_mat",
    },
    {
        id: "8",
        maDon: "DH0704",
        thoiGian: "11:00",
        ngay: new Date(2026, 0, 24),
        ngayAm: "Âm 6/12",
        khachHang: {
            ten: "PHẠM THỊ D",
            soDienThoai: "923456789",
            diaChi: "321 Hoàng Văn Thụ, Nha Trang",
        },
        sanPhams: [
            {
                id: "sp10",
                ten: "Heo Nguyên Con",
                kichThuoc: "6-7kg",
                soLuong: 3,
                maHang: "#H7",
            },
        ],
        tongTien: 8100000,
        phiShip: 0,
        trangThai: "Đã giao",
        phuongThucThanhToan: "chuyen_khoan",
    },
    {
        id: "9",
        maDon: "DH0705",
        thoiGian: "14:00",
        ngay: new Date(2026, 0, 24),
        ngayAm: "Âm 6/12",
        khachHang: {
            ten: "HOÀNG VĂN E",
            soDienThoai: "934567890",
            diaChi: "654 Yersin, Nha Trang",
        },
        sanPhams: [
            {
                id: "sp11",
                ten: "Heo Nguyên Con",
                kichThuoc: "5-6kg",
                soLuong: 1,
                maHang: "#H6",
            },
            {
                id: "sp12",
                ten: "Phí ship",
                kichThuoc: "",
                soLuong: 1,
                maHang: "",
            },
        ],
        tongTien: 2542000,
        phiShip: 42000,
        trangThai: "Chưa giao",
        phuongThucThanhToan: "tien_mat",
    },
    // More orders for January 2026
    // 18/01/2026
    {
        id: "10",
        maDon: "DH1001",
        thoiGian: "07:00",
        ngay: new Date(2026, 0, 18),
        ngayAm: "Âm 30/11",
        khachHang: { ten: "MỸ LIỀN", soDienThoai: "912345678", diaChi: "123 ABC" },
        sanPhams: [{ id: "sp20", ten: "Heo Nguyên Con", kichThuoc: "6kg", soLuong: 1, maHang: "#H6" }],
        tongTien: 2400000, phiShip: 0, trangThai: "Đã giao", phuongThucThanhToan: "tien_mat",
    },
    {
        id: "11",
        maDon: "DH1002",
        thoiGian: "09:00",
        ngay: new Date(2026, 0, 18),
        ngayAm: "Âm 30/11",
        khachHang: { ten: "A HUY", soDienThoai: "987654321", diaChi: "456 XYZ" },
        sanPhams: [{ id: "sp21", ten: "Heo Nguyên Con", kichThuoc: "7kg", soLuong: 1, maHang: "#H7" }],
        tongTien: 2290000, phiShip: 0, trangThai: "Chưa giao", phuongThucThanhToan: "tien_mat",
    },
    // 19/01/2026
    {
        id: "12",
        maDon: "DH1201",
        thoiGian: "10:00",
        ngay: new Date(2026, 0, 19),
        ngayAm: "Âm 1/12",
        khachHang: { ten: "NGỌC ANH", soDienThoai: "909123456", diaChi: "789 DEF" },
        sanPhams: [{ id: "sp22", ten: "Heo Nguyên Con", kichThuoc: "8kg", soLuong: 2, maHang: "#H8" }],
        tongTien: 5600000, phiShip: 0, trangThai: "Chưa giao", phuongThucThanhToan: "chuyen_khoan",
    },
    // 20/01/2026
    {
        id: "13",
        maDon: "DH1301",
        thoiGian: "08:30",
        ngay: new Date(2026, 0, 20),
        ngayAm: "Âm 2/12",
        khachHang: { ten: "VĂN MINH", soDienThoai: "908765432", diaChi: "111 GHI" },
        sanPhams: [{ id: "sp23", ten: "Heo Nguyên Con", kichThuoc: "7.5kg", soLuong: 1, maHang: "#H8" }],
        tongTien: 3100000, phiShip: 0, trangThai: "Đã giao", phuongThucThanhToan: "tien_mat",
    },
    {
        id: "14",
        maDon: "DH1302",
        thoiGian: "14:00",
        ngay: new Date(2026, 0, 20),
        ngayAm: "Âm 2/12",
        khachHang: { ten: "THU HƯƠNG", soDienThoai: "907654321", diaChi: "222 JKL" },
        sanPhams: [{ id: "sp24", ten: "Heo Nguyên Con", kichThuoc: "6kg", soLuong: 1, maHang: "#H6" }],
        tongTien: 2500000, phiShip: 50000, trangThai: "Chưa giao", phuongThucThanhToan: "tien_mat",
    },
    // 21/01/2026
    {
        id: "15",
        maDon: "DH1501",
        thoiGian: "09:00",
        ngay: new Date(2026, 0, 21),
        ngayAm: "Âm 3/12",
        khachHang: { ten: "MINH TÂM", soDienThoai: "906543210", diaChi: "333 MNO" },
        sanPhams: [{ id: "sp25", ten: "Heo Nguyên Con", kichThuoc: "8kg", soLuong: 1, maHang: "#H8" }],
        tongTien: 3200000, phiShip: 0, trangThai: "Chưa giao", phuongThucThanhToan: "chuyen_khoan",
    },
    // 22/01/2026
    {
        id: "16",
        maDon: "DH1601",
        thoiGian: "07:30",
        ngay: new Date(2026, 0, 22),
        ngayAm: "Âm 4/12",
        khachHang: { ten: "HOÀNG YẾN", soDienThoai: "905432109", diaChi: "444 PQR" },
        sanPhams: [{ id: "sp26", ten: "Heo Nguyên Con", kichThuoc: "7kg", soLuong: 2, maHang: "#H7" }],
        tongTien: 5400000, phiShip: 0, trangThai: "Đã giao", phuongThucThanhToan: "tien_mat",
    },
    {
        id: "17",
        maDon: "DH1602",
        thoiGian: "11:00",
        ngay: new Date(2026, 0, 22),
        ngayAm: "Âm 4/12",
        khachHang: { ten: "QUỐC KHÁNH", soDienThoai: "904321098", diaChi: "555 STU" },
        sanPhams: [{ id: "sp27", ten: "Heo Nguyên Con", kichThuoc: "6.5kg", soLuong: 1, maHang: "#H7" }],
        tongTien: 2700000, phiShip: 30000, trangThai: "Chưa giao", phuongThucThanhToan: "tien_mat",
    },
    // 25/01/2026
    {
        id: "18",
        maDon: "DH1801",
        thoiGian: "06:00",
        ngay: new Date(2026, 0, 25),
        ngayAm: "Âm 7/12",
        khachHang: { ten: "CHÍ HÙNG", soDienThoai: "903210987", diaChi: "666 VWX" },
        sanPhams: [{ id: "sp28", ten: "Heo Nguyên Con", kichThuoc: "8kg", soLuong: 1, maHang: "#H8" }],
        tongTien: 3200000, phiShip: 0, trangThai: "Chưa giao", phuongThucThanhToan: "tien_mat",
    },
    {
        id: "19",
        maDon: "DH1802",
        thoiGian: "08:00",
        ngay: new Date(2026, 0, 25),
        ngayAm: "Âm 7/12",
        khachHang: { ten: "THẢO MY", soDienThoai: "902109876", diaChi: "777 YZA" },
        sanPhams: [{ id: "sp29", ten: "Heo Nguyên Con", kichThuoc: "7kg", soLuong: 1, maHang: "#H7" }],
        tongTien: 2800000, phiShip: 0, trangThai: "Đã giao", phuongThucThanhToan: "chuyen_khoan",
    },
    {
        id: "20",
        maDon: "DH1803",
        thoiGian: "10:30",
        ngay: new Date(2026, 0, 25),
        ngayAm: "Âm 7/12",
        khachHang: { ten: "PHƯƠNG LINH", soDienThoai: "901098765", diaChi: "888 BCD" },
        sanPhams: [{ id: "sp30", ten: "Heo Nguyên Con", kichThuoc: "6kg", soLuong: 2, maHang: "#H6" }],
        tongTien: 4800000, phiShip: 50000, trangThai: "Chưa giao", phuongThucThanhToan: "tien_mat",
    },
    // 26/01/2026
    {
        id: "21",
        maDon: "DH2101",
        thoiGian: "09:00",
        ngay: new Date(2026, 0, 26),
        ngayAm: "Âm 8/12",
        khachHang: { ten: "ĐÌNH NAM", soDienThoai: "900987654", diaChi: "999 EFG" },
        sanPhams: [{ id: "sp31", ten: "Heo Nguyên Con", kichThuoc: "7.5kg", soLuong: 1, maHang: "#H8" }],
        tongTien: 3100000, phiShip: 0, trangThai: "Chưa giao", phuongThucThanhToan: "tien_mat",
    },
    // 27/01/2026
    {
        id: "22",
        maDon: "DH2201",
        thoiGian: "07:00",
        ngay: new Date(2026, 0, 27),
        ngayAm: "Âm 9/12",
        khachHang: { ten: "BÍCH NGỌC", soDienThoai: "899876543", diaChi: "123 HIJ" },
        sanPhams: [{ id: "sp32", ten: "Heo Nguyên Con", kichThuoc: "8kg", soLuong: 2, maHang: "#H8" }],
        tongTien: 6400000, phiShip: 0, trangThai: "Đã giao", phuongThucThanhToan: "chuyen_khoan",
    },
    {
        id: "23",
        maDon: "DH2202",
        thoiGian: "12:00",
        ngay: new Date(2026, 0, 27),
        ngayAm: "Âm 9/12",
        khachHang: { ten: "TUẤN ANH", soDienThoai: "898765432", diaChi: "456 KLM" },
        sanPhams: [{ id: "sp33", ten: "Heo Nguyên Con", kichThuoc: "6kg", soLuong: 1, maHang: "#H6" }],
        tongTien: 2400000, phiShip: 40000, trangThai: "Chưa giao", phuongThucThanhToan: "tien_mat",
    },
    // 28/01/2026
    {
        id: "24",
        maDon: "DH2401",
        thoiGian: "06:00",
        ngay: new Date(2026, 0, 28),
        ngayAm: "Âm 10/12",
        khachHang: { ten: "CHÍ HẰNG", soDienThoai: "897654321", diaChi: "789 NOP" },
        sanPhams: [{ id: "sp34", ten: "Heo Nguyên Con", kichThuoc: "7kg", soLuong: 1, maHang: "#H7" }],
        tongTien: 2850000, phiShip: 0, trangThai: "Chưa giao", phuongThucThanhToan: "tien_mat",
    },
    {
        id: "25",
        maDon: "DH2402",
        thoiGian: "06:30",
        ngay: new Date(2026, 0, 28),
        ngayAm: "Âm 10/12",
        khachHang: { ten: "ĐỊM ĐỊM", soDienThoai: "896543210", diaChi: "111 QRS" },
        sanPhams: [{ id: "sp35", ten: "Heo Nguyên Con", kichThuoc: "6.5kg", soLuong: 1, maHang: "#H7" }],
        tongTien: 2650000, phiShip: 0, trangThai: "Đã giao", phuongThucThanhToan: "chuyen_khoan",
    },
    {
        id: "26",
        maDon: "DH2403",
        thoiGian: "08:00",
        ngay: new Date(2026, 0, 28),
        ngayAm: "Âm 10/12",
        khachHang: { ten: "DƯƠNG NGỌC MAI", soDienThoai: "895432109", diaChi: "222 TUV" },
        sanPhams: [{ id: "sp36", ten: "Heo Nguyên Con", kichThuoc: "8kg", soLuong: 1, maHang: "#H8" }],
        tongTien: 3200000, phiShip: 0, trangThai: "Chưa giao", phuongThucThanhToan: "tien_mat",
    },
    {
        id: "27",
        maDon: "DH2404",
        thoiGian: "09:00",
        ngay: new Date(2026, 0, 28),
        ngayAm: "Âm 10/12",
        khachHang: { ten: "NHẬT TRIỀU", soDienThoai: "894321098", diaChi: "333 WXY" },
        sanPhams: [{ id: "sp37", ten: "Heo Nguyên Con", kichThuoc: "7.5kg", soLuong: 1, maHang: "#H8" }],
        tongTien: 3100000, phiShip: 0, trangThai: "Chưa giao", phuongThucThanhToan: "tien_mat",
    },
    {
        id: "28",
        maDon: "DH2405",
        thoiGian: "09:30",
        ngay: new Date(2026, 0, 28),
        ngayAm: "Âm 10/12",
        khachHang: { ten: "NGHĨA NGUYÊN", soDienThoai: "893210987", diaChi: "444 ZAB" },
        sanPhams: [{ id: "sp38", ten: "Heo Nguyên Con", kichThuoc: "6kg", soLuong: 1, maHang: "#H6" }],
        tongTien: 2400000, phiShip: 50000, trangThai: "Đã giao", phuongThucThanhToan: "tien_mat",
    },
    // 29/01/2026
    {
        id: "29",
        maDon: "DH2901",
        thoiGian: "08:00",
        ngay: new Date(2026, 0, 29),
        ngayAm: "Âm 11/12",
        khachHang: { ten: "HỒNG NHUNG", soDienThoai: "892109876", diaChi: "555 CDE" },
        sanPhams: [{ id: "sp39", ten: "Heo Nguyên Con", kichThuoc: "7kg", soLuong: 2, maHang: "#H7" }],
        tongTien: 5600000, phiShip: 0, trangThai: "Chưa giao", phuongThucThanhToan: "chuyen_khoan",
    },
    {
        id: "30",
        maDon: "DH2902",
        thoiGian: "11:00",
        ngay: new Date(2026, 0, 29),
        ngayAm: "Âm 11/12",
        khachHang: { ten: "CÔNG VINH", soDienThoai: "891098765", diaChi: "666 FGH" },
        sanPhams: [{ id: "sp40", ten: "Heo Nguyên Con", kichThuoc: "8kg", soLuong: 1, maHang: "#H8" }],
        tongTien: 3200000, phiShip: 0, trangThai: "Chưa giao", phuongThucThanhToan: "tien_mat",
    },
    // 30/01/2026
    {
        id: "31",
        maDon: "DH3001",
        thoiGian: "06:00",
        ngay: new Date(2026, 0, 30),
        ngayAm: "Âm 12/12",
        khachHang: { ten: "LAM HỒNG", soDienThoai: "890987654", diaChi: "777 IJK" },
        sanPhams: [{ id: "sp41", ten: "Heo Nguyên Con", kichThuoc: "6kg", soLuong: 1, maHang: "#H6" }],
        tongTien: 2450000, phiShip: 0, trangThai: "Đã giao", phuongThucThanhToan: "tien_mat",
    },
    {
        id: "32",
        maDon: "DH3002",
        thoiGian: "08:00",
        ngay: new Date(2026, 0, 30),
        ngayAm: "Âm 12/12",
        khachHang: { ten: "LỆTHIHỒNG", soDienThoai: "889876543", diaChi: "888 LMN" },
        sanPhams: [{ id: "sp42", ten: "Heo Nguyên Con", kichThuoc: "7.5kg", soLuong: 1, maHang: "#H8" }],
        tongTien: 3100000, phiShip: 0, trangThai: "Chưa giao", phuongThucThanhToan: "chuyen_khoan",
    },
    // 31/01/2026
    {
        id: "33",
        maDon: "DH3101",
        thoiGian: "11:00",
        ngay: new Date(2026, 0, 31),
        ngayAm: "Âm 13/12",
        khachHang: { ten: "LƯU DUY PHÚC", soDienThoai: "888765432", diaChi: "999 OPQ" },
        sanPhams: [{ id: "sp43", ten: "Heo Nguyên Con", kichThuoc: "8kg", soLuong: 1, maHang: "#H8" }],
        tongTien: 3200000, phiShip: 0, trangThai: "Chưa giao", phuongThucThanhToan: "tien_mat",
    },
    {
        id: "34",
        maDon: "DH3102",
        thoiGian: "16:00",
        ngay: new Date(2026, 0, 31),
        ngayAm: "Âm 13/12",
        khachHang: { ten: "BỐ HOÀNG ANH", soDienThoai: "887654321", diaChi: "123 RST" },
        sanPhams: [{ id: "sp44", ten: "Heo Nguyên Con", kichThuoc: "7kg", soLuong: 1, maHang: "#H7" }],
        tongTien: 2900000, phiShip: 0, trangThai: "Đã giao", phuongThucThanhToan: "tien_mat",
    },
];

// Group orders by date
export function groupDonHangTheoNgay(donHangs: DonHang[]): DonHangTheoNgay[] {
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
            ngayAm: dons[0]?.ngayAm || "",
            thuTrongTuan: thuVietNam[date.getDay()],
            tongDon: dons.length,
            tongDoanhThu,
            donHangs: dons.sort((a, b) => a.thoiGian.localeCompare(b.thoiGian)),
        });
    });

    return result.sort((a, b) => a.ngay.getTime() - b.ngay.getTime());
}

// Get all grouped data
export function getMockData(): DonHangTheoNgay[] {
    return groupDonHangTheoNgay(mockDonHangs);
}

// Calendar helpers
export function getOrdersByDate(date: Date): DonHang[] {
    const dateStr = date.toISOString().split("T")[0];
    return mockDonHangs.filter(
        (don) => don.ngay.toISOString().split("T")[0] === dateStr
    );
}

export function getOrdersByDateRange(start: Date, end: Date): DonHang[] {
    return mockDonHangs.filter(
        (don) => don.ngay >= start && don.ngay <= end
    );
}

export function getCalendarMonthData(year: number, month: number): Map<string, DonHang[]> {
    const result = new Map<string, DonHang[]>();

    // Get first and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get orders for this month
    const orders = getOrdersByDateRange(firstDay, lastDay);

    // Group by date
    orders.forEach((order) => {
        const dateKey = order.ngay.toISOString().split("T")[0];
        if (!result.has(dateKey)) {
            result.set(dateKey, []);
        }
        result.get(dateKey)!.push(order);
    });

    return result;
}

export function getWeekDates(date: Date): Date[] {
    const dates: Date[] = [];
    const dayOfWeek = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        dates.push(d);
    }

    return dates;
}

export function formatShortMoney(amount: number): string {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1).replace(".0", "") + "tr";
    }
    if (amount >= 1000) {
        return Math.round(amount / 1000) + "k";
    }
    return amount.toString();
}

