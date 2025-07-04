import * as React from "npm:react@19";
import html2canvas from "npm:html2canvas";
import {
    FacebookShareButton,
    TwitterShareButton,
    BlueskyShareButton,
    WhatsappShareButton,
    LinkedinShareButton,
    EmailShareButton,
    FacebookIcon,
    XIcon,
    BlueskyIcon,
    WhatsappIcon,
    LinkedinIcon,
    EmailIcon
} from "react-share";

export function DownloadShareButtons({
                                         targetId,
                                         selectedCountry,
                                         selectedCountryISO3,
                                         selectedSector,
                                         selectedTariff,
                                         isETR
                                     }) {
    const [showShareOptions, setShowShareOptions] = React.useState(false);
    const hideTimeoutRef = React.useRef(null);

    const handleMouseEnter = () => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
        setShowShareOptions(true);
    };

    const handleMouseLeave = () => {
        if (window.matchMedia("(hover: hover)").matches) {
            hideTimeoutRef.current = setTimeout(() => {
                setShowShareOptions(false);
            }, 300); // ⏱ 300ms delay before hiding
        }
    };

    const shareRef = React.useRef(null);

    const isCountryMode = selectedSector === "All sectors";

    const queryParams = new URLSearchParams({
        country: selectedCountryISO3,
        sector: selectedSector,
        ...(isETR
            ? { isETR: "true" }
            : { isETR: "false", tariff: (Math.round(selectedTariff * 1000) / 1000).toString() }),
    });
    const shareUrl = `${window.location.origin}${window.location.pathname}#view?${queryParams.toString()}`;

    const shareTitle =
        isCountryMode
            ? (selectedCountryISO3 === "ALL"
                ? "Check out the cost of US tariffs on Africa:"
                : `Check out the cost of US tariffs on ${selectedCountry}:`)
            : `Check out the cost of US tariffs on Africa's ${selectedSector.toLowerCase()} sector:`;

    // Download logic
    const handleDownload = async () => {
        const element = document.getElementById(targetId);
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                backgroundColor: null,
                useCORS: true,
                logging: true
            });

            const link = document.createElement("a");
            link.download = `${targetId}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (err) {
            console.error("Download failed:", err);
        }
    };

    // Share fallback for mobile
    const handleShare = async () => {
        const element = document.getElementById(targetId);
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                backgroundColor: null,
                useCORS: true,
            });

            const dataUrl = canvas.toDataURL("image/png");
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], `${targetId}.png`, { type: "image/png" });

            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    title: shareTitle,
                    text: "Here’s the visual:",
                    files: [file],
                });
                return;
            }

            setShowShareOptions(prev => !prev); // toggle for touch devices
        } catch (err) {
            console.warn("Image share failed, falling back to link copy.");
            await navigator.clipboard.writeText(shareUrl);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <div className="download-share-buttons">
            <div className="download-button" onClick={handleDownload}>
                <p className="text-support-small">Download</p>
                <DownloadIcon className="ds-icon" />
            </div>

            <div
                className="share-button"
                ref={shareRef}
                onClick={handleShare}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <p className="text-support-small">Share</p>
                <ShareIcon className="ds-icon" />

                {/* Tooltip bubble */}
                {showShareOptions && (
                    <div
                        className="share-options-tooltip"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <FacebookShareButton url={shareUrl} quote={shareTitle}>
                            <FacebookIcon size={28} round />
                        </FacebookShareButton>
                        <TwitterShareButton url={shareUrl} title={shareTitle}>
                            <XIcon size={28} round />
                        </TwitterShareButton>
                        <BlueskyShareButton url={shareUrl} title={shareTitle}>
                            <BlueskyIcon size={28} round />
                        </BlueskyShareButton>
                        <LinkedinShareButton url={shareUrl} title={shareTitle}>
                            <LinkedinIcon size={28} round />
                        </LinkedinShareButton>
                        <WhatsappShareButton url={shareUrl} title={shareTitle}>
                            <WhatsappIcon size={28} round />
                        </WhatsappShareButton>
                        <EmailShareButton url={shareUrl} subject={"ONE's Tariff Turbulence Simulator"} body={shareTitle}>
                            <EmailIcon size={28} round />
                        </EmailShareButton>
                        <button
                            className="copy-link-button"
                            onClick={async () => {
                                await navigator.clipboard.writeText(shareUrl);
                                alert("Link copied to clipboard!");
                            }}
                            title="Copy link"
                        >
                            <LinkIcon />
                        </button>
                    </div>
                )}
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

function LinkIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
        >
            <path d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" />
        </svg>
    );
}

