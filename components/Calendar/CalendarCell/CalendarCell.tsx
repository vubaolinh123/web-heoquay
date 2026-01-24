"use client";

import { DonHang } from "@/lib/types";
import { formatShortMoney, formatTien } from "@/lib/mockData";
import OrderSummaryItem from "../OrderSummaryItem";
import styles from "./CalendarCell.module.css";

interface CalendarCellProps {
    date: Date;
    lunarDate?: string;
    orders: DonHang[];
    isToday?: boolean;
    isCurrentMonth?: boolean;
    onClick: (date: Date) => void;
    showOrders?: boolean;
}

export default function CalendarCell({
    date,
    lunarDate,
    orders,
    isToday = false,
    isCurrentMonth = true,
    onClick,
    showOrders = true,
}: CalendarCellProps) {
    const totalRevenue = orders.reduce((sum, o) => sum + o.tongTien, 0);
    const day = date.getDate();

    return (
        <div
            className={`${styles.cell} ${isToday ? styles.today : ""} ${!isCurrentMonth ? styles.otherMonth : ""}`}
            onClick={() => onClick(date)}
        >
            <div className={styles.header}>
                <span className={styles.day}>{day}</span>
                {lunarDate && <span className={styles.lunarDate}>{lunarDate}</span>}
            </div>

            {showOrders && orders.length > 0 && (
                <div className={styles.orderList}>
                    {orders.map((order) => (
                        <OrderSummaryItem key={order.id} order={order} />
                    ))}
                </div>
            )}

            {orders.length > 0 && (
                <div className={styles.footer}>
                    <span className={styles.orderCount}>{orders.length}</span>
                    <span className={styles.totalRevenue}>{formatShortMoney(totalRevenue)}</span>
                </div>
            )}
        </div>
    );
}
