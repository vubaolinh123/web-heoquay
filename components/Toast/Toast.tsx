"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CheckCircle, X } from "lucide-react";
import styles from "./Toast.module.css";

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
    const [isShowing, setIsShowing] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleClose = useCallback(() => {
        // Clear any pending timeouts
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Start hide animation
        setIsShowing(false);

        // Call onClose after animation
        closeTimeoutRef.current = setTimeout(() => {
            onClose();
        }, 300);
    }, [onClose]);

    useEffect(() => {
        // Clean up close timeout on unmount
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isVisible) {
            // Show toast
            setIsShowing(true);

            // Clear any existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Auto close after duration
            timeoutRef.current = setTimeout(() => {
                handleClose();
            }, duration);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [isVisible, duration, handleClose]);

    // Don't render if not visible and not showing
    if (!isVisible && !isShowing) return null;

    return (
        <div
            className={`${styles.toast} ${isShowing ? styles.show : styles.hide}`}
            onClick={handleClose}
            role="alert"
        >
            <CheckCircle size={18} className={styles.icon} />
            <span className={styles.message}>{message}</span>
            <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
                <X size={14} />
            </button>
        </div>
    );
}
