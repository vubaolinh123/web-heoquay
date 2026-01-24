"use client";

import { useRef } from "react";
import { DonHang } from "@/lib/types";
import { ChevronLeft, Printer, X } from "lucide-react";
import styles from "./ReportModal.module.css";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
    orders: DonHang[];
}

export default function ReportModal({
    isOpen,
    onClose,
    date,
    orders,
}: ReportModalProps) {
    const printRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    const formatDate = (d: Date) => {
        return d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getMonthYear = (d: Date) => {
        return `Tháng ${String(d.getMonth() + 1).padStart(2, "0")} Năm ${d.getFullYear()}`;
    };

    const handlePrint = () => {
        if (!printRef.current) return;

        const printContent = printRef.current.innerHTML;
        const printWindow = window.open('', '_blank', 'width=1000,height=800');

        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Báo Cáo 01/TNDN - ${formatDate(date)}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Times New Roman', serif; padding: 30px; font-size: 13px; }
                        table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11px; }
                        th, td { border: 1px solid #000; padding: 5px 6px; text-align: left; vertical-align: top; }
                        th { background: white; font-weight: 600; text-align: center; }
                        .formHeader { display: flex; justify-content: space-between; margin-bottom: 20px; }
                        .formCode { font-size: 12px; }
                        .formNote { font-size: 10px; font-style: italic; }
                        .formTitle { text-align: center; flex: 1; }
                        .formTitle h1 { font-size: 16px; font-weight: 700; color: #1e40af; margin: 0; }
                        .formTitle h2 { font-size: 14px; font-weight: 700; color: #1e40af; margin: 4px 0; }
                        .formPeriod { font-style: italic; }
                        .businessInfo { margin-bottom: 15px; line-height: 1.8; }
                        .taxCode { border: 1px solid #000; display: inline-block; padding: 4px 12px; float: right; }
                        .numberCell { text-align: right; }
                        .totalLabel { font-weight: 600; font-style: italic; }
                        .totalValue { text-align: right; font-weight: 700; }
                        .signatures { display: flex; justify-content: space-between; margin-top: 30px; clear: both; }
                        .signatureItem { text-align: center; min-width: 150px; }
                        .signatureTitle { font-weight: 700; font-size: 12px; margin: 0 0 4px; }
                        .signatureNote { font-style: italic; font-size: 11px; margin: 0; }
                        .signatureDate { font-style: italic; font-size: 12px; margin: 0 0 8px; }
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

    // Calculate total
    const totalAmount = orders.reduce((sum, order) => sum + order.tongTien, 0);

    // Generate report rows - each product as a separate row
    const reportRows: {
        date: string;
        seller: string;
        address: string;
        cmtNumber: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        note: string;
    }[] = [];

    orders.forEach((order) => {
        order.sanPhams.forEach((product) => {
            // Calculate unit price from product (need to add to type or estimate)
            const unitPrice = order.tongTien / order.sanPhams.reduce((s, p) => s + p.soLuong, 0);
            reportRows.push({
                date: formatDate(date),
                seller: order.khachHang.ten,
                address: order.diaChiGiao || order.khachHang.diaChi,
                cmtNumber: "",
                productName: `${product.ten} ${product.kichThuoc} ${product.maHang}`,
                quantity: product.soLuong,
                unitPrice: unitPrice,
                totalPrice: product.soLuong * unitPrice,
                note: order.ghiChu || "",
            });
        });
        // Add shipping fee if exists
        if (order.phiShip && order.phiShip > 0) {
            reportRows.push({
                date: formatDate(date),
                seller: order.khachHang.ten,
                address: order.diaChiGiao || order.khachHang.diaChi,
                cmtNumber: "",
                productName: "Phí ship",
                quantity: 1,
                unitPrice: order.phiShip,
                totalPrice: order.phiShip,
                note: "",
            });
        }
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
                            <span>IN BÁO CÁO (01/TNDN)</span>
                        </button>
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Print Content */}
                <div className={styles.printContent} data-print-content ref={printRef}>
                    {/* Form Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div style={{ fontSize: '12px', lineHeight: 1.4 }}>
                            <p style={{ margin: 0 }}><strong>Mẫu số: 01/TNDN</strong></p>
                            <p style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                                (Ban hành kèm theo Thông tư số<br />
                                78/2014/TT-BTC của Bộ Tài<br />
                                chính)
                            </p>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1e40af', margin: 0 }}>BẢNG KÊ THU MUA HÀNG HÓA, DỊCH VỤ</h1>
                            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e40af', margin: '4px 0' }}>MUA VÀO KHÔNG CÓ HÓA ĐƠN</h2>
                            <p style={{ fontSize: '14px', fontStyle: 'italic', margin: '8px 0 0' }}>{getMonthYear(date)}</p>
                        </div>
                    </div>

                    {/* Business Info */}
                    <div style={{ marginBottom: '24px', lineHeight: 1.8, position: 'relative' }}>
                        <p style={{ margin: '2px 0' }}>- Tên doanh nghiệp: <strong>HỘ KINH DOANH NGỌC HẢI</strong></p>
                        <p style={{ margin: '2px 0' }}>- Địa chỉ: 45A Vân Đồn, Phường Phước Hòa, Thành phố Nha Trang, Tỉnh Khánh Hòa, Việt Nam</p>
                        <p style={{ margin: '2px 0' }}>- Địa chỉ nơi tổ chức thu mua: ...............................................................................................</p>
                        <p style={{ margin: '2px 0' }}>- Người phụ trách thu mua: ...................................................................................................</p>
                        <div style={{ position: 'absolute', right: 0, top: 0, border: '1px solid #1e293b', padding: '4px 12px' }}>
                            <span>Mã số thuế: </span>
                            <strong>4201719641</strong>
                        </div>
                    </div>

                    {/* Report Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px', fontSize: '11px' }}>
                        <thead>
                            <tr>
                                <th rowSpan={2} style={{ border: '1px solid #1e293b', padding: '6px 8px', fontWeight: 600, textAlign: 'center', verticalAlign: 'middle', background: 'white' }}>Ngày tháng<br />năm<br />mua hàng</th>
                                <th colSpan={3} style={{ border: '1px solid #1e293b', padding: '6px 8px', fontWeight: 600, textAlign: 'center', background: 'white' }}>Người bán</th>
                                <th colSpan={4} style={{ border: '1px solid #1e293b', padding: '6px 8px', fontWeight: 600, textAlign: 'center', background: 'white' }}>Hàng hóa mua vào</th>
                                <th rowSpan={2} style={{ border: '1px solid #1e293b', padding: '6px 8px', fontWeight: 600, textAlign: 'center', verticalAlign: 'middle', background: 'white' }}>Ghi chú</th>
                            </tr>
                            <tr>
                                <th style={{ border: '1px solid #1e293b', padding: '6px 8px', fontWeight: 600, textAlign: 'center', background: 'white' }}>Tên người bán</th>
                                <th style={{ border: '1px solid #1e293b', padding: '6px 8px', fontWeight: 600, textAlign: 'center', background: 'white' }}>Địa chỉ</th>
                                <th style={{ border: '1px solid #1e293b', padding: '6px 8px', fontWeight: 600, textAlign: 'center', background: 'white' }}>Số CMT<br />nhân dân</th>
                                <th style={{ border: '1px solid #1e293b', padding: '6px 8px', fontWeight: 600, textAlign: 'center', background: 'white' }}>Tên<br />mặt hàng</th>
                                <th style={{ border: '1px solid #1e293b', padding: '6px 8px', fontWeight: 600, textAlign: 'center', background: 'white' }}>Số<br />lượng</th>
                                <th style={{ border: '1px solid #1e293b', padding: '6px 8px', fontWeight: 600, textAlign: 'center', background: 'white' }}>Đơn giá</th>
                                <th style={{ border: '1px solid #1e293b', padding: '6px 8px', fontWeight: 600, textAlign: 'center', background: 'white' }}>Tổng tiền<br />thanh toán</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportRows.map((row, index) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid #1e293b', padding: '6px 8px', verticalAlign: 'top' }}>{row.date}</td>
                                    <td style={{ border: '1px solid #1e293b', padding: '6px 8px', verticalAlign: 'top' }}>{row.seller}</td>
                                    <td style={{ border: '1px solid #1e293b', padding: '6px 8px', verticalAlign: 'top' }}>{row.address}</td>
                                    <td style={{ border: '1px solid #1e293b', padding: '6px 8px', verticalAlign: 'top' }}>{row.cmtNumber}</td>
                                    <td style={{ border: '1px solid #1e293b', padding: '6px 8px', verticalAlign: 'top' }}>{row.productName}</td>
                                    <td style={{ border: '1px solid #1e293b', padding: '6px 8px', textAlign: 'right', verticalAlign: 'top' }}>{row.quantity.toFixed(2)}</td>
                                    <td style={{ border: '1px solid #1e293b', padding: '6px 8px', textAlign: 'right', verticalAlign: 'top' }}>{row.unitPrice.toLocaleString("vi-VN")}</td>
                                    <td style={{ border: '1px solid #1e293b', padding: '6px 8px', textAlign: 'right', verticalAlign: 'top' }}>{row.totalPrice.toLocaleString("vi-VN")}</td>
                                    <td style={{ border: '1px solid #1e293b', padding: '6px 8px', verticalAlign: 'top' }}>{row.note}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={7} style={{ border: '1px solid #1e293b', padding: '6px 8px', fontWeight: 600, fontStyle: 'italic' }}>- Tổng giá trị hàng hóa mua vào:</td>
                                <td style={{ border: '1px solid #1e293b', padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>{totalAmount.toLocaleString("vi-VN")}</td>
                                <td style={{ border: '1px solid #1e293b', padding: '6px 8px' }}></td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Signatures */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px' }}>
                        <div style={{ textAlign: 'center', minWidth: '150px' }}>
                            <p style={{ fontWeight: 700, margin: '0 0 4px', fontSize: '12px' }}>Người lập biểu</p>
                            <p style={{ fontStyle: 'italic', fontSize: '11px', color: '#64748b', margin: 0 }}>(Ký, họ tên)</p>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: '150px' }}>
                            <p style={{ fontWeight: 700, margin: '0 0 4px', fontSize: '12px' }}>Kế toán</p>
                            <p style={{ fontStyle: 'italic', fontSize: '11px', color: '#64748b', margin: 0 }}>(Ký, họ tên)</p>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: '150px' }}>
                            <p style={{ fontStyle: 'italic', fontSize: '12px', margin: '0 0 8px' }}>
                                Ngày {date.getDate()} tháng {date.getMonth() + 1} năm {date.getFullYear()}
                            </p>
                            <p style={{ fontWeight: 700, margin: '0 0 4px', fontSize: '12px' }}>NGƯỜI ĐẠI DIỆN HỘ KINH DOANH/CÁ NHÂN KINH DOANH</p>
                            <p style={{ fontStyle: 'italic', fontSize: '11px', color: '#64748b', margin: 0 }}>(Ký, họ tên, đóng dấu)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
