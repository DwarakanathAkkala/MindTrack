import { FiCheckCircle } from 'react-icons/fi';
import styles from './Toast.module.css';

interface ToastProps {
    message: string;
    show: boolean;
}

export function Toast({ message, show }: ToastProps) {
    if (!show) {
        return null;
    }

    return (
        <div className={styles.toastContainer}>
            <div className={styles.toastContent}>
                <FiCheckCircle size={20} className="text-green-500" />
                <p>{message}</p>
            </div>
        </div>
    );
}