"use client";

import { useRef } from "react";
import { DonHang } from "@/lib/types";
import { ChevronLeft, Printer, X } from "lucide-react";
import styles from "./KitchenSlipModal.module.css";

interface KitchenSlipModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
    lunarDate: string;
    orders: DonHang[];
}

export default function KitchenSlipModal({
    isOpen,
    onClose,
    date,
    lunarDate,
    orders,
}: KitchenSlipModalProps) {
    const printRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    const formatDate = (d: Date) => {
        return d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const handlePrint = () => {
        if (!printRef.current) return;

        const printContent = printRef.current.innerHTML;
        const printWindow = window.open('', '_blank', 'width=950,height=700');

        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Phiếu Bếp - ${formatDate(date)}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 32px; font-size: 13px; max-width: 900px; margin: 0 auto; }
                        
                        /* Company Header */
                        .companyHeader { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #dc2626; }
                        .companyInfo { display: flex; align-items: center; gap: 16px; }
                        .logo { width: 80px; height: 80px; object-fit: contain; }
                        .companyName { font-size: 24px; font-weight: 700; color: #dc2626; margin: 0 0 4px; }
                        .hotline { font-size: 14px; color: #1e293b; margin: 0; }
                        .slogan { font-size: 12px; color: #64748b; font-style: italic; margin: 0; }
                        .reportInfo { text-align: right; }
                        .reportTitle { font-size: 20px; font-weight: 700; color: #1e40af; margin: 0 0 8px; }
                        .reportDate, .reportLunar { font-size: 14px; color: #1e293b; margin: 2px 0; }
                        
                        /* Table */
                        table { width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 13px; }
                        th, td { border: 1px solid #1e293b; padding: 8px 10px; text-align: left; vertical-align: top; }
                        th { background: white; font-weight: 600; text-transform: uppercase; color: #1e293b; }
                        .timeCell { text-align: center; }
                        .time { display: block; font-weight: 700; font-size: 14px; }
                        .status { display: block; font-size: 11px; color: #64748b; }
                        .quantityCell { text-align: center; font-weight: 700; }
                        .totalLabel { text-align: right; font-weight: 600; }
                        .totalValue { text-align: center; font-weight: 700; font-size: 16px; }
                        
                        /* Footer Summary - Grid 3 columns */
                        .footerSummary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
                        .summaryBox, .signatureBox { border: 1px solid #1e293b; padding: 16px; }
                        .summaryBox h3, .signatureBox h3 { font-size: 12px; font-weight: 700; color: #1e293b; margin: 0 0 8px; text-transform: uppercase; }
                        .summaryRow { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; }
                        .summaryRow.total { border-top: 1px solid #1e293b; margin-top: 8px; padding-top: 8px; font-weight: 700; }
                        .productRow { display: flex; justify-content: space-between; font-size: 11px; padding: 2px 0; }
                        .signatureArea { height: 60px; }
                        
                        @media print { body { padding: 15px; } }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    };

    // Helper function to check if product is shipping fee
    const isShippingFee = (productName: string) => {
        const nameLower = productName.toLowerCase();
        return nameLower.includes("phí ship") || nameLower.includes("phi ship");
    };

    // Calculate summary (exclude shipping fees)
    const pendingOrders = orders.filter((o) => o.trangThai === "Chưa giao" || o.trangThai === "Đang giao");
    const deliveredOrders = orders.filter((o) => o.trangThai === "Đã giao");
    const totalProducts = orders.reduce(
        (sum, o) => sum + o.sanPhams.filter(p => !isShippingFee(p.ten)).reduce((s, p) => s + p.soLuong, 0),
        0
    );

    // Product summary (exclude "Phí ship")
    const productSummary: Record<string, number> = {};
    let totalProductsInSummary = 0;
    orders.forEach((order) => {
        order.sanPhams.forEach((product) => {
            // Skip shipping fee products
            if (isShippingFee(product.ten)) {
                return;
            }
            const key = `${product.ten} ${product.kichThuoc || ""} ${product.maHang || ""}`.trim();
            productSummary[key] = (productSummary[key] || 0) + product.soLuong;
            totalProductsInSummary += product.soLuong;
        });
    });

    return (
        <div className={styles.overlay} data-print-modal>
            <div className={styles.modal}>
                {/* Header - No Print */}
                <div className={`${styles.header} ${styles.noPrint}`} data-no-print>
                    <button className={styles.backBtn} onClick={onClose}>
                        <ChevronLeft size={20} />
                        <span>QUAY LẠI</span>
                    </button>
                    <div className={styles.headerActions}>
                        <button className={styles.printBtn} onClick={handlePrint}>
                            <Printer size={18} />
                            <span>IN PHIẾU BẾP</span>
                        </button>
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Print Content */}
                <div className={styles.printContent} ref={printRef} data-print-content>
                    {/* Company Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid #dc2626' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <img src="/logo.png" alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                            <div>
                                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626', margin: '0 0 4px' }}>LÒ HEO QUAY NGỌC HẢI</h1>
                                <p style={{ fontSize: '14px', color: '#1e293b', margin: 0 }}>Hotline:0903375256</p>
                                <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>Đồ ăn ngon-Trọn vị truyền thống</p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e40af', margin: '0 0 8px' }}>BẢNG KÊ CHI TIẾT</h2>
                            <p style={{ fontSize: '14px', color: '#1e293b', margin: '2px 0' }}>Ngày:{formatDate(date)}</p>
                            <p style={{ fontSize: '14px', color: '#1e293b', margin: '2px 0' }}>ÂM:{lunarDate}</p>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px', fontSize: '13px' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #1e293b', padding: '8px 10px', fontWeight: 600, textTransform: 'uppercase', background: 'white' }}>STT</th>
                                <th style={{ border: '1px solid #1e293b', padding: '8px 10px', fontWeight: 600, textTransform: 'uppercase', background: 'white' }}>GIỜ/LOẠI</th>
                                <th style={{ border: '1px solid #1e293b', padding: '8px 10px', fontWeight: 600, textTransform: 'uppercase', background: 'white' }}>KHÁCH HÀNG</th>
                                <th style={{ border: '1px solid #1e293b', padding: '8px 10px', fontWeight: 600, textTransform: 'uppercase', background: 'white' }}>ĐỊA CHỈ GIAO HÀNG</th>
                                <th style={{ border: '1px solid #1e293b', padding: '8px 10px', fontWeight: 600, textTransform: 'uppercase', background: 'white' }}>TÊN SẢN PHẨM</th>
                                <th style={{ border: '1px solid #1e293b', padding: '8px 10px', fontWeight: 600, textTransform: 'uppercase', background: 'white' }}>SL</th>
                                <th style={{ border: '1px solid #1e293b', padding: '8px 10px', fontWeight: 600, textTransform: 'uppercase', background: 'white' }}>GHI CHÚ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => (
                                <tr key={order.id}>
                                    <td style={{ border: '1px solid #1e293b', padding: '8px 10px', verticalAlign: 'top' }}>{index + 1}</td>
                                    <td style={{ border: '1px solid #1e293b', padding: '8px 10px', textAlign: 'center', verticalAlign: 'top' }}>
                                        <span style={{ display: 'block', fontWeight: 700, fontSize: '14px' }}>{order.gioGiao || order.thoiGian}</span>
                                        <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>
                                            {order.trangThai === "Đã giao" ? "ĐÃ GIAO" : order.trangThai?.toUpperCase() || "GIAO HÀNG"}
                                        </span>
                                    </td>
                                    <td style={{ border: '1px solid #1e293b', padding: '8px 10px', verticalAlign: 'top' }}>
                                        <strong>{order.khachHang.ten}</strong>
                                        <br />
                                        {order.khachHang.soDienThoai}
                                    </td>
                                    <td style={{ border: '1px solid #1e293b', padding: '8px 10px', verticalAlign: 'top' }}>{order.diaChiGiao || order.khachHang.diaChi}</td>
                                    <td style={{ border: '1px solid #1e293b', padding: '8px 10px', verticalAlign: 'top' }}>
                                        {order.sanPhams.filter(p => !isShippingFee(p.ten)).map((p, i) => (
                                            <div key={i}>
                                                {p.ten} {p.kichThuoc} {p.maHang}
                                            </div>
                                        ))}
                                    </td>
                                    <td style={{ border: '1px solid #1e293b', padding: '8px 10px', textAlign: 'center', fontWeight: 700, verticalAlign: 'top' }}>
                                        {order.sanPhams.filter(p => !isShippingFee(p.ten)).reduce((sum, p) => sum + p.soLuong, 0)}
                                    </td>
                                    <td style={{ border: '1px solid #1e293b', padding: '8px 10px', verticalAlign: 'top' }}>{order.ghiChu || ""}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={5} style={{ border: '1px solid #1e293b', padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>
                                    TỔNG CỘNG SẢN LƯỢNG:
                                </td>
                                <td style={{ border: '1px solid #1e293b', padding: '8px 10px', textAlign: 'center', fontWeight: 700, fontSize: '16px' }}>{totalProducts}</td>
                                <td style={{ border: '1px solid #1e293b', padding: '8px 10px' }}></td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Footer Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div style={{ border: '1px solid #1e293b', padding: '16px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', margin: '0 0 8px', textTransform: 'uppercase' }}>TRẠNG THÁI ĐƠN HÀNG</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                                <span>Chưa giao</span>
                                <span>{pendingOrders.length} đơn-{pendingOrders.reduce((s, o) => s + o.sanPhams.filter(p => !isShippingFee(p.ten)).reduce((ps, p) => ps + p.soLuong, 0), 0)} sp</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                                <span>Đã giao</span>
                                <span>{deliveredOrders.length} đơn-{deliveredOrders.reduce((s, o) => s + o.sanPhams.filter(p => !isShippingFee(p.ten)).reduce((ps, p) => ps + p.soLuong, 0), 0)} sp</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '8px 0 4px', borderTop: '1px solid #1e293b', marginTop: '8px', fontWeight: 700 }}>
                                <span>TỔNG CỘNG</span>
                                <span>{orders.length} đơn</span>
                            </div>
                        </div>

                        <div style={{ border: '1px solid #1e293b', padding: '16px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', margin: '0 0 8px', textTransform: 'uppercase' }}>TỔNG HỢP SẢN PHẨM LẺ</h3>
                            {Object.entries(productSummary).map(([name, qty]) => (
                                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '2px 0' }}>
                                    <span>{name.toUpperCase()}</span>
                                    <span>{qty}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '8px 0 4px', borderTop: '1px solid #1e293b', marginTop: '8px', fontWeight: 700 }}>
                                <span>TỔNG CỘNG</span>
                                <span>{totalProductsInSummary} sản phẩm</span>
                            </div>
                        </div>

                        <div style={{ border: '1px solid #1e293b', padding: '16px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', margin: '0 0 8px', textTransform: 'uppercase' }}>XÁC NHẬN CỦA LÒ</h3>
                            <div style={{ height: '60px' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
