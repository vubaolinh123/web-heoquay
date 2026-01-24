"use client";

import { VatTu } from "@/lib/types";
import { Pencil, Trash2, Package } from "lucide-react";
import styles from "./InventoryCard.module.css";

interface InventoryCardProps {
    item: VatTu;
    onEdit: (item: VatTu) => void;
    onDelete: (item: VatTu) => void;
}

export default function InventoryCard({ item, onEdit, onDelete }: InventoryCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={styles.code}>{item.maNVL}</span>
                <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => onEdit(item)} aria-label="Sửa">
                        <Pencil size={16} />
                    </button>
                    <button className={styles.deleteBtn} onClick={() => onDelete(item)} aria-label="Xóa">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className={styles.title}>
                <Package size={18} className={styles.icon} />
                <span>{item.ten}</span>
            </div>

            <div className={styles.unit}>ĐVT: {item.donViTinh}</div>

            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Tồn Đầu</span>
                    <span className={styles.statValue}>{item.tonDau}</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Nhập</span>
                    <span className={`${styles.statValue} ${styles.nhap}`}>
                        {item.nhap > 0 ? `+${item.nhap}` : "-"}
                    </span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Xuất</span>
                    <span className={`${styles.statValue} ${styles.xuat}`}>
                        {item.xuat > 0 ? `-${item.xuat}` : "-"}
                    </span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Tồn Kho</span>
                    <span className={`${styles.statValue} ${styles.tonKho}`}>{item.tonKho}</span>
                </div>
            </div>
        </div>
    );
}
