import { useState, useEffect } from 'react';
import { FiBell, FiBellOff } from 'react-icons/fi';
import styles from './ReminderManager.module.css';

export function ReminderManager() {
    const [permission, setPermission] = useState(Notification.permission);

    useEffect(() => {
        // This effect can be used to update status if it changes in browser settings
        // For now, it just sets the initial state
    }, []);

    const handleRequestPermission = async () => {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
            return;
        }

        const currentPermission = await Notification.requestPermission();
        setPermission(currentPermission);
    };

    const renderStatus = () => {
        switch (permission) {
            case 'granted':
                return (
                    <div className={styles.statusContainer}>
                        <FiBell className="text-green-500" />
                        <span className={styles.statusText}>Reminders are enabled.</span>
                    </div>
                );
            case 'denied':
                return (
                    <div className={styles.statusContainer}>
                        <FiBellOff className="text-red-500" />
                        <span className={styles.statusText}>Reminders are blocked.</span>
                    </div>
                );
            default: // 'default' means the user hasn't chosen yet
                return (
                    <button onClick={handleRequestPermission} className="btn-secondary">
                        Enable Reminders
                    </button>
                );
        }
    };

    return (
        <div className="widget-card">
            <h2 className="widget-title">Notifications</h2>
            {renderStatus()}
        </div>
    );
}