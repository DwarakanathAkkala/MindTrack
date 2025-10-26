import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { Toast } from '../components/ui/Toast';

interface ToastContextType {
    showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toast, setToast] = useState<{ message: string; isVisible: boolean }>({
        message: '',
        isVisible: false,
    });

    const showToast = (message: string) => {
        setToast({ message, isVisible: true });
        setTimeout(() => {
            setToast({ message: '', isVisible: false });
        }, 3000); // Hides after 3 seconds
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Toast message={toast.message} show={toast.isVisible} />
        </ToastContext.Provider>
    );
};