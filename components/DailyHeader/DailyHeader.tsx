import { Calendar, Printer, FileText, MessageCircle } from "lucide-react";
import { formatTien } from "@/lib/mockData";
import styles from "./DailyHeader.module.css";

interface DailyHeaderProps {
    thuTrongTuan: string;
    ngay: Date;
    ngayAm: string;
    tongDon: number;
    tongDoanhThu: number;
    onPrint?: () => void;
    onExport?: () => void;
    onSendZalo?: () => void;
    isSendingZalo?: boolean;
    zaloSuccess?: boolean;
}

export default function DailyHeader({
    thuTrongTuan,
    ngay,
    ngayAm,
    tongDon,
    tongDoanhThu,
    onPrint,
    onExport,
    onSendZalo,
    isSendingZalo = false,
    zaloSuccess = false,
}: DailyHeaderProps) {
    const formattedDate = ngay.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    return (
        <div className={styles.dailyHeader}>
            {/* Row 1: Date Info */}
            <div className={styles.topRow}>
                <div className={styles.dateInfo}>
                    <Calendar size={18} className={styles.calendarIcon} />
                    <span className={styles.dayOfWeek}>{thuTrongTuan}</span>
                    <span className={styles.solarDate}>{formattedDate}</span>
                    <span className={styles.lunarDate}>{ngayAm}</span>
                </div>
                <span className={styles.orderCount}>{tongDon} đơn</span>
            </div>

            {/* Row 2: Revenue + Actions */}
            <div className={styles.bottomRow}>
                <span className={styles.totalRevenue}>{formatTien(tongDoanhThu)}</span>

                <div className={styles.actionButtons}>
                    <button
                        type="button"
                        className={`${styles.actionButton} ${styles.zaloButton} ${zaloSuccess ? styles.zaloSuccess : ''}`}
                        onClick={(e) => { e.stopPropagation(); onSendZalo?.(); }}
                        aria-label="Gửi nhóm ship"
                        disabled={isSendingZalo}
                    >
                        <MessageCircle size={18} />
                        <span>Gửi nhóm ship</span>
                    </button>
                    <button
                        type="button"
                        className={styles.actionButton}
                        onClick={(e) => { e.stopPropagation(); onPrint?.(); }}
                        aria-label="In phiếu"
                    >
                        <Printer size={18} />
                    </button>
                    <button
                        type="button"
                        className={styles.actionButton}
                        onClick={(e) => { e.stopPropagation(); onExport?.(); }}
                        aria-label="Xuất hóa đơn"
                    >
                        <FileText size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
