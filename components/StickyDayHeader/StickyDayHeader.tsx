import { Calendar, Printer, FileText } from "lucide-react";
import { formatTien } from "@/lib/mockData";
import styles from "./StickyDayHeader.module.css";

interface StickyDayHeaderProps {
    thuTrongTuan: string;
    ngay: Date;
    ngayAm: string;
    tongDon: number;
    tongDoanhThu: number;
    isVisible: boolean;
    onPrint?: () => void;
    onExport?: () => void;
}

export default function StickyDayHeader({
    thuTrongTuan,
    ngay,
    ngayAm,
    tongDon,
    tongDoanhThu,
    isVisible,
    onPrint,
    onExport,
}: StickyDayHeaderProps) {
    const formattedDate = ngay.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    return (
        <div
            className={`${styles.stickyHeader} ${isVisible ? styles.visible : styles.hidden
                }`}
        >
            {/* Row 1: Date + Actions */}
            <div className={styles.topRow}>
                <div className={styles.leftSection}>
                    <Calendar size={20} className={styles.calendarIcon} />
                    <div className={styles.dateInfo}>
                        <span className={styles.mainDate}>
                            {thuTrongTuan} {formattedDate}
                        </span>
                        <span className={styles.lunarDate}>{ngayAm}</span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.actionButton}
                        onClick={onPrint}
                        aria-label="In phiếu"
                    >
                        <Printer size={16} />
                    </button>
                    <button
                        className={styles.actionButton}
                        onClick={onExport}
                        aria-label="Xuất hóa đơn"
                    >
                        <FileText size={16} />
                    </button>
                </div>
            </div>

            {/* Row 2: Stats */}
            <div className={styles.bottomRow}>
                <div className={styles.statsSection}>
                    <div className={styles.orderCount}>
                        <span className={styles.orderCountNumber}>{tongDon}</span>
                        <span className={styles.orderCountLabel}>ĐƠN</span>
                    </div>
                </div>

                <span className={styles.totalRevenue}>{formatTien(tongDoanhThu)}</span>
            </div>
        </div>
    );
}
