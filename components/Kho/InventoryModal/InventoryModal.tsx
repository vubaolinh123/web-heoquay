"use client";

import { useState, useEffect } from "react";
import { VatTu } from "@/lib/types";
import { X } from "lucide-react";
import styles from "./InventoryModal.module.css";

interface InventoryModalProps {
    isOpen: boolean;
    item: VatTu | null;
    onClose: () => void;
    onSave: (item: Omit<VatTu, "id" | "tonKho">) => void;
}

export default function InventoryModal({ isOpen, item, onClose, onSave }: InventoryModalProps) {
    const [formData, setFormData] = useState({
        maNVL: "",
        ten: "",
        donViTinh: "con",
        tonDau: 0,
        nhap: 0,
        xuat: 0,
    });

    useEffect(() => {
        if (item) {
            setFormData({
                maNVL: item.maNVL,
                ten: item.ten,
                donViTinh: item.donViTinh,
                tonDau: item.tonDau,
                nhap: item.nhap,
                xuat: item.xuat,
            });
        } else {
            setFormData({
                maNVL: "",
                ten: "",
                donViTinh: "con",
                tonDau: 0,
                nhap: 0,
                xuat: 0,
            });
        }
    }, [item, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (field: string, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    if (!isOpen) return null;

    const isEdit = !!item;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {isEdit ? "CẬP NHẬT VẬT TƯ" : "THÊM VẬT TƯ MỚI"}
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
                        <X size={24} />
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>MÃ NVL (*)</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formData.maNVL}
                                onChange={(e) => handleChange("maNVL", e.target.value)}
                                placeholder="VD: NVLHC3"
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>ĐƠN VỊ TÍNH</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formData.donViTinh}
                                onChange={(e) => handleChange("donViTinh", e.target.value)}
                                placeholder="VD: con"
                            />
                        </div>
                    </div>

                    <div className={styles.fieldFull}>
                        <label className={styles.label}>TÊN NGUYÊN VẬT LIỆU</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={formData.ten}
                            onChange={(e) => handleChange("ten", e.target.value)}
                            placeholder="VD: Heo Con Size 3-3,8kg"
                            required
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>SL TỒN</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={formData.tonDau}
                                onChange={(e) => handleChange("tonDau", parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>TỒN ĐẦU KỲ</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={formData.tonDau}
                                onChange={(e) => handleChange("tonDau", parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>NHẬP</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={formData.nhap}
                                onChange={(e) => handleChange("nhap", parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>XUẤT</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={formData.xuat}
                                onChange={(e) => handleChange("xuat", parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                        LƯU THÔNG TIN
                    </button>
                </form>
            </div>
        </div>
    );
}
