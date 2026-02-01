"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, RefreshCw, AlertCircle, Plus, Edit2, Trash2, X, Check, Loader2 } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface User {
    id: string;
    userName: string;
    role: "Admin" | "Shipper";
    createdAt: string;
}

interface UserFormData {
    userName: string;
    password: string;
    role: "Admin" | "Shipper";
}

export default function UserManagementPage() {
    const { isAdmin, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormData>({
        userName: "",
        password: "",
        role: "Shipper",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Delete confirmation
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Redirect non-admin users
    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.replace("/");
        }
    }, [authLoading, isAdmin, router]);

    // Fetch users
    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch("/api/users");
            const data = await response.json();
            if (data.error === "0") {
                setUsers(data.data || []);
            } else {
                setError(data.message || "Có lỗi xảy ra");
            }
        } catch (err) {
            console.error("Fetch users error:", err);
            setError("Không thể tải danh sách người dùng");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin, fetchUsers]);

    // Open modal for create
    const handleOpenCreate = () => {
        setEditingUser(null);
        setFormData({ userName: "", password: "", role: "Shipper" });
        setSubmitError(null);
        setShowModal(true);
    };

    // Open modal for edit
    const handleOpenEdit = (user: User) => {
        setEditingUser(user);
        setFormData({ userName: user.userName, password: "", role: user.role });
        setSubmitError(null);
        setShowModal(true);
    };

    // Submit form
    const handleSubmit = async () => {
        if (!formData.userName || (!editingUser && !formData.password)) {
            setSubmitError("Vui lòng điền đầy đủ thông tin");
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.error === "0") {
                setShowModal(false);
                fetchUsers();
            } else {
                setSubmitError(data.message || "Có lỗi xảy ra");
            }
        } catch (err) {
            console.error("Submit error:", err);
            setSubmitError("Không thể lưu người dùng");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete user
    const handleDelete = async (userId: string) => {
        setDeletingId(userId);

        try {
            const response = await fetch(`/api/users?id=${userId}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (data.error === "0") {
                setUsers(users.filter(u => u.id !== userId));
            }
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setDeletingId(null);
        }
    };

    // Don't render if not admin
    if (authLoading) {
        return (
            <div className={styles.loadingScreen}>
                <Loader2 size={48} className={styles.spinner} />
                <p>Đang xác thực...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <MobileLayout onRefresh={fetchUsers}>
            <div className={styles.container}>
                {/* Page Header */}
                <div className={styles.header}>
                    <div className={styles.headerInfo}>
                        <h1 className={styles.title}>
                            <Users size={24} />
                            Quản Lý Người Dùng
                        </h1>
                        <p className={styles.subtitle}>Tạo và quản lý tài khoản</p>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.addBtn} onClick={handleOpenCreate}>
                            <Plus size={18} />
                            Thêm mới
                        </button>
                        <button className={styles.refreshBtn} onClick={fetchUsers} disabled={isLoading}>
                            <RefreshCw size={18} className={isLoading ? styles.spinning : ""} />
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className={styles.loading}>
                        <Loader2 size={32} className={styles.spinner} />
                        <p>Đang tải...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className={styles.error}>
                        <AlertCircle size={48} />
                        <h3>Có lỗi xảy ra</h3>
                        <p>{error}</p>
                        <button onClick={fetchUsers} className={styles.retryBtn}>Thử lại</button>
                    </div>
                )}

                {/* User List */}
                {!isLoading && !error && (
                    <div className={styles.userList}>
                        {users.length === 0 ? (
                            <div className={styles.empty}>
                                <Users size={64} />
                                <h3>Chưa có người dùng</h3>
                                <p>Nhấn &ldquo;Thêm mới&rdquo; để tạo tài khoản</p>
                            </div>
                        ) : (
                            users.map((user) => (
                                <div key={user.id} className={styles.userCard}>
                                    <div className={styles.userInfo}>
                                        <div className={styles.userAvatar}>
                                            {user.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className={styles.userDetails}>
                                            <span className={styles.userName}>{user.userName}</span>
                                            <span className={`${styles.userRole} ${user.role === "Admin" ? styles.roleAdmin : styles.roleShipper}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.userActions}>
                                        <button onClick={() => handleOpenEdit(user)} className={styles.editBtn}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className={styles.deleteBtn}
                                            disabled={deletingId === user.id}
                                        >
                                            {deletingId === user.id ? (
                                                <Loader2 size={16} className={styles.spinner} />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingUser ? "Sửa người dùng" : "Thêm người dùng"}</h3>
                            <button onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.formGroup}>
                                <label>Tên đăng nhập</label>
                                <input
                                    type="text"
                                    value={formData.userName}
                                    onChange={e => setFormData({ ...formData, userName: e.target.value })}
                                    placeholder="Nhập tên đăng nhập"
                                    disabled={!!editingUser}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Mật khẩu {editingUser && "(để trống nếu không đổi)"}</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Nhập mật khẩu"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Vai trò</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as "Admin" | "Shipper" })}
                                >
                                    <option value="Shipper">Shipper</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            {submitError && <div className={styles.submitError}>{submitError}</div>}
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                                Hủy
                            </button>
                            <button
                                className={styles.saveBtn}
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 size={16} className={styles.spinner} />
                                ) : (
                                    <>
                                        <Check size={16} />
                                        Lưu
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MobileLayout>
    );
}
