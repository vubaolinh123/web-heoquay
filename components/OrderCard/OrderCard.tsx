import { Phone, MapPin } from "lucide-react";
import { DonHang } from "@/lib/types";
import { formatTien } from "@/lib/mockData";
import styles from "./OrderCard.module.css";

interface OrderCardProps {
    donHang: DonHang;
    onClick?: () => void;
}

export default function OrderCard({ donHang, onClick }: OrderCardProps) {
    const getStatusLabel = () => {
        switch (donHang.trangThai) {
            case "da_giao":
                return "ĐÃ GIAO";
            case "dang_giao":
                return "ĐANG GIAO";
            default:
                return "GIAO HÀNG";
        }
    };

    const getStatusClass = () => {
        switch (donHang.trangThai) {
            case "da_giao":
                return styles.statusDelivered;
            case "dang_giao":
                return styles.statusInProgress;
            default:
                return styles.statusPending;
        }
    };

    return (
        <div className={styles.orderCard} onClick={onClick}>
            {/* Left Section - Time + Customer Info */}
            <div className={styles.leftSection}>
                {/* Time Row */}
                <div className={styles.timeRow}>
                    <div className={styles.timeInfo}>
                        <span className={styles.time}>{donHang.thoiGian}</span>
                        <span className={styles.orderCode}>{donHang.maDon}</span>
                        <span className={`${styles.statusBadge} ${getStatusClass()}`}>
                            {getStatusLabel()}
                        </span>
                    </div>
                </div>

                {/* Customer Row */}
                <div className={styles.customerRow}>
                    <span className={styles.customerName}>{donHang.khachHang.ten}</span>
                    <span className={styles.phoneNumber}>
                        <Phone size={14} className={styles.phoneIcon} />
                        {donHang.khachHang.soDienThoai}
                    </span>
                </div>

                {/* Address Row */}
                <div className={styles.addressRow}>
                    <MapPin size={14} className={styles.addressIcon} />
                    <span className={styles.address}>{donHang.khachHang.diaChi}</span>
                </div>
            </div>

            {/* Middle Section - Products */}
            <div className={styles.productsRow}>
                {donHang.sanPhams.map((sp) => (
                    <div key={sp.id} className={styles.productItem}>
                        <div className={styles.productInfo}>
                            <div className={styles.productNameRow}>
                                <span className={styles.productName}>{sp.ten}</span>
                                {sp.kichThuoc && (
                                    <span className={styles.productCode}>Size {sp.kichThuoc}</span>
                                )}
                                {sp.maHang && (
                                    <span className={styles.productCode}>{sp.maHang}</span>
                                )}
                            </div>
                            {sp.ghiChu && (
                                <span className={styles.productNote}>{sp.ghiChu}</span>
                            )}
                        </div>
                        <span className={styles.productQuantity}>x {sp.soLuong}</span>
                    </div>
                ))}
                {donHang.phiShip > 0 && (
                    <span className={styles.shippingBadge}>
                        Phí ship x 1
                    </span>
                )}
            </div>

            {/* Right Section - Price + Status */}
            <div className={styles.priceRow}>
                <span className={styles.totalPrice}>{formatTien(donHang.tongTien)}</span>
                <span
                    className={`${styles.priceStatus} ${donHang.trangThai === "da_giao"
                            ? styles.priceStatusDelivered
                            : styles.priceStatusPending
                        }`}
                >
                    {donHang.trangThai === "da_giao" ? "ĐÃ GIAO" : "CHƯA GIAO"}
                </span>
            </div>
        </div>
    );
}
