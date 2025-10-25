import { useState, useCallback } from 'react';

export interface DialogOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

export const useConfirmationDialog = () => {
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        options: DialogOptions | null;
        resolvePromise: ((confirmed: boolean) => void) | null;
    }>({
        isOpen: false,
        options: null,
        resolvePromise: null,
    });

    const confirm = useCallback((options: DialogOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialogState({
                isOpen: true,
                options,
                resolvePromise: resolve,
            });
        });
    }, []);

    const handleConfirm = () => {
        if (dialogState.resolvePromise) {
            dialogState.resolvePromise(true);
        }
        setDialogState({ isOpen: false, options: null, resolvePromise: null });
    };

    const handleCancel = () => {
        if (dialogState.resolvePromise) {
            dialogState.resolvePromise(false);
        }
        setDialogState({ isOpen: false, options: null, resolvePromise: null });
    };

    return {
        confirm,
        dialogState,
        handleConfirm,
        handleCancel,
    };
};