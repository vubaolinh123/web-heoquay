import { DonHang } from "@/lib/types";
import { formatTien } from "@/lib/mockData";

/**
 * Format date from DD-MM-YYYY to display format
 */
function formatDisplayDate(dateStr: string): string {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
    return dateStr;
}

/**
 * Group products by name for kitchen summary
 */
interface ProductSummary {
    name: string;
    quantity: number;
    sizes: string[];
}

function getKitchenSummary(orders: DonHang[]): ProductSummary[] {
    const productMap = new Map<string, ProductSummary>();

    for (const order of orders) {
        for (const sp of order.sanPhams) {
            // Skip shipping fees
            const nameLower = sp.ten.toLowerCase();
            if (nameLower.includes("phí ship") || nameLower.includes("phi ship")) {
                continue;
            }

            // Extract base product name (remove size info for grouping)
            const baseName = sp.ten
                .replace(/size\s*[\d.-]+\s*kg?/gi, "")
                .replace(/\d+\.?\d*\s*-\s*\d+\.?\d*\s*kg?/gi, "")
                .trim();

            const key = baseName.toLowerCase();

            if (productMap.has(key)) {
                const existing = productMap.get(key)!;
                existing.quantity += sp.soLuong;
                if (sp.kichThuoc && !existing.sizes.includes(sp.kichThuoc)) {
                    existing.sizes.push(sp.kichThuoc);
                }
            } else {
                productMap.set(key, {
                    name: baseName,
                    quantity: sp.soLuong,
                    sizes: sp.kichThuoc ? [sp.kichThuoc] : [],
                });
            }
        }
    }

    return Array.from(productMap.values());
}

/**
 * Generate formatted order summary text for copying
 * @param orders - Orders for the specific date
 * @param dateStr - Date string in DD-MM-YYYY format
 * @param branch - Branch name (optional)
 */
export function generateOrdersSummaryText(
    orders: DonHang[],
    dateStr: string,
    branch?: string
): string {
    if (orders.length === 0) {
        return "Không có đơn hàng nào trong ngày này.";
    }

    const displayDate = formatDisplayDate(dateStr);
    const branchText = branch ? ` chi nhánh ${branch.replace(/chi nhánh\s*/i, "")}` : "";

    // Sort orders by time
    const sortedOrders = [...orders].sort((a, b) => {
        const timeA = a.thoiGian || "00:00";
        const timeB = b.thoiGian || "00:00";
        return timeA.localeCompare(timeB);
    });

    let text = `Xin chào anh chị, thống kê tổng hợp đơn hàng cho bếp${branchText} ngày mai (${displayDate}) như sau:\n\n`;
    text += `📋 LỊCH ĐƠN HÀNG – ${displayDate}\n\n`;

    // Order entries
    for (const order of sortedOrders) {
        text += `⏰ ${order.thoiGian || "N/A"}\n`;
        text += ` • KH: ${order.khachHang.ten} – ${order.khachHang.soDienThoai}\n`;

        // Products
        for (const sp of order.sanPhams) {
            const nameLower = sp.ten.toLowerCase();
            if (nameLower.includes("phí ship") || nameLower.includes("phi ship")) {
                continue;
            }
            const price = sp.donGia ? formatTien(sp.donGia * sp.soLuong) : "";
            const sizeText = sp.kichThuoc ? ` Size ${sp.kichThuoc}` : "";
            text += ` • ${sp.soLuong} x ${sp.ten}${sizeText}${price ? ` – ${price}` : ""}\n`;
        }

        // Shipping fee
        if (order.phiShip > 0) {
            text += ` • Phí ship: ${formatTien(order.phiShip)}\n`;
        }

        // Address
        text += ` • Đ/c: ${order.khachHang.diaChi}\n`;
        text += "\n";
    }

    // Kitchen summary
    text += "⸻\n\n";
    text += "✅ TỔNG HỢP CHO BẾP\n";

    const summary = getKitchenSummary(sortedOrders);
    for (const item of summary) {
        let sizeInfo = "";
        if (item.sizes.length > 0) {
            const sizeStrings = item.sizes.map(s => `1 con size ${s}`);
            sizeInfo = ` (${sizeStrings.join(", ")})`;
        }
        text += ` • ${item.quantity} x ${item.name}${sizeInfo}\n`;
    }

    text += "\nAnh chị xem thêm thông tin nào vui lòng báo lại em nhé.";

    return text;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }

        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const success = document.execCommand("copy");
        document.body.removeChild(textArea);
        return success;
    } catch (error) {
        console.error("Copy to clipboard failed:", error);
        return false;
    }
}
