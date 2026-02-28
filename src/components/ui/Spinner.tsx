interface SpinnerProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <div
                className={`rounded-full border-primary/20 animate-spin ${sizeClasses[size]}`}
                style={{
                    borderTopColor: "var(--color-primary, #000)",
                }}
            />
        </div>
    );
}

export function GlowingSpinner({ size = "md", className = "" }: SpinnerProps) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Glow effect */}
            <div
                className={`absolute rounded-full bg-primary/20 blur-xl animate-pulse ${sizeClasses[size]}`}
            />

            {/* Spinner */}
            <div
                className={`relative rounded-full border-primary/20 animate-spin ${sizeClasses[size]}`}
                style={{
                    borderTopColor: "var(--color-primary, #000)",
                }}
            />
        </div>
    );
}
