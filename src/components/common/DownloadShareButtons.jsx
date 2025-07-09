import * as React from "npm:react";
import html2canvas from "npm:html2canvas";
import {DownloadIcon} from "../svgs/DownloadIcon.js";
import {ShareIcon} from "../svgs/ShareIcon.js";
import {LinkIcon} from "../svgs/LinkIcon.js";
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

export function DownloadShareButtons({ targetId }) {

    const [showShareOptions, setShowShareOptions] = React.useState(false);
    const hideTimeoutRef = React.useRef(null);
    const shareRef = React.useRef(null);

    const shareUrl = "https://data.one.org/analysis/tariff-turbulence-simulator";
    const shareTitle = "Check out the cost of US tariffs on Africa:";

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
            }, 200);
        }
    };

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

    const handleShare = async () => {
        const element = document.getElementById(targetId);
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                backgroundColor: null,
                useCORS: true
            });

            const dataUrl = canvas.toDataURL("image/png");
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], `${targetId}.png`, { type: "image/png" });

            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    title: shareTitle,
                    files: [file]
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

