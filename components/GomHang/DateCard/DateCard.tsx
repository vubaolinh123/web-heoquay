"use client";

import { useState } from "react";
import { CollectOrderDay, CollectOrderRawItem } from "@/lib/api/collectOrdersApi";
import { Calendar, CalendarDays, Package, Building2, Copy, Check } from "lucide-react";
import { generateCollectOrdersSummaryText, copyToClipboard } from "@/lib/utils";
import ItemRow from "../ItemRow";
import styles from "./DateCard.module.css";

interface DateCardProps {
    data: CollectOrderDay;
    branch?: string;
    rawItems?: CollectOrderRawItem[];  // Raw items for accurate copy feature
}

/**
 * Format date string "27-01-2026" to display format
 */
function formatDate(dateStr: string): { day: string; monthYear: string } {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        return {
            day: parts[0],
            monthYear: `${parts[1]}/${parts[2]}`,
        };
    }
    return { day: dateStr, monthYear: "" };
}

/**
 * Calculate total items for the day
 */
function getTotalItems(items: CollectOrderDay["danhSachHang"]): number {
    return items.reduce((sum, item) => sum + item.tongSoLuong, 0);
}

export default function DateCard({ data, branch, rawItems }: DateCardProps) {
    const { day, monthYear } = formatDate(data.ngayGiaoHang);
    const totalItems = getTotalItems(data.danhSachHang);
    const totalProducts = data.danhSachHang.length;
    const displayBranch = branch || data.chiNhanh;

    const [isCopied, setIsCopied] = useState(false);
    const [isCopying, setIsCopying] = useState(false);

    const handleCopyClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!rawItems || rawItems.length === 0 || isCopying) return;

        setIsCopying(true);
        const text = generateCollectOrdersSummaryText(rawItems, data.ngayGiaoHang, displayBranch);
        const success = await copyToClipboard(text);

        if (success) {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
        setIsCopying(false);
    };

    return (
        <div className={styles.card}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.dateMain}>
                    <Calendar size={18} />
                    <span className={styles.day}>{day}</span>
                    <span className={styles.monthYear}>/ {monthYear}</span>
                </div>
                <div className={styles.headerRight}>
                    {displayBranch && (
                        <div className={styles.branchBadge}>
                            <Building2 size={12} />
                            <span>{displayBranch}</span>
                        </div>
                    )}
                    <div className={styles.dateLunar}>
                        <CalendarDays size={14} />
                        <span>{data.ngayAm}</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <Package size={14} />
                    <span>{totalProducts} sản phẩm</span>
                </div>
                <div className={styles.statsRight}>
                    {/* Copy Button */}
                    {rawItems && rawItems.length > 0 && (
                        <button
                            className={`${styles.copyBtn} ${isCopied ? styles.copyBtnSuccess : ""}`}
                            onClick={handleCopyClick}
                            disabled={isCopying}
                            title="Sao chép tổng hợp đơn hàng"
                        >
                            {isCopied ? (
                                <>
                                    <Check size={14} />
                                    <span>Đã copy!</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={14} />
                                    <span>Copy</span>
                                </>
                            )}
                        </button>
                    )}
                    <div className={styles.statTotal}>
                        <span>Tổng: {totalItems}</span>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className={styles.itemsList}>
                {data.danhSachHang.map((item, index) => (
                    <ItemRow key={`${item.maHang}-${index}`} item={item} />
                ))}
            </div>
        </div>
    );
}
