import { FiAlertTriangle } from 'react-icons/fi';
import styles from './ConfirmationDialog.module.css';

interface ConfirmationDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmationDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
}: ConfirmationDialogProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.dialogBackdrop}>
            <div className={`${styles.dialogCard} fade-in-up`}>
                <div className={styles.iconContainer}>
                    <FiAlertTriangle size={24} className="text-red-500" />
                </div>
                <div className="text-center">
                    <h3 className={styles.dialogTitle}>{title}</h3>
                    <p className={styles.dialogMessage}>{message}</p>
                </div>
                <div className={styles.buttonGroup}>
                    <button onClick={onCancel} className="btn-secondary">
                        {cancelText}
                    </button>
                    <button onClick={onConfirm} className={styles.confirmButton}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}