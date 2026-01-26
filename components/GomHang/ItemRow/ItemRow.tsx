import { CollectOrderItem } from "@/lib/api/collectOrdersApi";
import styles from "./ItemRow.module.css";

interface ItemRowProps {
    item: CollectOrderItem;
}

/**
 * Get icon based on product type
 */
function getProductIcon(maHang: string, tenHang: string): string {
    const lowerName = tenHang.toLowerCase();

    if (lowerName.includes("heo") || lowerName.includes("sữa")) return "🐷";
    if (lowerName.includes("vịt")) return "🦆";
    if (lowerName.includes("bánh")) return "🍞";
    if (lowerName.includes("ba chỉ")) return "🥓";
    if (lowerName.includes("set")) return "🍱";
    if (lowerName.includes("laghim")) return "🍖";

    return "📦";
}

export default function ItemRow({ item }: ItemRowProps) {
    const icon = getProductIcon(item.maHang, item.tenHang);

    return (
        <div className={styles.row}>
            <span className={styles.icon}>{icon}</span>
            <div className={styles.info}>
                <span className={styles.name}>{item.tenHang}</span>
                <span className={styles.code}>{item.maHang}</span>
            </div>
            <span className={styles.quantity}>{item.tongSoLuong}</span>
        </div>
    );
}
