import { CollectOrderDay } from "@/lib/api/collectOrdersApi";
import { Calendar, CalendarDays, Package } from "lucide-react";
import ItemRow from "../ItemRow";
import styles from "./DateCard.module.css";

interface DateCardProps {
    data: CollectOrderDay;
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

export default function DateCard({ data }: DateCardProps) {
    const { day, monthYear } = formatDate(data.ngayGiaoHang);
    const totalItems = getTotalItems(data.danhSachHang);
    const totalProducts = data.danhSachHang.length;

    return (
        <div className={styles.card}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.dateMain}>
                    <Calendar size={18} />
                    <span className={styles.day}>{day}</span>
                    <span className={styles.monthYear}>/ {monthYear}</span>
                </div>
                <div className={styles.dateLunar}>
                    <CalendarDays size={14} />
                    <span>{data.ngayAm}</span>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <Package size={14} />
                    <span>{totalProducts} sản phẩm</span>
                </div>
                <div className={styles.statTotal}>
                    <span>Tổng: {totalItems}</span>
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
