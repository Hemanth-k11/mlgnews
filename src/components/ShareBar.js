"use client";

import { useState } from "react";

function openPopup(url) {
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=520");
}

export default function ShareBar({ title }) {
  const [copied, setCopied] = useState(false);

  function share(platform) {
    const url = window.location.href;
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title || "");

    if (platform === "facebook") {
      openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
    } else if (platform === "x") {
      openPopup(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`);
    } else if (platform === "whatsapp") {
      openPopup(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`);
    }
  }

  function copyLink() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  }

  return (
    <div className="share" role="group" aria-label="Share this story">
      <button type="button" title="Share on Facebook" onClick={() => share("facebook")}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.5-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" />
        </svg>
      </button>
      <button type="button" title="Share on X" onClick={() => share("x")}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.9 2H22l-7.6 8.7L23.3 22H16.8l-5.1-6.6L6 22H2.9l8.1-9.3L1.9 2h6.7l4.6 6.1L18.9 2zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20z" />
        </svg>
      </button>
      <button type="button" title="Share on WhatsApp" onClick={() => share("whatsapp")}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.4-1.35a9.85 9.85 0 0 0 4.64 1.18h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.06h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.78.83-3.04-.2-.31a8.15 8.15 0 0 1-1.26-4.34c0-4.51 3.68-8.18 8.25-8.18a8.2 8.2 0 0 1 8.19 8.19c0 4.51-3.68 8.23-8.19 8.23zm4.49-6.13c-.25-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.55.12-.16.25-.63.79-.77.95-.14.16-.28.18-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.38.11-.51.11-.11.25-.28.37-.42.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.42.06-.64.31s-.85.83-.85 2.03.87 2.35.99 2.52c.12.16 1.71 2.6 4.14 3.65.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.15.2-.57.2-1.06.14-1.16-.06-.11-.22-.17-.47-.29z" />
        </svg>
      </button>
      <button type="button" title="Copy link" onClick={copyLink}>
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.07 0l2-2a5 5 0 0 0-7.07-7.07l-1 1" />
            <path d="M14 11a5 5 0 0 0-7.07 0l-2 2a5 5 0 0 0 7.07 7.07l1-1" />
          </svg>
        )}
      </button>
    </div>
  );
}
