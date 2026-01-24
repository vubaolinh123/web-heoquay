"use client";

import { useRouter } from "next/navigation";
import { DonHang } from "@/lib/types";
import { getWeekDates } from "@/lib/mockData";
import CalendarCell from "../CalendarCell";
import styles from "./WeekView.module.css";

interface WeekViewProps {
    currentDate: Date;
    ordersMap: Map<string, DonHang[]>;
}

const dayHeaders = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function isSameDay(d1: Date, d2: Date): boolean {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

export default function WeekView({ currentDate, ordersMap }: WeekViewProps) {
    const router = useRouter();
    const today = new Date();
    const weekDates = getWeekDates(currentDate);

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

            {/* Week grid */}
            <div className={styles.grid}>
                {weekDates.map((date, index) => (
                    <CalendarCell
                        key={index}
                        date={date}
                        orders={getOrdersForDate(date)}
                        isToday={isSameDay(date, today)}
                        isCurrentMonth={true}
                        onClick={handleCellClick}
                        showOrders={true}
                    />
                ))}
            </div>
        </div>
    );
}
