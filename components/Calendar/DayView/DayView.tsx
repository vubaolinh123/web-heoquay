"use client";

import { useRouter } from "next/navigation";
import { DonHang } from "@/lib/types";
import { formatTien } from "@/lib/mockData";
import styles from "./DayView.module.css";

interface DayViewProps {
    currentDate: Date;
    orders: DonHang[];
}

export default function DayView({ currentDate, orders }: DayViewProps) {
    const router = useRouter();
    const totalRevenue = orders.reduce((sum, o) => sum + o.tongTien, 0);

    const handleOrderClick = (orderId: string) => {
        const dateStr = currentDate.toISOString().split("T")[0];
        router.push(`/?date=${dateStr}&orderId=${orderId}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.dateHeader}>
                <span className={styles.dayNumber}>{currentDate.getDate()}</span>
            </div>

            <div className={styles.orderList}>
                {orders.length === 0 ? (
                    <div className={styles.emptyState}>Không có đơn hàng</div>
                ) : (
                    orders.map((order) => (
                        <div
                            key={order.id}
                            className={styles.orderItem}
                            onClick={() => handleOrderClick(order.id)}
                        >
                            <span className={styles.time}>{order.thoiGian}</span>
                            <span className={styles.name}>{order.khachHang.ten}</span>
                            <span className={styles.price}>{formatTien(order.tongTien)}</span>
                        </div>
                    ))
                )}
            </div>

            {orders.length > 0 && (
                <div className={styles.footer}>
                    <span className={styles.orderCount}>{orders.length}</span>
                    <span className={styles.totalRevenue}>{formatTien(totalRevenue)}</span>
                </div>
            )}
        </div>
    );
}
