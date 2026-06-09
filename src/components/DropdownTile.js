import React, { useState } from 'react';

// Dropdown de sélection (remplace MetaCharacterDropdown, MetaObjectDropdown, TileSelect)
// items: [{id, label}]  selectedId: string|null  onSelect: (id|null) => void
// withSectionBorder: ajoute border-t + label section (style Meta*)
export const DropdownTile = ({
    label,
    items,
    selectedId,
    onSelect,
    color = '#2980B9',
    borderColor,
    emptyText = '— Not defined —',
    withSectionBorder = false,
}) => {
    const [open, setOpen] = useState(false);
    const bc = borderColor ?? color + '88';
    const currentItem = items.find(i => i.id === selectedId);

    const dropdown = (
        <div className="relative">
            <div
                onClick={() => setOpen(o => !o)}
                className="flex items-center justify-between rounded px-2 py-1 border cursor-pointer transition-colors hover:opacity-90"
                style={currentItem
                    ? { borderColor: bc, backgroundColor: color + '33' }
                    : { borderColor: bc, backgroundColor: color + '15' }
                }
            >
                <span className="text-[10px] font-bold truncate max-w-[150px]" style={{ color }}>
                    {currentItem ? currentItem.label : emptyText}
                </span>
                <span className="text-[10px] shrink-0 ml-1" style={{ color }}>{open ? '▲' : '▼'}</span>
            </div>

            {open && (
                <div
                    className="absolute z-50 left-0 right-0 mt-1 rounded shadow-lg bg-white max-h-40 overflow-y-auto"
                    style={{ border: `1px solid ${bc}` }}
                >
                    {currentItem && (
                        <div
                            onClick={() => { onSelect(null); setOpen(false); }}
                            className="flex items-center px-2 py-1 cursor-pointer hover:bg-red-50 border-b border-gray-100"
                        >
                            <span className="text-[10px] text-red-400 italic">✕ Remove</span>
                        </div>
                    )}
                    {items.map(item => {
                        const isActive = item.id === selectedId;
                        return (
                            <div
                                key={item.id}
                                onClick={() => { onSelect(item.id); setOpen(false); }}
                                className="flex items-center justify-between px-2 py-1 cursor-pointer transition-colors"
                                style={{ backgroundColor: isActive ? color + '33' : 'transparent' }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = color + '18'; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                                <span className="text-[10px] font-bold truncate" style={{ color }}>{item.label}</span>
                                {isActive && <span className="text-[9px] font-bold shrink-0 ml-1" style={{ color }}>✓</span>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    if (withSectionBorder) {
        return (
            <div className="flex flex-col gap-2 border-t border-gray-100 pt-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">{label}</span>
                {dropdown}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase">{label}</span>
            {dropdown}
        </div>
    );
};

// Dropdown d'ajout (remplace ParticipantDropdown, MentionDropdown)
// items: [{id, ...}]  renderItem: (item) => ReactNode
// hoverFill: true = fond couleur plein au survol (style Participant), false = fond léger
export const AddDropdown = ({
    label,
    items,
    onAdd,
    color,
    backgroundColor,
    borderColor,
    renderItem,
    align = 'left',
    hoverFill = false,
}) => {
    const [open, setOpen] = useState(false);
    if (items.length === 0) return null;

    return (
        <div className="relative">
            <div
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded border cursor-pointer text-[9px] font-bold select-none"
                style={{ borderColor, color, backgroundColor }}
            >
                + {label} {open ? '▲' : '▼'}
            </div>
            {open && (
                <div
                    className={`absolute z-50 ${align === 'right' ? 'right-0' : 'left-0'} mt-0.5 rounded shadow-lg bg-white border min-w-[140px] max-h-40 overflow-y-auto`}
                    style={{ borderColor }}
                >
                    {items.map(item => (
                        <div
                            key={item.id}
                            onClick={() => { onAdd(item.id); setOpen(false); }}
                            className="flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors"
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = hoverFill ? color : color + '18';
                                if (hoverFill) e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = '';
                                e.currentTarget.style.color = '';
                            }}
                        >
                            {renderItem(item)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};