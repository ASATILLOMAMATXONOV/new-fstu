import React, { useState } from 'react';

import '../../assets/styles/AnnouncementImage.css';

export default function AnnouncementImage({ src, alt, priority = false, naturalSize = false }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const hasImage = Boolean(src) && failedSrc !== src;
  const loading = priority ? 'eager' : 'lazy';

  return (
    <div className={`announcement-media${naturalSize ? ' announcement-media--natural' : ''}`}>
      {hasImage ? (
        <>
          {!naturalSize && (
            <img
              className="announcement-media__backdrop"
              src={src}
              alt=""
              aria-hidden="true"
              loading={loading}
              decoding="async"
            />
          )}
          <img
            className="announcement-media__image"
            src={src}
            alt={alt}
            loading={loading}
            decoding="async"
            onError={() => setFailedSrc(src)}
          />
        </>
      ) : (
        <div className="announcement-media__placeholder">
          <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <rect x="8" y="12" width="48" height="40" rx="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="23" cy="25" r="5" stroke="currentColor" strokeWidth="2" />
            <path d="m10 46 14-13 11 10 9-9 10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}
