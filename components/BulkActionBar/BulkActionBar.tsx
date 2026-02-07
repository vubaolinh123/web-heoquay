"use client";

import { useState, useRef, useEffect } from "react";
import { Send, RefreshCw, CheckCircle, CreditCard, ChevronUp, X, Loader2 } from "lucide-react";
import { TrangThaiDon } from "@/lib/types";
import { UserRole } from "@/contexts/AuthContext";
import styles from "./BulkActionBar.module.css";

interface BulkActionBarProps {
    selectedCount: number;
    onAction: (type: 1 | 2 | 3 | 4, status?: TrangThaiDon) => void;
    onClearSelection: () => void;
    isLoading: boolean;
    userRole: UserRole;
}

// Status options based on role
const STATUS_OPTIONS: TrangThaiDon[] = [
    "Chưa giao", "Đang quay", "Đang giao", "Đã giao",
    "Đã chuyển khoản", "Công nợ", "Hoàn thành", "Đã hủy"
];

export default function BulkActionBar({
    selectedCount,
    onAction,
    onClearSelection,
    isLoading,
    userRole,
}: BulkActionBarProps) {
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter status options based on role
    // Bep cannot see: Hoàn thành, Công nợ, Đã chuyển khoản, Đã hủy
    const filteredStatusOptions = userRole === "Bep"
        ? STATUS_OPTIONS.filter(s =>
            s !== "Hoàn thành" &&
            s !== "Công nợ" &&
            s !== "Đã chuyển khoản" &&
            s !== "Đã hủy"
        )
        : STATUS_OPTIONS;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowStatusDropdown(false);
            }
        };

        if (showStatusDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showStatusDropdown]);

    if (selectedCount === 0) return null;

    return (
        <div className={styles.container}>
            <div className={styles.bar}>
                {/* Selection info */}
                <div className={styles.selectionInfo}>
                    <span className={styles.count}>{selectedCount}</span>
                    <span className={styles.label}>đơn đã chọn</span>
                </div>

                {/* Action buttons */}
                <div className={styles.actions}>
                    {/* Gửi nhóm Ship */}
                    <button
                        className={styles.actionBtn}
                        onClick={() => onAction(1)}
                        disabled={isLoading}
                        title="Gửi nhóm Ship"
                    >
                        <Send size={16} />
                        <span className={styles.btnLabel}>Ship</span>
                    </button>

                    {/* Update trạng thái */}
                    <div className={styles.dropdownContainer} ref={dropdownRef}>
                        <button
                            className={`${styles.actionBtn} ${showStatusDropdown ? styles.active : ""}`}
                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                            disabled={isLoading}
                            title="Cập nhật trạng thái"
                        >
                            <RefreshCw size={16} />
                            <span className={styles.btnLabel}>Trạng thái</span>
                            <ChevronUp size={14} className={showStatusDropdown ? styles.chevronDown : ""} />
                        </button>

                        {showStatusDropdown && (
                            <div className={styles.dropdown}>
                                {filteredStatusOptions.map((status) => (
                                    <button
                                        key={status}
                                        className={styles.dropdownItem}
                                        onClick={() => {
                                            onAction(2, status);
                                            setShowStatusDropdown(false);
                                        }}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Gửi xác nhận */}
                    <button
                        className={styles.actionBtn}
                        onClick={() => onAction(3)}
                        disabled={isLoading}
                        title="Gửi xác nhận"
                    >
                        <CheckCircle size={16} />
                        <span className={styles.btnLabel}>Xác nhận</span>
                    </button>

                    {/* Gửi mã thanh toán */}
                    <button
                        className={styles.actionBtn}
                        onClick={() => onAction(4)}
                        disabled={isLoading}
                        title="Gửi mã thanh toán"
                    >
                        <CreditCard size={16} />
                        <span className={styles.btnLabel}>Thanh toán</span>
                    </button>
                </div>

                {/* Clear selection button */}
                <button
                    className={styles.clearBtn}
                    onClick={onClearSelection}
                    disabled={isLoading}
                    title="Bỏ chọn tất cả"
                >
                    {isLoading ? <Loader2 size={18} className={styles.spin} /> : <X size={18} />}
                </button>
            </div>
        </div>
    );
}
