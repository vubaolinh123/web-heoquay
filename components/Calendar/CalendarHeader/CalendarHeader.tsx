"use client";

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { CalendarViewMode } from "@/lib/types";
import styles from "./CalendarHeader.module.css";

interface CalendarHeaderProps {
    viewMode: CalendarViewMode;
    currentDate: Date;
    onViewModeChange: (mode: CalendarViewMode) => void;
    onNavigate: (direction: "prev" | "next" | "today") => void;
}

const thuVietNam = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function formatDateRange(date: Date, viewMode: CalendarViewMode): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const dayOfWeek = thuVietNam[date.getDay()];

    if (viewMode === "day") {
        return `THỨ ${date.getDay() === 0 ? "CN" : date.getDay() + 1}, ${day}/${month}/${year}`;
    }

    if (viewMode === "week") {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const startDay = startOfWeek.getDate();
        const startMonth = startOfWeek.getMonth() + 1;
        const endDay = endOfWeek.getDate();
        const endMonth = endOfWeek.getMonth() + 1;

        return `TUẦN: ${startDay}/${startMonth}/${year} - ${endDay}/${endMonth}/${year}`;
    }

    // Month view
    const monthNames = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];
    return `${monthNames[date.getMonth()]} ${year}`;
}

export default function CalendarHeader({
    viewMode,
    currentDate,
    onViewModeChange,
    onNavigate,
}: CalendarHeaderProps) {
    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <Calendar size={24} className={styles.icon} />

                <div className={styles.navigation}>
                    <button
                        className={styles.navButton}
                        onClick={() => onNavigate("prev")}
                        aria-label="Trước"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <span className={styles.dateRange}>
                        {formatDateRange(currentDate, viewMode)}
                    </span>

                    <button
                        className={styles.navButton}
                        onClick={() => onNavigate("next")}
                        aria-label="Sau"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                <button
                    className={styles.todayButton}
                    onClick={() => onNavigate("today")}
                >
                    HÔM NAY
                </button>
            </div>

            <div className={styles.viewToggle}>
                <button
                    className={`${styles.viewButton} ${viewMode === "month" ? styles.active : ""}`}
                    onClick={() => onViewModeChange("month")}
                >
                    Tháng
                </button>
                <button
                    className={`${styles.viewButton} ${viewMode === "week" ? styles.active : ""}`}
                    onClick={() => onViewModeChange("week")}
                >
                    Tuần
                </button>
                <button
                    className={`${styles.viewButton} ${viewMode === "day" ? styles.active : ""}`}
                    onClick={() => onViewModeChange("day")}
                >
                    Ngày
                </button>
            </div>
        </header>
    );
}
