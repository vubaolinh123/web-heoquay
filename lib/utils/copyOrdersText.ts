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
 * Check if a product is a "heo" (pig) product based on name or product code
 * Returns true if unit should be "con", false if unit should be "phần"
 */
function isHeoProduct(productName: string, maHang?: string): boolean {
    const nameLower = productName.toLowerCase();

    // Check if name contains "heo"
    if (nameLower.includes("heo")) {
        return true;
    }

    // Check product codes that indicate "heo"
    if (maHang) {
        const codeLower = maHang.toLowerCase();
        // #NC (Nguyên Con), #H (Heo), #S (Heo Sữa)
        if (codeLower.startsWith("nc") ||
            codeLower.startsWith("h") ||
            codeLower === "s") {
            return true;
        }
    }

    // Check if name contains "nguyên con"
    if (nameLower.includes("nguyên con")) {
        return true;
    }

    return false;
}

/**
 * Check if product is a shipping fee
 */
function isShippingFee(productName: string): boolean {
    const nameLower = productName.toLowerCase();
    return nameLower.includes("phí ship") || nameLower.includes("phi ship");
}

/**
 * Product summary with unit type
 */
interface ProductSummaryItem {
    name: string;
    quantity: number;
    unit: "con" | "phần";
    notes: string[];
}

/**
 * Get product summary grouped by product name, separated by type (heo vs side products)
 */
function getCategorizedProductSummary(orders: DonHang[]): {
    heoProducts: ProductSummaryItem[];
    sideProducts: ProductSummaryItem[];
} {
    const heoMap = new Map<string, ProductSummaryItem>();
    const sideMap = new Map<string, ProductSummaryItem>();

    for (const order of orders) {
        for (const sp of order.sanPhams) {
            // Skip shipping fees
            if (isShippingFee(sp.ten)) {
                continue;
            }

            const isHeo = isHeoProduct(sp.ten, sp.maHang);
            const targetMap = isHeo ? heoMap : sideMap;

            // Use full product name with size as key
            const sizeText = sp.kichThuoc ? ` Size ${sp.kichThuoc}` : "";
            const fullName = `${sp.ten}${sizeText}`.trim();
            const key = fullName.toLowerCase();

            // Clean note - remove #Callio and trim
            const cleanedNote = sp.ghiChu
                ? sp.ghiChu.replace(/#callio/gi, "").replace(/^[,\s]+|[,\s]+$/g, "").trim()
                : "";

            if (targetMap.has(key)) {
                const existing = targetMap.get(key)!;
                existing.quantity += sp.soLuong;
                // Add note if exists, not empty, and not already added
                if (cleanedNote && !existing.notes.includes(cleanedNote)) {
                    existing.notes.push(cleanedNote);
                }
            } else {
                targetMap.set(key, {
                    name: fullName,
                    quantity: sp.soLuong,
                    unit: isHeo ? "con" : "phần",
                    notes: cleanedNote ? [cleanedNote] : [],
                });
            }
        }
    }

    return {
        heoProducts: Array.from(heoMap.values()),
        sideProducts: Array.from(sideMap.values()),
    };
}

/**
 * Get unique customer list from orders
 */
function getCustomerList(orders: DonHang[]): string[] {
    const customers: string[] = [];
    for (const order of orders) {
        const customerText = `KH: ${order.khachHang.ten} – ${order.khachHang.soDienThoai}`;
        if (!customers.includes(customerText)) {
            customers.push(customerText);
        }
    }
    return customers;
}

/**
 * Generate formatted order summary text for copying
 * Format includes: customer list, heo products, side products, notes, and totals
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
    // Extract branch number/name properly
    const branchName = branch
        ? branch.replace(/chi nhánh\s*/i, "").trim()
        : "";
    const branchText = branchName ? `Chi Nhánh ${branchName}` : "bếp";

    // Get categorized product summary
    const { heoProducts, sideProducts } = getCategorizedProductSummary(orders);

    // Build opening message with icon
    let text = `📋 THỐNG KÊ ĐƠN HÀNG CHO BẾP\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📍 ${branchText} | 📅 ${displayDate}\n\n`;

    // Heo products section
    if (heoProducts.length > 0) {
        text += `🐷 SẢN PHẨM HEO:\n`;
        const heoQuantities: number[] = [];
        for (const item of heoProducts) {
            text += `   • ${item.name}: ${item.quantity} ${item.unit}\n`;
            // Add notes on separate lines
            if (item.notes.length > 0) {
                for (const note of item.notes) {
                    text += `      - ${note}\n`;
                }
            }
            heoQuantities.push(item.quantity);
        }

        // Calculate total for heo
        const heoTotal = heoQuantities.reduce((sum, q) => sum + q, 0);
        const heoCalculationStr = heoQuantities.join(" + ");

        text += `\n✅ Tổng cộng: ${heoCalculationStr} = ${heoTotal} con\n`;
    }

    // Side products section (phụ phẩm)
    if (sideProducts.length > 0) {
        text += `\n🥢 PHỤ PHẨM:\n`;
        for (const item of sideProducts) {
            text += `   • ${item.name}: ${item.quantity} ${item.unit}\n`;
            // Add notes on separate lines
            if (item.notes.length > 0) {
                for (const note of item.notes) {
                    text += `      - ${note}\n`;
                }
            }
        }
    }

    // Closing message
    text += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    const totalHeo = heoProducts.reduce((sum, item) => sum + item.quantity, 0);
    text += `💬 Dạ, tổng cộng ngày mai bếp ${branchText} cần chuẩn bị ${totalHeo} con heo các loại. Nếu anh chị cần thống kê thêm các món khác, em sẽ hỗ trợ ngay ạ!`;

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
