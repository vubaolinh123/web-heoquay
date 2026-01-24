"use client";

import { useEffect } from "react";
import { X, Phone, MapPin, Calendar, Clock, Printer, FileText } from "lucide-react";
import { DonHang } from "@/lib/types";
import { formatTien } from "@/lib/mockData";
import styles from "./OrderDetailModal.module.css";

interface OrderDetailModalProps {
    donHang: DonHang;
    onClose: () => void;
    onPrintKitchen?: () => void;
    onPrintInvoice?: () => void;
}

export default function OrderDetailModal({
    donHang,
    onClose,
    onPrintKitchen,
    onPrintInvoice,
}: OrderDetailModalProps) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const formattedDate = donHang.ngay.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Chi tiết đơn #{donHang.maDon}</h2>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Đóng">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className={styles.modalContent}>
                    {/* Status Section */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Trạng thái</div>
                        <div className={styles.sectionContent}>
                            <div className={styles.statusRow}>
                                <span
                                    className={`${styles.statusBadge} ${donHang.trangThai === "da_giao"
                                            ? styles.statusDelivered
                                            : styles.statusPending
                                        }`}
                                >
                                    {donHang.trangThai === "da_giao" ? "Đã giao" : "Chưa giao"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Thông tin khách hàng</div>
                        <div className={styles.sectionContent}>
                            <div className={styles.customerInfo}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Tên:</span>
                                    <span className={styles.infoValue}>{donHang.khachHang.ten}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <Phone size={16} className={styles.infoIcon} />
                                    <span className={styles.infoLabel}>SĐT:</span>
                                    <a
                                        href={`tel:${donHang.khachHang.soDienThoai}`}
                                        className={`${styles.infoValue} ${styles.infoValueLink}`}
                                    >
                                        {donHang.khachHang.soDienThoai}
                                    </a>
                                </div>
                                <div className={styles.infoRow}>
                                    <MapPin size={16} className={styles.infoIcon} />
                                    <span className={styles.infoLabel}>Địa chỉ:</span>
                                    <span className={styles.infoValue}>{donHang.khachHang.diaChi}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Thông tin giao hàng</div>
                        <div className={styles.sectionContent}>
                            <div className={styles.customerInfo}>
                                <div className={styles.infoRow}>
                                    <Calendar size={16} className={styles.infoIcon} />
                                    <span className={styles.infoLabel}>Ngày:</span>
                                    <span className={styles.infoValue}>
                                        {formattedDate} ({donHang.ngayAm})
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <Clock size={16} className={styles.infoIcon} />
                                    <span className={styles.infoLabel}>Giờ:</span>
                                    <span className={styles.infoValue}>{donHang.thoiGian}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Sản phẩm đặt hàng</div>
                        <div className={styles.sectionContent}>
                            <table className={styles.productsTable}>
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>Size</th>
                                        <th>SL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donHang.sanPhams.map((sp) => (
                                        <tr key={sp.id}>
                                            <td>
                                                <span className={styles.productName}>{sp.ten}</span>
                                                {sp.maHang && (
                                                    <span className={styles.productCode}> {sp.maHang}</span>
                                                )}
                                                {sp.ghiChu && (
                                                    <div className={styles.productNote}>{sp.ghiChu}</div>
                                                )}
                                            </td>
                                            <td>{sp.kichThuoc || "-"}</td>
                                            <td>{sp.soLuong}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Thanh toán</div>
                        <div className={styles.sectionContent}>
                            <div className={styles.totalsSection}>
                                {donHang.phiShip > 0 && (
                                    <div className={styles.totalRow}>
                                        <span className={styles.totalLabel}>Phí ship:</span>
                                        <span className={styles.totalValue}>
                                            {formatTien(donHang.phiShip)}
                                        </span>
                                    </div>
                                )}
                                <div className={styles.totalRow}>
                                    <span className={styles.totalLabel}>Phương thức:</span>
                                    <span className={styles.totalValue}>
                                        {donHang.phuongThucThanhToan === "tien_mat"
                                            ? "Tiền mặt"
                                            : "Chuyển khoản"}
                                    </span>
                                </div>
                                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                                    <span>Tổng cộng:</span>
                                    <span>{formatTien(donHang.tongTien)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {donHang.ghiChu && (
                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>Ghi chú</div>
                            <div className={styles.sectionContent}>
                                <p>{donHang.ghiChu}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className={styles.modalFooter}>
                    <button
                        className={`${styles.actionButton} ${styles.secondaryButton}`}
                        onClick={onPrintKitchen}
                    >
                        <Printer size={18} />
                        In phiếu bếp
                    </button>
                    <button
                        className={`${styles.actionButton} ${styles.primaryButton}`}
                        onClick={onPrintInvoice}
                    >
                        <FileText size={18} />
                        Xuất hóa đơn
                    </button>
                </div>
            </div>
        </div>
    );
}
