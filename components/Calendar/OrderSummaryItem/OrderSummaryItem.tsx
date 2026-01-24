"use client";

import { DonHang } from "@/lib/types";
import { formatShortMoney } from "@/lib/mockData";
import styles from "./OrderSummaryItem.module.css";

interface OrderSummaryItemProps {
    order: DonHang;
}

export default function OrderSummaryItem({ order }: OrderSummaryItemProps) {
    return (
        <div className={styles.item}>
            <span className={styles.time}>{order.thoiGian}</span>
            <span className={styles.name}>{order.khachHang.ten}</span>
            <span className={styles.price}>{formatShortMoney(order.tongTien)}</span>
        </div>
    );
}
