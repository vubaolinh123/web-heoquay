"use client";

import { useState, useRef, useEffect } from "react";
import { Phone, MapPin, Building2, ChevronDown, Loader2, Check } from "lucide-react";
import { DonHang, TrangThaiDon } from "@/lib/types";
import { formatTien } from "@/lib/mockData";
import { ordersApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./OrderCard.module.css";

interface OrderCardProps {
    donHang: DonHang;
    onClick?: () => void;
    onStatusUpdate?: (orderId: string, newStatus: TrangThaiDon) => void;
}

// Status configuration for colors and labels
const STATUS_CONFIG: Record<TrangThaiDon, { label: string; className: string }> = {
    "Chưa giao": { label: "CHƯA GIAO", className: "statusPending" },
    "Đang quay": { label: "ĐANG QUAY", className: "statusRoasting" },
    "Đang giao": { label: "ĐANG GIAO", className: "statusInProgress" },
    "Đã giao": { label: "ĐÃ GIAO", className: "statusDelivered" },
    "Đã chuyển khoản": { label: "ĐÃ CHUYỂN KHOẢN", className: "statusTransferred" },
    "Đã hủy": { label: "ĐÃ HỦY", className: "statusCancelled" },
    "Công nợ": { label: "CÔNG NỢ", className: "statusDebt" },
    "Hoàn thành": { label: "HOÀN THÀNH", className: "statusCompleted" },
};

const STATUS_OPTIONS: TrangThaiDon[] = ["Chưa giao", "Đang quay", "Đang giao", "Đã giao", "Đã chuyển khoản", "Công nợ", "Hoàn thành", "Đã hủy"];

export default function OrderCard({ donHang, onClick, onStatusUpdate }: OrderCardProps) {
    const { isShipper } = useAuth();
    const [currentStatus, setCurrentStatus] = useState<TrangThaiDon>(donHang.trangThai);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

    // Get delivery method label from hinhThucGiao field
    const getDeliveryMethodLabel = () => {
        if (donHang.hinhThucGiao === "Đến lấy") {
            return "ĐẾN LẤY";
        }
        return "GIAO HÀNG";
    };

    // Get delivery method style class
    const getDeliveryMethodClass = () => {
        if (donHang.hinhThucGiao === "Đến lấy") {
            return styles.statusPickup;
        }
        return styles.statusDelivery;
    };

    // Get status config
    const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG["Chưa giao"];

    // Handle status badge click - disabled for Shipper
    const handleStatusClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isUpdating && !isShipper) {
            setIsDropdownOpen(!isDropdownOpen);
        }
    };

    // Handle status change
    const handleStatusChange = async (newStatus: TrangThaiDon) => {
        if (newStatus === currentStatus || isUpdating) return;

        setIsUpdating(true);
        setIsDropdownOpen(false);

        try {
            await ordersApi.updateOrderStatus(donHang.maDon, newStatus);
            setCurrentStatus(newStatus);
            onStatusUpdate?.(donHang.maDon, newStatus);
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setIsUpdating(false);
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
                        <span className={`${styles.statusBadge} ${getDeliveryMethodClass()}`}>
                            {getDeliveryMethodLabel()}
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

                {/* Branch Row */}
                {donHang.chiNhanh && (
                    <div className={styles.branchRow}>
                        <Building2 size={14} className={styles.branchIcon} />
                        <span className={styles.branchName}>{donHang.chiNhanh}</span>
                    </div>
                )}

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

                {/* Status Dropdown */}
                <div className={styles.statusDropdownContainer} ref={dropdownRef}>
                    <button
                        className={`${styles.priceStatus} ${styles[statusConfig.className]} ${styles.statusButton}`}
                        onClick={handleStatusClick}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <Loader2 size={12} className={styles.spinner} />
                        ) : (
                            <>
                                {statusConfig.label}
                                <ChevronDown size={12} className={styles.dropdownIcon} />
                            </>
                        )}
                    </button>

                    {isDropdownOpen && (
                        <div className={styles.statusDropdown}>
                            {STATUS_OPTIONS.map((status) => {
                                const config = STATUS_CONFIG[status];
                                const isActive = status === currentStatus;
                                return (
                                    <button
                                        key={status}
                                        className={`${styles.statusOption} ${styles[config.className]} ${isActive ? styles.statusOptionActive : ""}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusChange(status);
                                        }}
                                    >
                                        {config.label}
                                        {isActive && <Check size={14} />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
