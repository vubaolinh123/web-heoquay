"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Package, RefreshCw } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { InventoryTable, InventoryCard, InventoryModal } from "@/components/Kho";
import { VatTu } from "@/lib/types";
import { warehouseApi } from "@/lib/api";
import styles from "./page.module.css";

export default function KhoPage() {
    const [items, setItems] = useState<VatTu[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<VatTu | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<VatTu | null>(null);

    // Fetch items from API
    const fetchItems = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await warehouseApi.getAll();
            setItems(data);
        } catch (err) {
            console.error("Failed to fetch warehouse items:", err);
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

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

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        try {
            setIsSubmitting(true);
            await warehouseApi.delete(deleteConfirm.maNVL);
            await fetchItems(); // Refresh list
            setDeleteConfirm(null);
        } catch (err) {
            console.error("Failed to delete item:", err);
            alert("Có lỗi xảy ra khi xóa vật tư");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSave = async (data: Omit<VatTu, "id" | "tonKho">) => {
        try {
            setIsSubmitting(true);
            if (editingItem) {
                // Update existing item
                await warehouseApi.update(data);
            } else {
                // Create new item
                await warehouseApi.create(data);
            }
            await fetchItems(); // Refresh list
            setIsModalOpen(false);
            setEditingItem(null);
        } catch (err) {
            console.error("Failed to save item:", err);
            alert("Có lỗi xảy ra khi lưu vật tư");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <MobileLayout>
                <div className={styles.container}>
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>Đang tải dữ liệu kho...</p>
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
                        <button className={styles.retryButton} onClick={fetchItems}>
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
                <div className={styles.header}>
                    <div className={styles.titleSection}>
                        <Package size={24} className={styles.icon} />
                        <h1 className={styles.title}>Quản lý Kho</h1>
                    </div>
                    <div className={styles.headerActions}>
                        <button
                            className={styles.refreshBtn}
                            onClick={fetchItems}
                            title="Làm mới"
                        >
                            <RefreshCw size={18} />
                        </button>
                        <button className={styles.addBtn} onClick={handleAdd}>
                            <Plus size={20} />
                            <span>Thêm vật tư</span>
                        </button>
                    </div>
                </div>

                {/* Desktop: Table */}
                <div className={styles.tableView}>
                    <InventoryTable items={items} onEdit={handleEdit} onDelete={handleDelete} />
                </div>

                {/* Mobile: Cards */}
                <div className={styles.cardView}>
                    {items.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Package size={48} className={styles.emptyIcon} />
                            <p>Chưa có vật tư nào</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <InventoryCard
                                key={item.id}
                                item={item}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
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
                    <div className={styles.confirmOverlay} onClick={() => !isSubmitting && setDeleteConfirm(null)}>
                        <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                            <h3 className={styles.confirmTitle}>Xác nhận xóa</h3>
                            <p className={styles.confirmText}>
                                Bạn có chắc muốn xóa <strong>{deleteConfirm.ten}</strong>?
                            </p>
                            <div className={styles.confirmActions}>
                                <button
                                    className={styles.cancelBtn}
                                    onClick={() => setDeleteConfirm(null)}
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={confirmDelete}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Đang xóa..." : "Xóa"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}
