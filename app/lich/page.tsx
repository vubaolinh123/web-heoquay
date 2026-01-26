"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { CalendarViewMode, DonHang } from "@/lib/types";
import { useOrders } from "@/contexts";
import MobileLayout from "@/components/MobileLayout";
import CalendarHeader from "@/components/Calendar/CalendarHeader";
import styles from "./page.module.css";

// Dynamic imports for view components
const MonthView = dynamic(() => import("@/components/Calendar/MonthView"), {
    loading: () => <div className={styles.loading}>Đang tải...</div>,
});

const WeekView = dynamic(() => import("@/components/Calendar/WeekView"), {
    loading: () => <div className={styles.loading}>Đang tải...</div>,
});

const DayView = dynamic(() => import("@/components/Calendar/DayView"), {
    loading: () => <div className={styles.loading}>Đang tải...</div>,
});

export default function LichPage() {
    // Get orders data from shared context
    const { orders, ordersMap, isLoading, error, refetch } = useOrders();

    const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
    const [currentDate, setCurrentDate] = useState(new Date()); // Start with today

    // Get orders for current day (for DayView)
    const dayOrders = useMemo(() => {
        const dateKey = currentDate.toISOString().split("T")[0];
        return ordersMap.get(dateKey) || [];
    }, [currentDate, ordersMap]);

    const handleNavigate = (direction: "prev" | "next" | "today") => {
        if (direction === "today") {
            setCurrentDate(new Date());
            return;
        }

        const newDate = new Date(currentDate);
        const delta = direction === "prev" ? -1 : 1;

        switch (viewMode) {
            case "month":
                newDate.setMonth(newDate.getMonth() + delta);
                break;
            case "week":
                newDate.setDate(newDate.getDate() + delta * 7);
                break;
            case "day":
                newDate.setDate(newDate.getDate() + delta);
                break;
        }

        setCurrentDate(newDate);
    };

    const handleViewModeChange = (mode: CalendarViewMode) => {
        setViewMode(mode);
    };

    // Loading state
    if (isLoading) {
        return (
            <MobileLayout>
                <div className={styles.container}>
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>Đang tải lịch...</p>
                    </div>
                </div>
            </MobileLayout>
        );
    }

    // Error state
    if (error) {
        return (
            <MobileLayout>
                <div className={styles.container}>
                    <div className={styles.errorState}>
                        <p className={styles.errorMessage}>⚠️ {error}</p>
                        <button className={styles.retryButton} onClick={refetch}>
                            Thử lại
                        </button>
                    </div>
                </div>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout>
            <div className={styles.container}>
                <CalendarHeader
                    viewMode={viewMode}
                    currentDate={currentDate}
                    onViewModeChange={handleViewModeChange}
                    onNavigate={handleNavigate}
                />

                <div className={styles.content}>
                    {viewMode === "month" && (
                        <MonthView currentDate={currentDate} ordersMap={ordersMap} />
                    )}
                    {viewMode === "week" && (
                        <WeekView currentDate={currentDate} ordersMap={ordersMap} />
                    )}
                    {viewMode === "day" && (
                        <DayView currentDate={currentDate} orders={dayOrders} />
                    )}
                </div>
            </div>
        </MobileLayout>
    );
}
