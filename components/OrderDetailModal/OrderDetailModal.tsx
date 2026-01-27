"use client";

import { useEffect, useState } from "react";
import { X, Phone, MapPin, Calendar, Clock, Building2, Loader2 } from "lucide-react";
import { DonHang, TrangThaiDon } from "@/lib/types";
import { formatTien } from "@/lib/mockData";
import { ordersApi } from "@/lib/api";
import styles from "./OrderDetailModal.module.css";

interface OrderDetailModalProps {
    donHang: DonHang;
    onClose: () => void;
    onPrintKitchen?: () => void;
    onPrintInvoice?: () => void;
    onStatusUpdate?: (orderId: string, newStatus: TrangThaiDon) => void;
}

// Status options
const STATUS_OPTIONS: { value: TrangThaiDon; label: string; color: string }[] = [
    { value: "Chưa giao", label: "Chưa giao", color: "#d97706" },
    { value: "Đang giao", label: "Đang giao", color: "#2563eb" },
    { value: "Đã giao", label: "Đã giao", color: "#16a34a" },
    { value: "Đã hủy", label: "Đã hủy", color: "#dc2626" },
];

export default function OrderDetailModal({
    donHang,
    onClose,
    onPrintKitchen,
    onPrintInvoice,
    onStatusUpdate,
}: OrderDetailModalProps) {
    const [currentStatus, setCurrentStatus] = useState<TrangThaiDon>(donHang.trangThai);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);

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

    // Handle status change
    const handleStatusChange = async (newStatus: TrangThaiDon) => {
        if (newStatus === currentStatus || isUpdating) return;

        setIsUpdating(true);
        setUpdateError(null);

        try {
            await ordersApi.updateOrderStatus(donHang.maDon, newStatus);
            setCurrentStatus(newStatus);
            onStatusUpdate?.(donHang.maDon, newStatus);
        } catch (error) {
            setUpdateError(error instanceof Error ? error.message : "Có lỗi xảy ra");
        } finally {
            setIsUpdating(false);
        }
    };

    // Get status class
    const getStatusClass = (status: TrangThaiDon) => {
        switch (status) {
            case "Đã giao": return styles.statusDelivered;
            case "Đang giao": return styles.statusInProgress;
            case "Đã hủy": return styles.statusCancelled;
            default: return styles.statusPending;
        }
    };

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
                        <div className={styles.sectionTitle}>
                            Trạng thái
                            {isUpdating && <Loader2 size={14} className={styles.loadingSpinner} />}
                        </div>
                        <div className={styles.sectionContent}>
                            <div className={styles.statusButtons}>
                                {STATUS_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        className={`${styles.statusButton} ${currentStatus === option.value ? styles.statusButtonActive : ""} ${getStatusClass(option.value)}`}
                                        onClick={() => handleStatusChange(option.value)}
                                        disabled={isUpdating}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            {updateError && (
                                <div className={styles.errorMessage}>{updateError}</div>
                            )}
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
                                {donHang.chiNhanh && (
                                    <div className={styles.infoRow}>
                                        <Building2 size={16} className={styles.infoIcon} />
                                        <span className={styles.infoLabel}>Chi nhánh:</span>
                                        <span className={styles.infoValue}>{donHang.chiNhanh}</span>
                                    </div>
                                )}
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
            </div>
        </div>
    );
}
