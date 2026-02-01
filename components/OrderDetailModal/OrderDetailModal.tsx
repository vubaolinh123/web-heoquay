"use client";

import { useEffect, useState, useMemo } from "react";
import { X, Phone, MapPin, Calendar, Clock, Building2, Loader2, Edit2, Save, Plus, MessageCircle, QrCode, UserCheck, Lock } from "lucide-react";
import { DonHang, TrangThaiDon, SanPham } from "@/lib/types";
import { formatTien } from "@/lib/mockData";
import { ordersApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./OrderDetailModal.module.css";

interface OrderDetailModalProps {
    donHang: DonHang;
    onClose: () => void;
    onPrintKitchen?: () => void;
    onPrintInvoice?: () => void;
    onStatusUpdate?: (orderId: string, newStatus: TrangThaiDon) => void;
    onOrderUpdate?: () => Promise<void>; // Callback to refresh order data
}

// Status options
const STATUS_OPTIONS: { value: TrangThaiDon; label: string; color: string }[] = [
    { value: "Chưa giao", label: "Chưa giao", color: "#d97706" },
    { value: "Đang quay", label: "Đang quay", color: "#ea580c" },
    { value: "Đang giao", label: "Đang giao", color: "#2563eb" },
    { value: "Đã giao", label: "Đã giao", color: "#16a34a" },
    { value: "Đã chuyển khoản", label: "Đã chuyển khoản", color: "#9333ea" },
    { value: "Đã hủy", label: "Đã hủy", color: "#dc2626" },
];

// Helper to check if shipping fee
const isShippingFee = (productName: string) => {
    const nameLower = productName.toLowerCase();
    return nameLower.includes("phí ship") || nameLower.includes("phi ship");
};

export default function OrderDetailModal({
    donHang,
    onClose,
    onPrintKitchen,
    onPrintInvoice,
    onStatusUpdate,
    onOrderUpdate,
}: OrderDetailModalProps) {
    const { isShipper, isAdmin, user } = useAuth();
    const [currentStatus, setCurrentStatus] = useState<TrangThaiDon>(donHang.trangThai);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);

    // Product editing state
    const [editableProducts, setEditableProducts] = useState<Map<string, { quantity: number; price: number }>>(new Map());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [savingId, setSavingId] = useState<string | null>(null);

    // Add new product state
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "Thành phần sau quay",
        quantity: 1,
        price: 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productError, setProductError] = useState<string | null>(null);

    // Send Zalo state
    const [isSendingZalo, setIsSendingZalo] = useState(false);
    const [zaloSuccess, setZaloSuccess] = useState(false);
    const [zaloError, setZaloError] = useState<string | null>(null);

    // Shipper confirm state
    const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);
    const [confirmSuccess, setConfirmSuccess] = useState(false);
    const [confirmError, setConfirmError] = useState<string | null>(null);

    // QR Payment state
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrData, setQrData] = useState<{
        qrUrl: string | null;
        content: string | null;
        bankContent: string | null;
        amount: number | null;
        bankName: string | null;
        bankLogo: string | null;
        accountName: string | null;
        accountNumber: string | null;
    } | null>(null);
    const [isLoadingQR, setIsLoadingQR] = useState(false);

    // Check if can edit post-roast products (only for Chi nhánh 1)
    const canEditPostRoast = useMemo(() => {
        const branch = donHang.chiNhanh || "";
        // Normalize: remove spaces, convert to lowercase, remove diacritics for comparison
        const normalized = branch.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
            .replace(/\s+/g, ""); // Remove spaces

        // Check if it contains "chinhanh1" or ends with "1"
        return normalized.includes("chinhanh1") ||
            normalized === "1" ||
            branch.trim().endsWith("1");
    }, [donHang.chiNhanh]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const formattedDate = donHang.ngay.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    // Handle status change
    const handleStatusChange = async (newStatus: TrangThaiDon) => {
        if (newStatus === currentStatus || isUpdating) return;

        setIsUpdating(true);
        setUpdateError(null);

        try {
            await ordersApi.updateOrderStatus(donHang.maDon, newStatus);
            setCurrentStatus(newStatus);
            onStatusUpdate?.(donHang.maDon, newStatus);
            // Refresh data to update filter counts immediately
            if (onOrderUpdate) await onOrderUpdate();
        } catch (error) {
            setUpdateError(error instanceof Error ? error.message : "Có lỗi xảy ra");
        } finally {
            setIsUpdating(false);
        }
    };

    // Get status class
    const getStatusClass = (status: TrangThaiDon) => {
        switch (status) {
            case "Đã giao": return styles.statusDelivered;
            case "Đang quay": return styles.statusRoasting;
            case "Đang giao": return styles.statusInProgress;
            case "Đã chuyển khoản": return styles.statusTransferred;
            case "Đã hủy": return styles.statusCancelled;
            default: return styles.statusPending;
        }
    };

    // Start editing a product
    const startEditing = (product: SanPham) => {
        setEditingId(product.id);
        setEditableProducts(prev => new Map(prev).set(product.id, {
            quantity: product.soLuong,
            price: product.donGia || 0,
        }));
        setProductError(null);
    };

    // Handle input change
    const handleProductChange = (id: string, field: "quantity" | "price", value: number) => {
        setEditableProducts(prev => {
            const newMap = new Map(prev);
            const current = newMap.get(id) || { quantity: 0, price: 0 };
            newMap.set(id, { ...current, [field]: value });
            return newMap;
        });
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingId(null);
        setProductError(null);
    };

    // Save edited product
    const handleSaveProduct = async (product: SanPham) => {
        const edits = editableProducts.get(product.id);
        if (!edits) return;

        setSavingId(product.id);
        setProductError(null);

        try {
            await ordersApi.updateOrderItems(donHang.maDon, [{
                code: product.maHang || "",
                name: product.ten,
                quantity: edits.quantity,
                price: edits.price,
            }]);

            if (onOrderUpdate) await onOrderUpdate();
            setEditingId(null);
        } catch (error) {
            setProductError(error instanceof Error ? error.message : "Không thể cập nhật sản phẩm");
        } finally {
            setSavingId(null);
        }
    };

    // Add new product
    const handleAddProduct = async () => {
        if (!newProduct.name || newProduct.quantity <= 0) {
            setProductError("Tên và số lượng là bắt buộc");
            return;
        }

        setIsSubmitting(true);
        setProductError(null);

        try {
            await ordersApi.updateOrderItems(donHang.maDon, [{
                code: "#TP",
                name: newProduct.name,
                quantity: newProduct.quantity,
                price: newProduct.price,
            }]);

            if (onOrderUpdate) await onOrderUpdate();
            setIsAddingProduct(false);
            setNewProduct({ name: "Thành phần sau quay", quantity: 1, price: 0 });
        } catch (error) {
            setProductError(error instanceof Error ? error.message : "Không thể thêm sản phẩm");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cancel adding product
    const cancelAddProduct = () => {
        setIsAddingProduct(false);
        setNewProduct({ name: "Thành phần sau quay", quantity: 1, price: 0 });
        setProductError(null);
    };

    // Handle send Zalo
    const handleSendZalo = async () => {
        if (isSendingZalo || !donHang.khachHang.soDienThoai) return;

        setIsSendingZalo(true);
        setZaloError(null);
        setZaloSuccess(false);

        try {
            await ordersApi.sendZaloToCustomer(donHang.maDon, donHang.khachHang.soDienThoai);
            setZaloSuccess(true);
            // Reset success message after 3 seconds
            setTimeout(() => setZaloSuccess(false), 3000);
        } catch (error) {
            setZaloError(error instanceof Error ? error.message : "Không thể gửi Zalo");
        } finally {
            setIsSendingZalo(false);
        }
    };

    // Handle shipper confirm order
    const handleShipperConfirm = async () => {
        if (isConfirmingOrder || !user?.userName) return;

        setIsConfirmingOrder(true);
        setConfirmError(null);
        setConfirmSuccess(false);

        try {
            const response = await fetch("/api/orders/shipper-confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: donHang.maDon,
                    shipper: user.userName,
                }),
            });

            const data = await response.json();
            if (data.error === "0") {
                setConfirmSuccess(true);
                setTimeout(() => setConfirmSuccess(false), 3000);
                if (onOrderUpdate) await onOrderUpdate();
            } else {
                setConfirmError(data.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            setConfirmError(error instanceof Error ? error.message : "Không thể nhận đơn");
        } finally {
            setIsConfirmingOrder(false);
        }
    };

    // Handle get QR for payment
    const handleGetQR = async () => {
        setIsLoadingQR(true);
        setShowQRModal(true);
        setQrData(null);

        try {
            const data = await ordersApi.getQRPayment(donHang.maDon);
            // Handle QR response - API returns data.qr field
            const qrImage = data.qr || data.qrBase64 || data.qrUrl;
            if (qrImage) {
                setQrData({
                    qrUrl: qrImage,
                    content: data.content || null,
                    bankContent: data.bankContent || null,
                    amount: data.amount || data.totalAmount || null,
                    bankName: data.account?.bank?.shortName || data.account?.bank?.name || null,
                    bankLogo: data.account?.bank?.logo || null,
                    accountName: data.account?.name || null,
                    accountNumber: data.account?.number || null,
                });
            }
        } catch (error) {
            console.error("QR error:", error);
        } finally {
            setIsLoadingQR(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Chi tiết đơn #{donHang.maDon}</h2>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Đóng">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className={styles.modalContent}>
                    {/* Status Section - Admin only can change */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>
                            Trạng thái
                            {isUpdating && <Loader2 size={14} className={styles.loadingSpinner} />}
                        </div>
                        <div className={styles.sectionContent}>
                            {isAdmin ? (
                                <div className={styles.statusButtons}>
                                    {STATUS_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            className={`${styles.statusButton} ${currentStatus === option.value ? styles.statusButtonActive : ""} ${getStatusClass(option.value)}`}
                                            onClick={() => handleStatusChange(option.value)}
                                            disabled={isUpdating}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className={`${styles.statusBadge} ${getStatusClass(currentStatus)}`}>
                                    {currentStatus}
                                </div>
                            )}
                            {updateError && (
                                <div className={styles.errorMessage}>{updateError}</div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons - Shipper actions */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Thao tác</div>
                        <div className={styles.sectionContent}>
                            <div className={styles.actionButtonsRow}>
                                {/* Shipper confirm button */}
                                {isShipper && (
                                    <button
                                        className={`${styles.actionBtn} ${styles.confirmBtn}`}
                                        onClick={handleShipperConfirm}
                                        disabled={isConfirmingOrder || confirmSuccess}
                                    >
                                        {isConfirmingOrder ? (
                                            <Loader2 size={16} className={styles.loadingSpinner} />
                                        ) : confirmSuccess ? (
                                            <>✓ Đã nhận</>
                                        ) : (
                                            <>
                                                <UserCheck size={16} />
                                                Nhận đơn
                                            </>
                                        )}
                                    </button>
                                )}

                                {/* QR Payment button - for everyone */}
                                <button
                                    className={`${styles.actionBtn} ${styles.qrBtn}`}
                                    onClick={handleGetQR}
                                    disabled={isLoadingQR}
                                >
                                    <QrCode size={16} />
                                    Lấy QR chuyển khoản
                                </button>

                                {/* Send Zalo - Admin only */}
                                {isAdmin && (
                                    <button
                                        className={`${styles.actionBtn} ${styles.zaloBtn}`}
                                        onClick={handleSendZalo}
                                        disabled={isSendingZalo || zaloSuccess}
                                    >
                                        {isSendingZalo ? (
                                            <Loader2 size={16} className={styles.loadingSpinner} />
                                        ) : zaloSuccess ? (
                                            <>✓ Đã gửi</>
                                        ) : (
                                            <>
                                                <MessageCircle size={16} />
                                                Gửi Zalo
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                            {confirmError && <div className={styles.errorMessage}>{confirmError}</div>}
                            {zaloError && <div className={styles.errorMessage}>{zaloError}</div>}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Thông tin khách hàng</div>
                        <div className={styles.sectionContent}>
                            <div className={styles.customerInfo}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Tên:</span>
                                    <span className={styles.infoValue}>{donHang.khachHang.ten}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <Phone size={16} className={styles.infoIcon} />
                                    <span className={styles.infoLabel}>SĐT:</span>
                                    <a
                                        href={`tel:${donHang.khachHang.soDienThoai}`}
                                        className={`${styles.infoValue} ${styles.infoValueLink}`}
                                    >
                                        {donHang.khachHang.soDienThoai}
                                    </a>
                                </div>
                                <div className={styles.infoRow}>
                                    <MapPin size={16} className={styles.infoIcon} />
                                    <span className={styles.infoLabel}>Địa chỉ:</span>
                                    <span className={styles.infoValue}>{donHang.khachHang.diaChi}</span>
                                </div>

                                {/* Send Zalo Button */}
                                <div className={styles.zaloButtonWrapper}>
                                    <button
                                        className={`${styles.sendZaloBtn} ${zaloSuccess ? styles.sendZaloSuccess : ""}`}
                                        onClick={handleSendZalo}
                                        disabled={isSendingZalo || !donHang.khachHang.soDienThoai}
                                    >
                                        {isSendingZalo ? (
                                            <Loader2 size={18} className={styles.spin} />
                                        ) : (
                                            <MessageCircle size={18} />
                                        )}
                                        <span>{zaloSuccess ? "Đã gửi Zalo!" : "Gửi Zalo"}</span>
                                    </button>
                                    {zaloError && (
                                        <div className={styles.zaloError}>{zaloError}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Thông tin giao hàng</div>
                        <div className={styles.sectionContent}>
                            <div className={styles.customerInfo}>
                                <div className={styles.infoRow}>
                                    <Calendar size={16} className={styles.infoIcon} />
                                    <span className={styles.infoLabel}>Ngày:</span>
                                    <span className={styles.infoValue}>
                                        {formattedDate} ({donHang.ngayAm})
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <Clock size={16} className={styles.infoIcon} />
                                    <span className={styles.infoLabel}>Giờ:</span>
                                    <span className={styles.infoValue}>{donHang.thoiGian}</span>
                                </div>
                                {donHang.chiNhanh && (
                                    <div className={styles.infoRow}>
                                        <Building2 size={16} className={styles.infoIcon} />
                                        <span className={styles.infoLabel}>Chi nhánh:</span>
                                        <span className={styles.infoValue}>{donHang.chiNhanh}</span>
                                    </div>
                                )}
                                {donHang.hinhThucGiao && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Hình thức:</span>
                                        <span className={`${styles.infoValue} ${styles.infoBadge}`}>
                                            {donHang.hinhThucGiao}
                                        </span>
                                    </div>
                                )}
                                {donHang.shipperNhanDon && (
                                    <div className={styles.infoRow}>
                                        <UserCheck size={16} className={styles.infoIcon} />
                                        <span className={styles.infoLabel}>Shipper:</span>
                                        <span className={`${styles.infoValue} ${styles.shipperBadge}`}>
                                            {donHang.shipperNhanDon}
                                        </span>
                                    </div>
                                )}
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Thanh toán:</span>
                                    <span className={`${styles.infoValue} ${donHang.phuongThucThanhToan === "chuyen_khoan" ? styles.paymentTransfer : styles.paymentCash}`}>
                                        {donHang.phuongThucThanhToan === "chuyen_khoan" ? "Chuyển khoản" : "Tiền mặt"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Sản phẩm đặt hàng</div>
                        <div className={styles.sectionContent}>
                            <table className={styles.productsTable}>
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>SL</th>
                                        <th>Đơn giá</th>
                                        <th>Thành tiền</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donHang.sanPhams.map((sp) => {
                                        // Calculate item total (either from API or computed)
                                        const editData = editableProducts.get(sp.id);
                                        const currentQty = editingId === sp.id && editData ? editData.quantity : sp.soLuong;
                                        const currentPrice = editingId === sp.id && editData ? editData.price : (sp.donGia || 0);
                                        const itemTotal = sp.thanhTien || (currentQty * currentPrice);

                                        return (
                                            <tr key={sp.id}>
                                                <td>
                                                    {/* Product name is always read-only */}
                                                    <span className={styles.productName}>{sp.ten}</span>
                                                    {sp.maHang && (
                                                        <span className={styles.productCode}> {sp.maHang}</span>
                                                    )}
                                                    {sp.ghiChu && (
                                                        <div className={styles.productNote}>{sp.ghiChu}</div>
                                                    )}
                                                </td>
                                                <td>
                                                    {!isShippingFee(sp.ten) && editingId === sp.id ? (
                                                        <input
                                                            type="number"
                                                            className={styles.editInput}
                                                            value={editData?.quantity ?? sp.soLuong}
                                                            onChange={(e) => handleProductChange(sp.id, "quantity", Number(e.target.value))}
                                                            min={1}
                                                        />
                                                    ) : (
                                                        sp.soLuong
                                                    )}
                                                </td>
                                                <td>
                                                    {!isShippingFee(sp.ten) && editingId === sp.id ? (
                                                        <input
                                                            type="number"
                                                            className={styles.editInput}
                                                            value={editData?.price ?? (sp.donGia || 0)}
                                                            onChange={(e) => handleProductChange(sp.id, "price", Number(e.target.value))}
                                                            min={0}
                                                        />
                                                    ) : (
                                                        formatTien(sp.donGia || 0)
                                                    )}
                                                </td>
                                                <td className={styles.itemTotal}>
                                                    {formatTien(editingId === sp.id ? (currentQty * currentPrice) : itemTotal)}
                                                </td>
                                                <td>
                                                    {!isShippingFee(sp.ten) && (
                                                        editingId === sp.id ? (
                                                            <div className={styles.actionButtons}>
                                                                <button
                                                                    className={styles.saveBtn}
                                                                    onClick={() => handleSaveProduct(sp)}
                                                                    disabled={savingId === sp.id}
                                                                    title="Lưu"
                                                                >
                                                                    {savingId === sp.id ? (
                                                                        <Loader2 size={14} className={styles.spin} />
                                                                    ) : (
                                                                        <Save size={14} />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    className={styles.cancelBtn}
                                                                    onClick={cancelEditing}
                                                                    title="Hủy"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                className={styles.editBtn}
                                                                onClick={() => startEditing(sp)}
                                                                title="Sửa"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Product error message */}
                            {productError && (
                                <div className={styles.productError}>{productError}</div>
                            )}

                            {/* Add product button + form - Only for Chi nhánh 1 */}
                            {canEditPostRoast ? (
                                !isAddingProduct ? (
                                    <button
                                        onClick={() => setIsAddingProduct(true)}
                                        className={styles.addProductBtn}
                                    >
                                        <Plus size={16} />
                                        Thêm Thành Phẩm Sau Quay
                                    </button>
                                ) : (
                                    <div className={styles.addProductForm}>
                                        <div className={styles.addProductRow}>
                                            <input
                                                type="text"
                                                placeholder="Tên sản phẩm"
                                                value={newProduct.name}
                                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                                className={styles.addProductName}
                                            />
                                            <input
                                                type="number"
                                                placeholder="SL"
                                                value={newProduct.quantity}
                                                onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
                                                className={styles.addProductQty}
                                                min={1}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Giá"
                                                value={newProduct.price}
                                                onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                                                className={styles.addProductPrice}
                                                min={0}
                                            />
                                            <button
                                                className={styles.addProductSave}
                                                onClick={handleAddProduct}
                                                disabled={isSubmitting}
                                                title="Lưu"
                                            >
                                                {isSubmitting ? (
                                                    <Loader2 size={14} className={styles.spin} />
                                                ) : (
                                                    <Save size={14} />
                                                )}
                                            </button>
                                            <button
                                                className={styles.addProductCancel}
                                                onClick={cancelAddProduct}
                                                title="Hủy"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className={styles.lockedSection}>
                                    <Lock size={16} />
                                    <span>Thêm thành phẩm sau quay chỉ khả dụng cho Chi nhánh 1</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Thanh toán</div>
                        <div className={styles.sectionContent}>
                            <div className={styles.totalsSection}>
                                {donHang.phiShip > 0 && (
                                    <div className={styles.totalRow}>
                                        <span className={styles.totalLabel}>Phí ship:</span>
                                        <span className={styles.totalValue}>
                                            {formatTien(donHang.phiShip)}
                                        </span>
                                    </div>
                                )}
                                <div className={styles.totalRow}>
                                    <span className={styles.totalLabel}>Phương thức:</span>
                                    <span className={styles.totalValue}>
                                        {donHang.phuongThucThanhToan === "tien_mat"
                                            ? "Tiền mặt"
                                            : "Chuyển khoản"}
                                    </span>
                                </div>
                                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                                    <span>Tổng cộng:</span>
                                    <span>{formatTien(donHang.tongTien)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {donHang.ghiChu && (
                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>Ghi chú</div>
                            <div className={styles.sectionContent}>
                                <p>{donHang.ghiChu}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* QR Payment Modal */}
            {showQRModal && (
                <div className={styles.qrOverlay} onClick={() => setShowQRModal(false)}>
                    <div className={styles.qrModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.qrHeader}>
                            <h3>QR Chuyển khoản</h3>
                            <button onClick={() => setShowQRModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.qrContent}>
                            {isLoadingQR ? (
                                <div className={styles.qrLoading}>
                                    <Loader2 size={32} className={styles.loadingSpinner} />
                                    <p>Đang tạo QR...</p>
                                </div>
                            ) : qrData?.qrUrl ? (
                                <div className={styles.qrImageContainer}>
                                    {/* QR Image */}
                                    <img src={qrData.qrUrl} alt="QR Payment" className={styles.qrImage} />

                                    {/* Amount */}
                                    {qrData.amount && (
                                        <p className={styles.qrAmount}>Số tiền: {formatTien(qrData.amount)}</p>
                                    )}

                                    {/* Bank Info */}
                                    {(qrData.bankName || qrData.accountNumber) && (
                                        <div className={styles.qrBankInfo}>
                                            {qrData.bankLogo && (
                                                <img src={qrData.bankLogo} alt={qrData.bankName || "Bank"} className={styles.qrBankLogo} />
                                            )}
                                            <div className={styles.qrBankDetails}>
                                                {qrData.bankName && <span className={styles.qrBankName}>{qrData.bankName}</span>}
                                                {qrData.accountNumber && <span className={styles.qrAccountNumber}>STK: {qrData.accountNumber}</span>}
                                                {qrData.accountName && <span className={styles.qrAccountName}>{qrData.accountName}</span>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Transfer Content */}
                                    {qrData.bankContent && (
                                        <div className={styles.qrTransferContent}>
                                            <span className={styles.qrTransferLabel}>Nội dung CK:</span>
                                            <span className={styles.qrTransferValue}>{qrData.bankContent}</span>
                                        </div>
                                    )}

                                    {/* Instructions */}
                                    {qrData.content && (
                                        <p className={styles.qrInstructions}>{qrData.content}</p>
                                    )}
                                </div>
                            ) : (
                                <p>Không thể tạo QR</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
