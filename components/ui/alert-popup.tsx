import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface AlertPopupProps {
    message: string | null;
    type: "success" | "error";
    onClose: () => void;
    autoClose?: number; // in ms
}

export default function AlertPopup({ message, type, onClose, autoClose = 3000 }: AlertPopupProps) {
    useEffect(() => {
        if (message && autoClose > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, autoClose);
            return () => clearTimeout(timer);
        }
    }, [message, autoClose, onClose]);

    if (!message) return null;

    const isSuccess = type === "success";

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: -50, x: "-50%" }}
                className={`alert-popup fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] min-w-[320px] max-w-md shadow-xl rounded-lg border p-4 ${isSuccess ? "alert-popup-success" : "alert-popup-error"}`}
            >
                <div className="flex items-center gap-3">
                    {isSuccess ? (
                        <svg className="w-5 h-5 alert-popup-icon shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 alert-popup-icon shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                    <p className="font-semibold text-sm alert-popup-text">
                        {message}
                    </p>
                    <button
                        onClick={onClose}
                        className="ml-auto shrink-0 p-1 rounded-md alert-popup-close-btn"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
