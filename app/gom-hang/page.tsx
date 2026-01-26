"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, RefreshCw, AlertCircle } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { DateCard } from "@/components/GomHang";
import { collectOrdersApi, CollectOrderDay } from "@/lib/api";
import styles from "./page.module.css";

export default function GomHangPage() {
    const [data, setData] = useState<CollectOrderDay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await collectOrdersApi.getAll();
            setData(result);
        } catch (err) {
            console.error("Failed to fetch collect orders:", err);
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Calculate total stats
    const totalDays = data.length;
    const totalItems = data.reduce((sum, day) =>
        sum + day.danhSachHang.reduce((daySum, item) => daySum + item.tongSoLuong, 0), 0
    );

    return (
        <MobileLayout>
            <div className={styles.container}>
                {/* Page Header */}
                <div className={styles.pageHeader}>
                    <div className={styles.headerInfo}>
                        <h1 className={styles.pageTitle}>
                            <Package size={24} />
                            Gom Hàng
                        </h1>
                        <p className={styles.subtitle}>
                            Tổng hợp sản phẩm theo ngày giao
                        </p>
                    </div>
                    <button
                        className={styles.refreshBtn}
                        onClick={fetchData}
                        disabled={isLoading}
                    >
                        <RefreshCw size={18} className={isLoading ? styles.spinning : ""} />
                    </button>
                </div>

                {/* Stats Summary */}
                {!isLoading && !error && data.length > 0 && (
                    <div className={styles.summary}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryValue}>{totalDays}</span>
                            <span className={styles.summaryLabel}>Ngày giao</span>
                        </div>
                        <div className={styles.summaryDivider}></div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryValue}>{totalItems}</span>
                            <span className={styles.summaryLabel}>Tổng sản phẩm</span>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className={styles.loadingGrid}>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={styles.skeleton}>
                                <div className={styles.skeletonHeader}></div>
                                <div className={styles.skeletonBody}>
                                    <div className={styles.skeletonLine}></div>
                                    <div className={styles.skeletonLine}></div>
                                    <div className={styles.skeletonLine}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className={styles.error}>
                        <AlertCircle size={48} />
                        <h3>Không thể tải dữ liệu</h3>
                        <p>{error}</p>
                        <button onClick={fetchData} className={styles.retryBtn}>
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && data.length === 0 && (
                    <div className={styles.empty}>
                        <Package size={64} />
                        <h3>Chưa có đơn hàng gom</h3>
                        <p>Dữ liệu gom hàng sẽ hiển thị ở đây</p>
                    </div>
                )}

                {/* Data Grid */}
                {!isLoading && !error && data.length > 0 && (
                    <div className={styles.grid}>
                        {data.map((day, index) => (
                            <DateCard key={`${day.ngayGiaoHang}-${index}`} data={day} />
                        ))}
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}
