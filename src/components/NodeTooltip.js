import React from 'react';
import { NodeIcon } from '../nodeStyles';

export { NodeIcon };

// --- Propriétés internes à masquer ---
const INTERNAL_KEYS = new Set([
    'vx', 'vy', 'index', 'fx', 'fy', 'x', 'y',
    'image', 'imgX', 'imgY', 'width', 'height',
    'type', 'id', 'borderPoints', 'metaCharacterName'
]);

// --- Parse borderPoints string "x1,y1 x2,y2 ..." -> bounding box ---
const getBoundingBoxFromBorderPoints = (borderPoints) => {
    if (!borderPoints) return null;
    const pts = borderPoints.split(' ').map(p => p.split(',').map(Number)).filter(p => p.length === 2 && !p.some(isNaN));
    if (pts.length === 0) return null;
    const xs = pts.map(p => p[0]);
    const ys = pts.map(p => p[1]);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
};

// --- Image cropée ---
const getTooltipImageStyle = (node, images) => {
    let cropX = node.imgX !== undefined ? node.imgX : undefined;
    let cropY = node.imgY !== undefined ? node.imgY : undefined;
    let cropWidth = node.width;
    let cropHeight = node.height;

    if ((cropX === undefined || cropY === undefined || cropWidth === undefined || cropHeight === undefined) && node.borderPoints) {
        const bb = getBoundingBoxFromBorderPoints(node.borderPoints);
        if (bb) {
            if (cropX === undefined) cropX = bb.x;
            if (cropY === undefined) cropY = bb.y;
            if (cropWidth === undefined) cropWidth = bb.width;
            if (cropHeight === undefined) cropHeight = bb.height;
        }
    }

    if (!node.image || cropX === undefined || cropY === undefined || cropWidth === undefined || cropHeight === undefined) {
        return null;
    }

    let imageUrl = null;
    const imgEntry = images.find(img => img.name === node.image);
    if (imgEntry) {
        imageUrl = imgEntry.url || (imgEntry instanceof File ? URL.createObjectURL(imgEntry) : null);
    }
    if (!imageUrl) return null;

    const maxWidth = 250;
    const maxHeight = 150;
    const scale = Math.min(maxWidth / cropWidth, maxHeight / cropHeight, 1);

    return { url: imageUrl, scale, originalWidth: cropWidth, originalHeight: cropHeight, x: cropX, y: cropY };
};

// --- Composant principal ---
const NodeTooltip = ({ tooltip, images }) => {
    if (!tooltip) return null;

    const { data } = tooltip;
    const crop = getTooltipImageStyle(data, images);
    const ontologyEntries = Object.entries(data).filter(([key]) => !INTERNAL_KEYS.has(key));

    return (
        <div style={{
            position: 'fixed',
            left: tooltip.x + 20,
            top: tooltip.y + 20,
            background: 'rgba(255, 255, 255, 0.97)',
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            padding: '12px 14px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 4px 10px -3px rgba(0,0,0,0.1)',
            zIndex: 9999,
            minWidth: '200px',
            maxWidth: '300px',
            maxHeight: '420px',
            overflowY: 'auto',
            fontSize: '12px',
            pointerEvents: 'none',
        }}>
            {crop && (
                <div style={{
                    width: crop.originalWidth * crop.scale,
                    height: crop.originalHeight * crop.scale,
                    overflow: 'hidden',
                    backgroundColor: '#eee',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    margin: '0 auto 10px auto',
                }}>
                    <div style={{
                        backgroundImage: `url(${crop.url})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: `-${crop.x}px -${crop.y}px`,
                        width: crop.originalWidth,
                        height: crop.originalHeight,
                        transform: `scale(${crop.scale})`,
                        transformOrigin: 'top left',
                    }} />
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px' }}>
                <NodeIcon type={data.type} size={16} />
                <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.08em', color: '#111827', textTransform: 'uppercase' }}>
                    {data.type}
                </span>
            </div>

            {data.metaCharacterName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px', paddingLeft: '23px' }}>
                    <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600' }}>isCharacter</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#9B59B6' }}>{data.metaCharacterName}</span>
                </div>
            )}

            <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '10px', paddingLeft: '23px', fontFamily: 'monospace' }}>
                {data.id}
            </div>

            {ontologyEntries.length > 0 && (
                <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: '8px' }} />
            )}

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {ontologyEntries.map(([key, value]) => (
                    <li key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '4px', alignItems: 'flex-start' }}>
                        <span style={{ color: '#6b7280', fontWeight: '600', textTransform: 'capitalize', whiteSpace: 'nowrap', fontSize: '11px' }}>
                            {key.replace(/_/g, ' ')}
                        </span>
                        <span style={{ color: '#1f2937', fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all', textAlign: 'right' }}>
                            {typeof value === 'string' ? `"${value}"` : typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NodeTooltip;