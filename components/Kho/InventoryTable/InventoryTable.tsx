"use client";

import { VatTu } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";
import styles from "./InventoryTable.module.css";

interface InventoryTableProps {
    items: VatTu[];
    onEdit: (item: VatTu) => void;
    onDelete: (item: VatTu) => void;
}

export default function InventoryTable({ items, onEdit, onDelete }: InventoryTableProps) {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr className={styles.headerRow}>
                        <th className={styles.th}>Mã NVL (*)</th>
                        <th className={styles.th}>Tên Nguyên Vật Liệu</th>
                        <th className={styles.th}>ĐVT (*)</th>
                        <th className={styles.thNumber}>Tồn Đầu</th>
                        <th className={styles.thNumber}>Nhập</th>
                        <th className={styles.thNumber}>Xuất</th>
                        <th className={styles.thNumber}>Tồn Kho</th>
                        <th className={styles.thActions}>Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={item.id} className={`${styles.row} ${index % 2 === 0 ? styles.even : ""}`}>
                            <td className={styles.tdCode}>{item.maNVL}</td>
                            <td className={styles.tdName}>{item.ten}</td>
                            <td className={styles.td}>{item.donViTinh}</td>
                            <td className={styles.tdNumber}>{item.tonDau}</td>
                            <td className={styles.tdNhap}>{item.nhap > 0 ? `+${item.nhap}` : "-"}</td>
                            <td className={styles.tdXuat}>{item.xuat > 0 ? `-${item.xuat}` : "-"}</td>
                            <td className={styles.tdTonKho}>{item.tonKho}</td>
                            <td className={styles.tdActions}>
                                <button
                                    className={styles.editBtn}
                                    onClick={() => onEdit(item)}
                                    aria-label="Sửa"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => onDelete(item)}
                                    aria-label="Xóa"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
