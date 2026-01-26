"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts";
import { Eye, EyeOff, LogIn, User, Lock } from "lucide-react";
import styles from "./page.module.css";

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect if already logged in
    if (!authLoading && isAuthenticated) {
        router.push("/");
        return null;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const result = await login(userName, password);

        if (result.success) {
            router.push("/");
        } else {
            setError(result.error || "Đăng nhập thất bại");
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Animated Background */}
            <div className={styles.bgPattern}></div>
            <div className={styles.bgGlow}></div>

            {/* Login Card */}
            <div className={styles.loginCard}>
                {/* Header with Logo */}
                <div className={styles.cardHeader}>
                    <div className={styles.logoWrapper}>
                        <img
                            src="/logo.png"
                            alt="Ngọc Hải"
                            className={styles.logo}
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                        <div className={styles.logoFallback}>🐷</div>
                    </div>
                    <h1 className={styles.brandName}>Heo Quay Ngọc Hải</h1>
                    <p className={styles.brandSlogan}>Hệ thống quản lý đơn hàng</p>
                </div>

                {/* Login Form */}
                <form className={styles.form} onSubmit={handleSubmit}>
                    <h2 className={styles.formTitle}>
                        <LogIn size={20} />
                        Đăng nhập
                    </h2>

                    {error && (
                        <div className={styles.errorAlert}>
                            <span className={styles.errorIcon}>⚠️</span>
                            {error}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="userName" className={styles.label}>
                            <User size={14} />
                            Tên đăng nhập
                        </label>
                        <div className={styles.inputWrapper}>
                            <input
                                id="userName"
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className={styles.input}
                                placeholder="Nhập tên đăng nhập"
                                required
                                disabled={isLoading}
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            <Lock size={14} />
                            Mật khẩu
                        </label>
                        <div className={styles.inputWrapper}>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                placeholder="Nhập mật khẩu"
                                required
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading || !userName || !password}
                    >
                        {isLoading ? (
                            <>
                                <span className={styles.btnSpinner}></span>
                                Đang đăng nhập...
                            </>
                        ) : (
                            <>
                                <LogIn size={18} />
                                Đăng nhập
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className={styles.cardFooter}>
                    <p>© 2026 Heo Quay Ngọc Hải - Đà Nẵng</p>
                </div>
            </div>
        </div>
    );
}
