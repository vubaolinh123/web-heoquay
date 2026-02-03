"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    ClipboardList,
    Calendar,
    Package,
    Warehouse,
    Search,
    RefreshCw,
    X,
    ChevronDown,
    LogIn,
    LogOut,
    User,
    PanelLeftClose,
    PanelLeft,
} from "lucide-react";
import { useAuth } from "@/contexts";
import styles from "./MobileLayout.module.css";

export type FilterStatus = "all" | "Chưa giao" | "Đang quay" | "Đang giao" | "Đã giao" | "Đã chuyển khoản" | "Đã hủy" | "Công nợ" | "Hoàn thành";

export interface FilterOption {
    value: string;
    label: string;
}

interface MobileLayoutProps {
    children: ReactNode;
    activeFilter?: FilterStatus;
    onFilterChange?: (filter: FilterStatus) => void;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    orderCounts?: {
        all: number;
        pending: number;
        roasting: number;
        inProgress: number;
        delivered: number;
        transferred: number;
        cancelled: number;
        debt: number;
        completed: number;
    };
    selectedDate?: string;
    onDateChange?: (date: string) => void;
    selectedBranch?: string;
    onBranchChange?: (branch: string) => void;
    selectedDeliveryMethod?: string;
    onDeliveryMethodChange?: (method: string) => void;
    // Dynamic filter options from API data
    dateOptions?: FilterOption[];
    branchOptions?: FilterOption[];
    deliveryMethodOptions?: FilterOption[];
    onClearFilters?: () => void;
    // Shipper filter
    selectedShipper?: string;
    onShipperChange?: (shipper: string) => void;
    shipperOptions?: FilterOption[];
    // Refresh callback for page-specific refresh
    onRefresh?: () => Promise<void> | void;
    // Countdown seconds until next auto-refresh
    refreshCountdown?: number;
}

const navItems = [
    { href: "/", label: "Đơn hàng", icon: ClipboardList },
    { href: "/lich", label: "Lịch", icon: Calendar },
    { href: "/gom-hang", label: "Gom hàng", icon: Package },
    { href: "/kho", label: "Kho", icon: Warehouse },
];

const filterTabs: { id: FilterStatus; label: string }[] = [
    { id: "all", label: "Tất cả" },
    { id: "Chưa giao", label: "Chưa giao" },
    { id: "Đang quay", label: "Đang quay" },
    { id: "Đang giao", label: "Đang giao" },
    { id: "Đã giao", label: "Đã giao" },
    { id: "Đã chuyển khoản", label: "Đã CK" },
    { id: "Công nợ", label: "Công nợ" },
    { id: "Hoàn thành", label: "Hoàn thành" },
    { id: "Đã hủy", label: "Đã hủy" },
];

// Default options when no data provided
const defaultDateOptions: FilterOption[] = [
    { value: "", label: "Ngày giao hàng" },
];

const defaultBranchOptions: FilterOption[] = [
    { value: "", label: "Chi nhánh" },
];

const defaultDeliveryMethodOptions: FilterOption[] = [
    { value: "", label: "Hình thức giao" },
];

const defaultShipperOptions: FilterOption[] = [
    { value: "", label: "Shipper" },
];

export default function MobileLayout({
    children,
    activeFilter = "all",
    onFilterChange,
    searchQuery = "",
    onSearchChange,
    orderCounts = { all: 0, pending: 0, roasting: 0, inProgress: 0, delivered: 0, transferred: 0, cancelled: 0, debt: 0, completed: 0 },
    selectedDate = "",
    onDateChange,
    selectedBranch = "",
    onBranchChange,
    dateOptions = defaultDateOptions,
    branchOptions = defaultBranchOptions,
    deliveryMethodOptions = defaultDeliveryMethodOptions,
    selectedDeliveryMethod = "",
    onDeliveryMethodChange,
    onClearFilters,
    selectedShipper = "",
    onShipperChange,
    shipperOptions = defaultShipperOptions,
    onRefresh,
    refreshCountdown,
}: MobileLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, user, logout } = useAuth();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const handleRefresh = async () => {
        if (isRefreshing || !onRefresh) return;
        setIsRefreshing(true);
        try {
            await onRefresh();
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleFilterClick = (filter: FilterStatus) => {
        onFilterChange?.(filter);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        if (isSearchOpen) {
            onSearchChange?.("");
        }
    };

    const getTabCount = (tabId: FilterStatus) => {
        switch (tabId) {
            case "all": return orderCounts.all;
            case "Chưa giao": return orderCounts.pending;
            case "Đang quay": return orderCounts.roasting;
            case "Đang giao": return orderCounts.inProgress;
            case "Đã giao": return orderCounts.delivered;
            case "Đã chuyển khoản": return orderCounts.transferred;
            case "Đã hủy": return orderCounts.cancelled;
            case "Công nợ": return orderCounts.debt;
            case "Hoàn thành": return orderCounts.completed;
            default: return 0;
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className={styles.layout}>
            {/* Sidebar for Desktop */}
            <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ""}`}>
                <nav className={styles.sidebarNav}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.sidebarNavItem} ${isActive ? styles.sidebarNavItemActive : ""}`}
                                title={item.label}
                            >
                                <span className={styles.navIcon}>
                                    <Icon size={20} />
                                </span>
                                <span className={styles.navLabel}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Toggle Button at Bottom */}
                <button
                    className={styles.collapseBtn}
                    onClick={toggleSidebar}
                    title={isSidebarCollapsed ? "Mở rộng" : "Thu gọn"}
                >
                    {isSidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
                    <span className={styles.navLabel}>{isSidebarCollapsed ? "" : "Thu gọn"}</span>
                </button>
            </aside>

            {/* Content Wrapper */}
            <div className={styles.contentWrapper}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerTop}>
                        <img src="/logo.png" alt="Ngọc Hải" className={styles.logo} />
                        <h1 className={styles.headerTitle}>Đơn hàng</h1>

                        {/* Search Bar - Desktop always visible */}
                        <form
                            className={`${styles.searchContainer} ${isSearchOpen ? styles.searchOpen : ""
                                }`}
                            onSubmit={handleSearchSubmit}
                        >
                            <Search size={18} className={styles.searchIcon} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Tìm theo tên, SĐT..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange?.(e.target.value)}
                            />
                        </form>

                        <div className={styles.headerActions}>
                            {/* Mobile search toggle */}
                            <button
                                className={styles.iconButton}
                                aria-label={isSearchOpen ? "Đóng tìm kiếm" : "Tìm kiếm"}
                                onClick={toggleSearch}
                            >
                                {isSearchOpen ? <X size={20} /> : <Search size={20} />}
                            </button>
                            {/* Refresh button with countdown */}
                            <div className={styles.refreshContainer}>
                                {refreshCountdown !== undefined && refreshCountdown > 0 && (
                                    <span className={styles.refreshCountdown}>
                                        {Math.floor(refreshCountdown / 60)}:{(refreshCountdown % 60).toString().padStart(2, "0")}
                                    </span>
                                )}
                                <button
                                    className={`${styles.iconButton} ${isRefreshing ? styles.iconButtonSpinning : ""}`}
                                    aria-label="Làm mới"
                                    onClick={handleRefresh}
                                    disabled={isRefreshing || !onRefresh}
                                    title={refreshCountdown ? `Tự động làm mới sau ${Math.floor(refreshCountdown / 60)}:${(refreshCountdown % 60).toString().padStart(2, "0")}` : "Làm mới"}
                                >
                                    <RefreshCw size={20} />
                                </button>
                            </div>

                            {/* Auth Button */}
                            {isAuthenticated ? (
                                <button
                                    className={styles.authButton}
                                    onClick={handleLogout}
                                    title={`Đăng xuất (${user?.userName})`}
                                >
                                    <LogOut size={18} />
                                    <span className={styles.authButtonText}>Đăng xuất</span>
                                </button>
                            ) : (
                                <Link href="/login" className={styles.authButton}>
                                    <LogIn size={18} />
                                    <span className={styles.authButtonText}>Đăng nhập</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Search - Expandable */}
                    {isSearchOpen && (
                        <div className={styles.mobileSearchRow}>
                            <form
                                className={styles.mobileSearchForm}
                                onSubmit={handleSearchSubmit}
                            >
                                <Search size={18} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="Tìm theo tên, SĐT..."
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange?.(e.target.value)}
                                    autoFocus
                                />
                            </form>
                        </div>
                    )}

                    {/* Filter Row */}
                    <div className={styles.filterRow}>
                        {/* Status Filter Tabs */}
                        <nav className={styles.navTabs}>
                            {filterTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`${styles.navTab} ${activeFilter === tab.id ? styles.navTabActive : ""
                                        }`}
                                    onClick={() => handleFilterClick(tab.id)}
                                >
                                    {tab.label}
                                    <span className={styles.tabCount}>{getTabCount(tab.id)}</span>
                                </button>
                            ))}
                        </nav>

                        {/* Dropdown Filters */}
                        <div className={styles.dropdownFilters}>
                            <div className={styles.dropdown}>
                                <select
                                    className={`${styles.dropdownSelect} ${selectedDate ? styles.dropdownActive : ""}`}
                                    value={selectedDate}
                                    onChange={(e) => onDateChange?.(e.target.value)}
                                >
                                    {dateOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className={styles.dropdownIcon} />
                            </div>

                            <div className={styles.dropdown}>
                                <select
                                    className={`${styles.dropdownSelect} ${selectedBranch ? styles.dropdownActive : ""}`}
                                    value={selectedBranch}
                                    onChange={(e) => onBranchChange?.(e.target.value)}
                                >
                                    {branchOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className={styles.dropdownIcon} />
                            </div>

                            <div className={styles.dropdown}>
                                <select
                                    className={`${styles.dropdownSelect} ${selectedShipper ? styles.dropdownActive : ""}`}
                                    value={selectedShipper}
                                    onChange={(e) => onShipperChange?.(e.target.value)}
                                >
                                    {shipperOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className={styles.dropdownIcon} />
                            </div>

                            <div className={styles.dropdown}>
                                <select
                                    className={`${styles.dropdownSelect} ${selectedDeliveryMethod ? styles.dropdownActive : ""}`}
                                    value={selectedDeliveryMethod}
                                    onChange={(e) => onDeliveryMethodChange?.(e.target.value)}
                                >
                                    {deliveryMethodOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className={styles.dropdownIcon} />
                            </div>

                            {/* Clear Filters Button - only show when filters active */}
                            {(selectedDate || selectedBranch || selectedShipper || selectedDeliveryMethod) && (
                                <button
                                    className={styles.clearFiltersButton}
                                    onClick={onClearFilters}
                                    title="Xóa bộ lọc"
                                >
                                    <X size={16} />
                                    <span className={styles.clearFiltersText}>Xóa lọc</span>
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className={styles.main}>{children}</main>
            </div>

            {/* Bottom Navigation - Mobile/Tablet only */}
            <nav className={styles.bottomNav}>
                <ul className={styles.bottomNavList}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ""
                                        }`}
                                >
                                    <Icon size={24} className={styles.bottomNavIcon} />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}
