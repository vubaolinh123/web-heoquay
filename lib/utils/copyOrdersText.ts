import { DonHang } from "@/lib/types";
import { CollectOrderRawItem } from "@/lib/api/collectOrdersApi";
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
            // TODO: Temporarily commented out notes display
            // if (item.notes.length > 0) {
            //     for (const note of item.notes) {
            //         text += `      - ${note}\n`;
            //     }
            // }
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
            // TODO: Temporarily commented out notes display
            // if (item.notes.length > 0) {
            //     for (const note of item.notes) {
            //         text += `      - ${note}\n`;
            //     }
            // }
        }
    }

    // Closing message
    text += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    const totalHeo = heoProducts.reduce((sum, item) => sum + item.quantity, 0);
    text += `💬 Dạ, tổng cộng ngày mai bếp ${branchText} cần chuẩn bị ${totalHeo} con heo các loại. Nếu anh chị cần thống kê thêm các món khác, em sẽ hỗ trợ ngay ạ!`;

    return text;
}

/**
 * Check if a raw item is a "heo" (pig) product based on name or product code
 */
function isHeoRawItem(item: CollectOrderRawItem): boolean {
    const nameLower = item.tenHang.toLowerCase();
    const codeLower = item.maHang.toLowerCase();

    // Check if name contains "heo"
    if (nameLower.includes("heo")) {
        return true;
    }

    // Check product codes that indicate "heo"
    // #NC (Nguyên Con), #H (Heo), #S (Heo Sữa)
    if (codeLower.startsWith("nc") ||
        codeLower.startsWith("h") ||
        codeLower === "s") {
        return true;
    }

    // Check if name contains "nguyên con"
    if (nameLower.includes("nguyên con")) {
        return true;
    }

    return false;
}

/**
 * Generate formatted summary text from raw collect order items
 * This function uses the exact raw items from collectOrdersApi to ensure accuracy
 * @param rawItems - Raw items from collectOrdersApi.getRawItems()
 * @param dateStr - Date string in DD-MM-YYYY format
 * @param branch - Branch name (optional)
 */
export function generateCollectOrdersSummaryText(
    rawItems: CollectOrderRawItem[],
    dateStr: string,
    branch?: string
): string {
    // Filter items for the specific date and branch
    let filteredItems = rawItems.filter(item => item.ngayGiaoHang === dateStr);

    if (branch) {
        filteredItems = filteredItems.filter(item => item.chiNhanh === branch);
    }

    if (filteredItems.length === 0) {
        return "Không có đơn hàng nào trong ngày này.";
    }

    const displayDate = formatDisplayDate(dateStr);
    // Extract branch number/name properly
    const branchName = branch
        ? branch.replace(/chi nhánh\s*/i, "").trim()
        : "";
    const branchText = branchName ? `Chi Nhánh ${branchName}` : "bếp";

    // Group items by product and separate heo vs side products
    const heoMap = new Map<string, { name: string; quantity: number }>();
    const sideMap = new Map<string, { name: string; quantity: number }>();

    for (const item of filteredItems) {
        // Skip shipping fees
        if (item.tenHang.toLowerCase().includes("phí ship") ||
            item.tenHang.toLowerCase().includes("phi ship")) {
            continue;
        }

        const isHeo = isHeoRawItem(item);
        const targetMap = isHeo ? heoMap : sideMap;

        // Extract product name without code suffix
        const productName = item.tenHang.split(" #")[0].trim();
        const key = productName.toLowerCase();

        if (targetMap.has(key)) {
            targetMap.get(key)!.quantity += item.soLuong;
        } else {
            targetMap.set(key, {
                name: productName,
                quantity: item.soLuong,
            });
        }
    }

    const heoProducts = Array.from(heoMap.values());
    const sideProducts = Array.from(sideMap.values());

    // Build opening message with icon
    let text = `📋 THỐNG KÊ ĐƠN HÀNG CHO BẾP\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📍 ${branchText} | 📅 ${displayDate}\n\n`;

    // Heo products section
    if (heoProducts.length > 0) {
        text += `🐷 SẢN PHẨM HEO:\n`;
        const heoQuantities: number[] = [];
        for (const item of heoProducts) {
            text += `   • ${item.name}: ${item.quantity} con\n`;
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
            text += `   • ${item.name}: ${item.quantity} phần\n`;
        }
    }

    // Closing message
    text += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    const totalHeo = heoProducts.reduce((sum, item) => sum + item.quantity, 0);
    text += `💬 Dạ, tổng cộng ngày mai bếp ${branchText} cần chuẩn bị ${totalHeo} con heo các loại. Nếu anh chị cần thống kê thêm các món khác, em sẽ hỗ trợ ngay ạ!`;

    return text;
}

/**
 * Generate formatted summary text from raw collect order items - GROUPED BY HOUR
 * This function groups items by delivery hour for kitchen preparation
 * @param rawItems - Raw items from collectOrdersApi.getRawItems()
 * @param dateStr - Date string in DD-MM-YYYY format
 * @param branch - Branch name (optional)
 */
export function generateCollectOrdersSummaryByHour(
    rawItems: CollectOrderRawItem[],
    dateStr: string,
    branch?: string
): string {
    // Filter items for the specific date and branch
    let filteredItems = rawItems.filter(item => item.ngayGiaoHang === dateStr);

    if (branch) {
        filteredItems = filteredItems.filter(item => item.chiNhanh === branch);
    }

    if (filteredItems.length === 0) {
        return "Không có đơn hàng nào trong ngày này.";
    }

    const displayDate = formatDisplayDate(dateStr);
    const branchName = branch
        ? branch.replace(/chi nhánh\s*/i, "").trim()
        : "";
    const branchText = branchName ? `Chi Nhánh ${branchName}` : "bếp";

    // Group items by hour first, then by product
    const hourlyGroups = new Map<string, Map<string, { name: string; quantity: number; isHeo: boolean }>>();

    // Also track totals for final summary
    const totalMap = new Map<string, { name: string; quantity: number; isHeo: boolean }>();

    for (const item of filteredItems) {
        // Skip shipping fees
        if (item.tenHang.toLowerCase().includes("phí ship") ||
            item.tenHang.toLowerCase().includes("phi ship")) {
            continue;
        }

        const hour = item.gioGiaoHang ? item.gioGiaoHang.split(":")[0] + ":00" : "Không xác định";
        const isHeo = isHeoRawItem(item);
        const productName = item.tenHang.split(" #")[0].trim();
        const key = productName.toLowerCase();

        // Add to hourly group
        if (!hourlyGroups.has(hour)) {
            hourlyGroups.set(hour, new Map());
        }
        const hourGroup = hourlyGroups.get(hour)!;

        if (hourGroup.has(key)) {
            hourGroup.get(key)!.quantity += item.soLuong;
        } else {
            hourGroup.set(key, {
                name: productName,
                quantity: item.soLuong,
                isHeo,
            });
        }

        // Add to totals
        if (totalMap.has(key)) {
            totalMap.get(key)!.quantity += item.soLuong;
        } else {
            totalMap.set(key, {
                name: productName,
                quantity: item.soLuong,
                isHeo,
            });
        }
    }

    // Sort hours chronologically
    const sortedHours = Array.from(hourlyGroups.keys()).sort((a, b) => {
        if (a === "Không xác định") return 1;
        if (b === "Không xác định") return -1;
        return a.localeCompare(b);
    });

    // Build text
    let text = `📋 THỐNG KÊ ĐƠN HÀNG CHO BẾP\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📍 ${branchText} | 📅 ${displayDate}\n\n`;

    // Items grouped by hour
    for (const hour of sortedHours) {
        const products = hourlyGroups.get(hour)!;
        text += `🕐 ${hour}\n`;

        for (const [, product] of products) {
            const unit = product.isHeo ? "con" : "phần";
            text += `   • ${product.name}: ${product.quantity} ${unit}\n`;
        }
        text += `\n`;
    }

    // Totals section
    const heoProducts = Array.from(totalMap.values()).filter(p => p.isHeo);
    const sideProducts = Array.from(totalMap.values()).filter(p => !p.isHeo);

    text += `✅ Tổng cộng:\n`;

    if (heoProducts.length > 0) {
        text += `   🐷 Heo:\n`;
        for (const item of heoProducts) {
            text += `      • ${item.name}: ${item.quantity} con\n`;
        }
    }

    if (sideProducts.length > 0) {
        text += `   🥢 Phụ phẩm:\n`;
        for (const item of sideProducts) {
            text += `      • ${item.name}: ${item.quantity} phần\n`;
        }
    }

    // Closing
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
