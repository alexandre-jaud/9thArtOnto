import React from 'react';

// ─── Source de vérité unique pour les styles de noeuds ───────────────────────
//   shape    : 'rect' | 'circle' | 'diamond' | 'triangle' | 'tail'
//   color    : couleur de remplissage principale (utilisée dans D3 et les icônes)
//   stroke   : couleur de contour
//   d3Size   : demi-côté (rect), rayon (circle), demi-diagonale (diamond)
//   d3Points : points SVG exacts pour les polygones spéciaux (tail, triangle)
// ─────────────────────────────────────────────────────────────────────────────
export const NODE_STYLES = {
    // ── Couche visuelle ──────────────────────────────────────────────────────
    panel:            { shape: 'rect',    color: '#ffffff', stroke: '#000000', d3Size: 20 },
    level:            { shape: 'rect',    color: '#ff6600', stroke: '#000000', d3Size: 20 },
    caption:          { shape: 'rect',    color: '#ffadf2', stroke: '#000000', d3Size: 20 },

    // ── Contenu (cercles) ────────────────────────────────────────────────────
    balloon:          { shape: 'circle',  color: '#90D5FF', stroke: '#000000', d3Size: 20 },
    object:           { shape: 'circle',  color: '#FFBF00', stroke: '#000000', d3Size: 20 },
    onomatopoeia:     { shape: 'circle',  color: '#296a2b', stroke: '#000000', d3Size: 20 },
    extra:            { shape: 'circle',  color: '#6adcea', stroke: '#000000', d3Size: 20 },
    textline:         { shape: 'circle',  color: '#808080', stroke: '#000000', d3Size: 20 },
    textspan:         { shape: 'circle',  color: '#D3D3D3', stroke: '#A0A0A0', d3Size: 18 },

    // ── Queue de bulle ───────────────────────────────────────────────────────
    tail:             { shape: 'tail',    color: '#4682B4', stroke: '#000000', d3Points: '0,18 -15,-12 15,-12' },

    // ── Personnages ──────────────────────────────────────────────────────────
    character:        { shape: 'circle',  color: '#FF0000', stroke: '#000000', d3Size: 20 },
    metaCharacter:    { shape: 'circle',  color: '#FF00FF', stroke: '#000000', d3Size: 20 },
    metaObject:       { shape: 'circle',  color: '#FFFE00', stroke: '#000000', d3Size: 20 },

    // ── Structure (diamants) ─────────────────────────────────────────────────
    plate:            { shape: 'diamond', color: '#FF6347', stroke: '#000000', d3Size: 33 },
    book:             { shape: 'diamond', color: '#4169E1', stroke: '#000000', d3Size: 33 },

    // ── Narration (diamants, tailles croissantes) ────────────────────────────
    segment:          { shape: 'diamond', color: '#C76BFF', stroke: '#000000', d3Size: 24 },
    scene:            { shape: 'diamond', color: '#9B30FF', stroke: '#000000', d3Size: 28 },
    eventSegment:     { shape: 'diamond', color: '#F1C40F', stroke: '#000000', d3Size: 33 },
    event:            { shape: 'diamond', color: '#6A0DAD', stroke: '#000000', d3Size: 33 },
    arc:              { shape: 'diamond', color: '#3D006E', stroke: '#C76BFF', d3Size: 38 },
    story:            { shape: 'diamond', color: '#1A0040', stroke: '#9B30FF', d3Size: 44 },
    macroEvent:       { shape: 'diamond', color: '#9B59B6', stroke: '#000000', d3Size: 33 },

    // ── Relations & temps ────────────────────────────────────────────────────
    interaction:      { shape: 'triangle', color: '#FF8C00', stroke: '#000000', d3Points: '0,-30 26,15 -26,15' },
    temporalLink:     { shape: 'diamond',  color: '#FF8C00', stroke: '#000000', d3Size: 28 },

    // ── Lieu ─────────────────────────────────────────────────────────────────
    narrativeLocation:{ shape: 'diamond', color: '#2E8B57', stroke: '#000000', d3Size: 26 },
    sceneSetting:     { shape: 'diamond', color: '#90EE90', stroke: '#000000', d3Size: 22 },

    // ── Fallback ─────────────────────────────────────────────────────────────
    default:          { shape: 'circle',  color: '#cccccc', stroke: '#000000', d3Size: 20 },
};

// Style sélection (pour BookPanel / Infobox)
export const SELECTED_STYLE   = { stroke: '#39FF14', fill: 'rgba(57, 255, 20, 0.25)' };
export const HIGHLIGHT_STYLE  = { stroke: 'yellow',  fill: 'rgba(255, 255, 0, 0.2)'  };

// ─── Getters ─────────────────────────────────────────────────────────────────

export const getNodeStyle = (type) => NODE_STYLES[type] || NODE_STYLES.default;
export const getNodeColor = (type) => getNodeStyle(type).color;

// Convertit une couleur hex en rgba
const hexToRgba = (hex, opacity) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// {stroke, fill} pour les overlays d'annotation (BookPanel, Infobox)
export const getNodeColorConfig = (type) => {
    const style = getNodeStyle(type);
    // Les noeuds blancs seraient invisibles comme overlay → on utilise le stroke
    const base = style.color === '#ffffff' ? (style.stroke !== '#000000' ? style.stroke : '#0000ff') : style.color;
    return { stroke: base, fill: hexToRgba(base, 0.1) };
};

// ─── Icône React SVG (remplace tous les NodeIcon locaux) ─────────────────────
//   size=16 pour NodeTooltip, size=22 pour FilterGraphMode/FilterBookMode
export const NodeIcon = ({ type, size = 16 }) => {
    const style = getNodeStyle(type);
    const { shape, color, stroke } = style;
    const half = size / 2;
    const props = { fill: color, stroke, strokeWidth: 1.5 };

    let el;
    if (shape === 'rect') {
        el = <rect x={1} y={1} width={size - 2} height={size - 2} {...props} />;
    } else if (shape === 'diamond') {
        el = <polygon points={`${half},1 ${size - 1},${half} ${half},${size - 1} 1,${half}`} {...props} />;
    } else if (shape === 'triangle') {
        // Triangle pointant vers le haut (interaction)
        el = <polygon points={`${half},1 ${size - 1},${size - 1} 1,${size - 1}`} {...props} />;
    } else if (shape === 'tail') {
        // Triangle pointant vers le bas (queue de bulle)
        el = <polygon points={`${half},${size - 1} 1,2 ${size - 1},2`} {...props} />;
    } else {
        el = <circle cx={half} cy={half} r={half - 1} {...props} />;
    }

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
            {el}
        </svg>
    );
};