"use client";

import { useRouter } from "next/navigation";
import { DonHang } from "@/lib/types";
import { getOrdersByDate } from "@/lib/mockData";
import CalendarCell from "../CalendarCell";
import styles from "./MonthView.module.css";

interface MonthViewProps {
    currentDate: Date;
    ordersMap: Map<string, DonHang[]>;
}

const dayHeaders = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function getMonthDays(year: number, month: number): Date[] {
    const dates: Date[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Add days from previous month to fill the first week
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        dates.push(d);
    }

    // Add all days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        dates.push(new Date(year, month, day));
    }

    // Add days from next month to fill the last week
    const remaining = 7 - (dates.length % 7);
    if (remaining < 7) {
        for (let i = 1; i <= remaining; i++) {
            dates.push(new Date(year, month + 1, i));
        }
    }

    return dates;
}

function isSameDay(d1: Date, d2: Date): boolean {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

export default function MonthView({ currentDate, ordersMap }: MonthViewProps) {
    const router = useRouter();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();

    const days = getMonthDays(year, month);

    const handleCellClick = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0];
        router.push(`/?date=${dateStr}`);
    };

    const getOrdersForDate = (date: Date): DonHang[] => {
        const dateKey = date.toISOString().split("T")[0];
        return ordersMap.get(dateKey) || [];
    };

    return (
        <div className={styles.container}>
            {/* Day headers */}
            <div className={styles.dayHeaders}>
                {dayHeaders.map((day) => (
                    <div key={day} className={styles.dayHeader}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className={styles.grid}>
                {days.map((date, index) => (
                    <CalendarCell
                        key={index}
                        date={date}
                        orders={getOrdersForDate(date)}
                        isToday={isSameDay(date, today)}
                        isCurrentMonth={date.getMonth() === month}
                        onClick={handleCellClick}
                        showOrders={true}
                    />
                ))}
            </div>
        </div>
    );
}
