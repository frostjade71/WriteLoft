"use client";

import { useEffect, useState } from "react";
import "./ThemeToggle.css";

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check initial theme from html tag
        const isDarkMode = document.documentElement.classList.contains("dark");
        setIsDark(isDarkMode);
    }, []);

    const toggleTheme = () => {
        const nextTheme = !isDark;
        setIsDark(nextTheme);
        if (nextTheme) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    // Prevent hydration mismatch by not rendering the toggle until mounted
    // or rendering it in a disabled state
    if (!mounted) {
        return <div className="theme-switch-wrapper opacity-0" aria-hidden="true">
            <input type="checkbox" className="theme-checkbox" checked={false} readOnly />
        </div>;
    }

    return (
        <div className="theme-switch-wrapper flex items-center">
            <input
                type="checkbox"
                className="theme-checkbox"
                checked={isDark}
                onChange={toggleTheme}
                aria-label="Toggle theme"
            />
        </div>
    );
}
