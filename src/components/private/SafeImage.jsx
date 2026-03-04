import React, { useState, useEffect, useRef, memo } from 'react';

/**
 * SafeImage — Renders images through Canvas to strip ALL metadata.
 *
 * When iOS Safari long-presses an <img src="data:..."> it can extract the raw
 * JPEG's EXIF metadata (GPS, camera, original file size). This component
 * re-renders the image through <canvas> and converts it to a clean Blob URL
 * that contains ZERO metadata.
 *
 * Flow: data URL → Image → Canvas → Blob URL (EXIF-free)
 */
const SafeImage = memo(({ src, alt, className, style }) => {
    const [safeSrc, setSafeSrc] = useState(null);
    const blobUrlRef = useRef(null);

    useEffect(() => {
        if (!src) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    if (blob) {
                        // Revoke previous blob URL if any
                        if (blobUrlRef.current) {
                            URL.revokeObjectURL(blobUrlRef.current);
                        }
                        const url = URL.createObjectURL(blob);
                        blobUrlRef.current = url;
                        setSafeSrc(url);
                    } else {
                        // Fallback if toBlob fails
                        setSafeSrc(src);
                    }
                    // Free canvas memory
                    canvas.width = 0;
                    canvas.height = 0;
                }, 'image/jpeg', 0.92);
            } catch {
                setSafeSrc(src);
            }
        };

        img.onerror = () => {
            setSafeSrc(src);
        };

        img.src = src;

        return () => {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, [src]);

    if (!safeSrc) {
        // Show placeholder while processing
        return (
            <div
                className={className}
                style={{
                    ...style,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 100,
                    minWidth: 100,
                    background: 'rgba(0,0,0,0.05)'
                }}
            >
                <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)' }}>Loading...</span>
            </div>
        );
    }

    return (
        <img
            src={safeSrc}
            alt={alt || 'Shared'}
            className={className}
            style={style}
            draggable={false}
        />
    );
});

SafeImage.displayName = 'SafeImage';

export default SafeImage;
