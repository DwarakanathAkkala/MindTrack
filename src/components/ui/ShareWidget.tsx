import { FiShare2, FiCopy } from 'react-icons/fi';
import { useState } from 'react';

interface ShareWidgetProps {
    userId: string;
}

export function ShareWidget({ userId }: ShareWidgetProps) {
    const [copied, setCopied] = useState(false);
    const shareUrl = `${window.location.origin}/share/${userId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="widget-card">
            <div className="flex justify-between items-center">
                <h2 className="widget-title">Share Progress</h2>
                <button onClick={handleCopy} className="btn-secondary !w-auto !text-sm flex items-center gap-2">
                    {copied ? <FiCopy /> : <FiShare2 />}
                    {copied ? 'Copied!' : 'Share'}
                </button>
            </div>
        </div>
    );
}