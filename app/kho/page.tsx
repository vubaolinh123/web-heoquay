"use client";

import { useState, useEffect } from "react";
import { Plus, Package } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { InventoryTable, InventoryCard, InventoryModal } from "@/components/Kho";
import { VatTu } from "@/lib/types";
import {
    getInventoryList,
    addVatTu,
    updateVatTu,
    deleteVatTu,
} from "@/lib/inventoryData";
import styles from "./page.module.css";

export default function KhoPage() {
    const [items, setItems] = useState<VatTu[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<VatTu | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<VatTu | null>(null);

    useEffect(() => {
        setItems(getInventoryList());
    }, []);

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: VatTu) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = (item: VatTu) => {
        setDeleteConfirm(item);
    };

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteVatTu(deleteConfirm.id);
            setItems(getInventoryList());
            setDeleteConfirm(null);
        }
    };

    const handleSave = (data: Omit<VatTu, "id" | "tonKho">) => {
        if (editingItem) {
            updateVatTu(editingItem.id, data);
        } else {
            addVatTu(data);
        }
        setItems(getInventoryList());
        setIsModalOpen(false);
        setEditingItem(null);
    };

    return (
        <MobileLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.titleSection}>
                        <Package size={24} className={styles.icon} />
                        <h1 className={styles.title}>Quản lý Kho</h1>
                    </div>
                    <button className={styles.addBtn} onClick={handleAdd}>
                        <Plus size={20} />
                        <span>Thêm vật tư</span>
                    </button>
                </div>

                {/* Desktop: Table */}
                <div className={styles.tableView}>
                    <InventoryTable items={items} onEdit={handleEdit} onDelete={handleDelete} />
                </div>

                {/* Mobile: Cards */}
                <div className={styles.cardView}>
                    {items.map((item) => (
                        <InventoryCard
                            key={item.id}
                            item={item}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>

                {/* Add/Edit Modal */}
                <InventoryModal
                    isOpen={isModalOpen}
                    item={editingItem}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingItem(null);
                    }}
                    onSave={handleSave}
                />

                {/* Delete Confirmation */}
                {deleteConfirm && (
                    <div className={styles.confirmOverlay} onClick={() => setDeleteConfirm(null)}>
                        <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                            <h3 className={styles.confirmTitle}>Xác nhận xóa</h3>
                            <p className={styles.confirmText}>
                                Bạn có chắc muốn xóa <strong>{deleteConfirm.ten}</strong>?
                            </p>
                            <div className={styles.confirmActions}>
                                <button
                                    className={styles.cancelBtn}
                                    onClick={() => setDeleteConfirm(null)}
                                >
                                    Hủy
                                </button>
                                <button className={styles.deleteBtn} onClick={confirmDelete}>
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}
