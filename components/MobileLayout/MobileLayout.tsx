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
} from "lucide-react";
import { useAuth } from "@/contexts";
import styles from "./MobileLayout.module.css";

export type FilterStatus = "all" | "pending" | "delivered";

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
        delivered: number;
    };
    selectedDate?: string;
    onDateChange?: (date: string) => void;
    selectedBranch?: string;
    onBranchChange?: (branch: string) => void;
    // Dynamic filter options from API data
    dateOptions?: FilterOption[];
    branchOptions?: FilterOption[];
    // Clear all dropdown filters
    onClearFilters?: () => void;
}

const navItems = [
    { href: "/", label: "Đơn hàng", icon: ClipboardList },
    { href: "/lich", label: "Lịch", icon: Calendar },
    { href: "/gom-hang", label: "Gom hàng", icon: Package },
    { href: "/kho", label: "Kho", icon: Warehouse },
];

const filterTabs: { id: FilterStatus; label: string }[] = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Chưa giao" },
    { id: "delivered", label: "Đã giao" },
];

// Default options when no data provided
const defaultDateOptions: FilterOption[] = [
    { value: "", label: "Ngày giao hàng" },
];

const defaultBranchOptions: FilterOption[] = [
    { value: "", label: "Chi nhánh" },
];

export default function MobileLayout({
    children,
    activeFilter = "all",
    onFilterChange,
    searchQuery = "",
    onSearchChange,
    orderCounts = { all: 0, pending: 0, delivered: 0 },
    selectedDate = "",
    onDateChange,
    selectedBranch = "",
    onBranchChange,
    dateOptions = defaultDateOptions,
    branchOptions = defaultBranchOptions,
    onClearFilters,
}: MobileLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, user, logout } = useAuth();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

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
        return orderCounts[tabId];
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className={styles.layout}>
            {/* Sidebar for Desktop */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarLogo}>
                    <img
                        src="/logo.png"
                        alt="Ngọc Hải"
                        className={styles.sidebarLogoImg}
                    />
                    <span className={styles.sidebarLogoText}>Ngọc Hải</span>
                </div>
                <nav className={styles.sidebarNav}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.sidebarNavItem} ${isActive ? styles.sidebarNavItemActive : ""
                                    }`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
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
                            <button className={styles.iconButton} aria-label="Làm mới">
                                <RefreshCw size={20} />
                            </button>

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

                            {/* Clear Filters Button - only show when filters active */}
                            {(selectedDate || selectedBranch) && (
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
