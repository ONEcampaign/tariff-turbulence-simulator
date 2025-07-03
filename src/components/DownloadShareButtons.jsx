import * as React from "npm:react";
import html2canvas from "npm:html2canvas";

export function DownloadShareButtons({ targetId }) {
    const handleDownload = async () => {
        const element = document.getElementById(targetId);
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                backgroundColor: null,
                useCORS: true, // ⬅️ this is crucial
                logging: true  // optional, for dev
            });

            const link = document.createElement("a");
            link.download = `${targetId}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (err) {
            console.error("Download failed:", err);
        }
    };

    const handleShare = async () => {
        const url = window.location.href + `#${targetId}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Trade Impact Card",
                    text: "Check out this country’s tariff impact",
                    url,
                });
            } catch (err) {
                console.error("Share failed:", err);
            }
        } else {
            await navigator.clipboard.writeText(url);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <div className="download-share-buttons">
            <div className="download-button" onClick={handleDownload}>
                <p className="text-support-small">Download</p>
                <DownloadIcon className="ds-icon" />
            </div>
            <div className="share-button" onClick={handleShare}>
                <p className="text-support-small">Share</p>
                <ShareIcon className="ds-icon" />
            </div>
        </div>
    );
}

function DownloadIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18" fill="none">
            <rect x="64" y="64" width="384" height="384" rx="48" fill="black" />
            <rect x="96" y="96" width="320" height="320" rx="24" fill="white" />
            <rect x="144" y="208" width="48" height="160" fill="black" />
            <rect x="232" y="160" width="48" height="208" fill="black" />
            <rect x="320" y="256" width="48" height="112" fill="black" />
        </svg>
    )
}

function ShareIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="125 80 360 360" width="20" height="18" fill="none">
            <circle cx="180" cy="250" r="45" fill="black" />
            <circle cx="350" cy="140" r="45" fill="black" />
            <circle cx="350" cy="360" r="45" fill="black" />
            <line x1="180" y1="250" x2="350" y2="140" stroke="black" stroke-width="25" />
            <line x1="180" y1="250" x2="350" y2="360" stroke="black" stroke-width="25" />
        </svg>
    )
}

