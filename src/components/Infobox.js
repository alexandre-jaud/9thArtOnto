import React, { useState, useRef, useEffect } from 'react';
import { NodeIcon } from './NodeTooltip';
import { DropdownTile, AddDropdown } from './DropdownTile';

const MetaCharacterDropdown = ({ allMetaCharacters, currentMetaId, onSelect }) => (
    <DropdownTile
        label="MetaCharacter"
        items={allMetaCharacters.map(m => ({ id: m.id, label: m.name || m.id }))}
        selectedId={currentMetaId}
        onSelect={onSelect}
        color="#9B59B6"
        emptyText="— Not assigned —"
        withSectionBorder
    />
);

const MetaObjectDropdown = ({ allMetaObjects, currentMetaId, onSelect }) => (
    <DropdownTile
        label="MetaObject"
        items={allMetaObjects.map(m => ({ id: m.id, label: m.name || m.id }))}
        selectedId={currentMetaId}
        onSelect={onSelect}
        color="#B8860B"
        emptyText="— Not assigned —"
        withSectionBorder
    />
);

const TileSelect = ({ label, value, options, onChange, color = '#2980B9', borderColor = '#90D5FF' }) => (
    <DropdownTile
        label={label}
        items={options.map(o => ({ id: o.value, label: o.label }))}
        selectedId={value}
        onSelect={onChange}
        color={color}
        borderColor={borderColor}
    />
);

const PANEL_EDITABLE_FIELDS = ['borderType', 'isLocative', 'isPolychronic', 'isPolymorphic', 'isPolyptic', 'panelTransition', 'graphicStyle', 'hasRank'];
const BALLOON_EDITABLE_FIELDS = ['balloonType', 'borderStyle', 'closureState', 'shape', 'backgroundColor'];
const CAPTION_EDITABLE_FIELDS = ['captionType', 'backgroundColor'];
const TEXTLINE_EDITABLE_FIELDS = ['textOrientation', 'textLineType'];
const TEXTSPAN_EDITABLE_FIELDS = ['content', 'isBold', 'isItalic', 'textColor', 'textEffect'];
const ONOMATOPOEIA_EDITABLE_FIELDS = ['content', 'category'];
const OBJECT_EDITABLE_FIELDS = ['name'];

// --- SceneSetting inline dans une ligne Level ---
const SceneSettingInline = ({ levelId, jsonContent, setJsonContent }) => {
    const allEdges = Object.values(jsonContent?.edge || {});
    const allNodes = jsonContent?.node || {};

    const ssEdge = allEdges.find(e => e.relation === 'hasSceneSetting' && e.source === levelId);
    const ssNode = ssEdge ? allNodes[ssEdge.target] : null;
    const currentDesc = ssNode?.description || '';

    const handleChange = (value) => {
        setJsonContent(prev => {
            const prevEdges = { ...prev.edge };
            const prevNodes = { ...prev.node };

            if (ssEdge && ssNode) {
                // Mettre à jour le nœud existant
                if (value.trim()) {
                    prevNodes[ssNode.id] = { ...ssNode, description: value };
                } else {
                    // Description vide → supprimer SceneSetting + arête
                    delete prevNodes[ssNode.id];
                    delete prevEdges[ssEdge.id];
                    // Supprimer aussi realizesLocation sortant de ce SS
                    Object.keys(prevEdges).forEach(eid => {
                        if (prevEdges[eid].source === ssNode.id) delete prevEdges[eid];
                    });
                }
            } else if (value.trim()) {
                // Créer un nouveau SceneSetting et le lier
                const suffix = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                const ssId = `sceneSetting_${suffix}`;
                const edgeId = `edge_hasSceneSetting_${suffix}`;
                prevNodes[ssId] = { id: ssId, type: 'sceneSetting', description: value };
                prevEdges[edgeId] = { id: edgeId, source: levelId, target: ssId, relation: 'hasSceneSetting' };
            }

            return { ...prev, node: prevNodes, edge: prevEdges };
        });
    };

    return (
        <div className="flex flex-col gap-0.5 mt-1 border-t pt-1" style={{ borderColor: '#f0fdf0' }}>
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#3a8a3a' }}>SceneSetting</span>
            <textarea
                className="w-full text-[10px] px-1.5 py-1 rounded border bg-white outline-none transition-colors resize-none leading-relaxed"
                style={{
                    borderColor: ssNode ? '#3a8a3a' : '#c8e6c9',
                    color: '#2d5a2d',
                    backgroundColor: ssNode ? 'rgba(144,238,144,0.12)' : 'white',
                    minHeight: '52px',
                    fontFamily: 'inherit',
                }}
                value={currentDesc}
                onChange={e => handleChange(e.target.value)}
                placeholder="Décrire la mise en scène…"
                rows={3}
            />
        </div>
    );
};

// --- Couleurs Interaction ---
const IX_COLOR  = '#16A085';
const IX_LIGHT  = '#16A08518';
const IX_BORDER = '#16A08555';

// --- Label court pour un nœud (Character/Object) ---
const NodeLabel = ({ node }) => {
    const label = node.metaCharacterName || node.name || node.id;
    const color  = node.type === 'character' ? '#FF0000' : '#FFBF00';
    return (
        <span className="text-[10px] font-bold truncate flex-1" style={{ color }}>
            {label}
        </span>
    );
};

// --- Dropdown "Ajouter participant" ---
const ParticipantDropdown = ({ btnLabel, available, onAdd }) => (
    <AddDropdown
        label={btnLabel}
        items={available}
        onAdd={onAdd}
        color={IX_COLOR}
        backgroundColor={IX_LIGHT}
        borderColor={IX_BORDER}
        hoverFill
        renderItem={n => <><NodeIcon type={n.type} /><NodeLabel node={n} /></>}
    />
);

// --- Ligne participant dans une interaction ---
const ParticipantRow = ({ node, onRemove }) => (
    <div
        className="flex items-center gap-1 bg-white rounded px-1.5 py-0.5 border"
        style={{ borderColor: IX_BORDER }}
    >
        <NodeIcon type={node.type} />
        <NodeLabel node={node} />
        <button onClick={onRemove} className="text-red-400 hover:text-red-600 text-[9px] font-bold shrink-0">✕</button>
    </div>
);

// --- Mentions (Balloon / Caption → MetaCharacter | MetaObject) ---
const MENTION_COLOR = (type) => type === 'metaCharacter' ? '#9B59B6' : '#B8860B';
const MENTION_TAG   = (type) => type === 'metaCharacter' ? 'MC' : 'MO';

const MentionDropdown = ({ available, onAdd }) => (
    <AddDropdown
        label="Mention"
        items={available}
        onAdd={onAdd}
        color="#9B59B6"
        backgroundColor="#9B59B622"
        borderColor="#9B59B6"
        align="right"
        renderItem={n => (
            <>
                <span className="text-[8px] font-bold uppercase shrink-0" style={{ color: MENTION_COLOR(n.type) }}>
                    {MENTION_TAG(n.type)}
                </span>
                <span className="text-[10px] font-bold truncate" style={{ color: MENTION_COLOR(n.type) }}>
                    {n.name || n.id}
                </span>
            </>
        )}
    />
);

const MentionSection = ({ elementId, jsonContent, setJsonContent, borderColor }) => {
    const allEdges = Object.values(jsonContent?.edge || {});
    const allNodes = jsonContent?.node || {};

    const allMentionables = Object.values(allNodes).filter(
        n => n.type === 'metaCharacter' || n.type === 'metaObject'
    );
    if (allMentionables.length === 0) return null;

    const mentionedIds = new Set(
        allEdges.filter(e => e.relation === 'mentions' && e.source === elementId).map(e => e.target)
    );
    const mentioned  = allMentionables.filter(n => mentionedIds.has(n.id));
    const available  = allMentionables.filter(n => !mentionedIds.has(n.id));

    const handleAdd = (targetId) => {
        setJsonContent(prev => {
            const newEdgeId = `edge_mentions_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
            return {
                ...prev,
                edge: { ...prev.edge, [newEdgeId]: { id: newEdgeId, source: elementId, target: targetId, relation: 'mentions' } }
            };
        });
    };

    const handleRemove = (targetId) => {
        setJsonContent(prev => {
            const nextEdges = { ...prev.edge };
            const eid = Object.keys(nextEdges).find(k =>
                nextEdges[k].relation === 'mentions' && nextEdges[k].source === elementId && nextEdges[k].target === targetId
            );
            if (eid) delete nextEdges[eid];
            return { ...prev, edge: nextEdges };
        });
    };

    return (
        <div className="flex flex-col gap-1.5 border-t pt-2" style={{ borderColor }}>
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Mentions</span>
                <MentionDropdown available={available} onAdd={handleAdd} />
            </div>
            {mentioned.length === 0 && (
                <span className="text-[10px] text-gray-400 italic">No mention linked</span>
            )}
            {mentioned.map(n => (
                <div
                    key={n.id}
                    className="flex items-center justify-between rounded px-2 py-1 border"
                    style={{ borderColor: MENTION_COLOR(n.type), backgroundColor: MENTION_COLOR(n.type) + '22' }}
                >
                    <div className="flex items-center gap-1 min-w-0">
                        <span className="text-[8px] font-bold uppercase shrink-0" style={{ color: MENTION_COLOR(n.type) }}>
                            {MENTION_TAG(n.type)}
                        </span>
                        <span className="text-[10px] font-bold truncate" style={{ color: MENTION_COLOR(n.type) }}>
                            {n.name || n.id}
                        </span>
                    </div>
                    <button
                        onClick={() => handleRemove(n.id)}
                        className="text-red-400 hover:text-red-600 text-[10px] font-bold shrink-0 ml-1"
                    >✕</button>
                </div>
            ))}
        </div>
    );
};

// --- Carte d'une Interaction ---
const InteractionCard = ({
    ix, agents, patients, instruments, locatives,
    availableForAgent, availableForPatient, availableForInstrument, availableForLocative,
    onDelete, onUpdateType,
    onAddAgent, onRemoveAgent,
    onAddPatient, onRemovePatient,
    onAddInstrument, onRemoveInstrument,
    onAddLocative, onRemoveLocative,
}) => (
    <div className="flex flex-col gap-1.5 rounded border p-2" style={{ borderColor: IX_BORDER, backgroundColor: IX_LIGHT }}>
        {/* En-tête */}
        <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-gray-400 truncate max-w-[130px]">{ix.id}</span>
            <button onClick={onDelete} className="text-red-400 hover:text-red-600 text-[10px] font-bold shrink-0 ml-1">✕</button>
        </div>

        {/* interactionType */}
        <div className="flex items-center gap-1">
            <span className="text-[9px] font-semibold uppercase shrink-0" style={{ color: IX_COLOR, minWidth: 34 }}>Type</span>
            <input
                type="text"
                className="flex-1 text-[10px] px-1.5 py-0.5 rounded border bg-white outline-none"
                style={{ borderColor: IX_BORDER }}
                value={ix.interactionType || ''}
                onChange={(e) => onUpdateType(e.target.value)}
                placeholder="shoot, kiss, sit-on…"
            />
        </div>

        {/* Agents */}
        <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase" style={{ color: IX_COLOR }}>Agents</span>
                <ParticipantDropdown btnLabel="Agent" available={availableForAgent} onAdd={onAddAgent} />
            </div>
            {agents.map(n => (
                <ParticipantRow key={n.id} node={n} onRemove={() => onRemoveAgent(n.id)} />
            ))}
        </div>

        {/* Patients */}
        <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase" style={{ color: IX_COLOR }}>Patients</span>
                <ParticipantDropdown btnLabel="Patient" available={availableForPatient} onAdd={onAddPatient} />
            </div>
            {patients.map(n => (
                <ParticipantRow key={n.id} node={n} onRemove={() => onRemovePatient(n.id)} />
            ))}
        </div>

        {/* Instrument (Object only, max 1) */}
        <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase" style={{ color: IX_COLOR }}>Instrument</span>
                {instruments.length === 0 && (
                    <ParticipantDropdown btnLabel="Instrument" available={availableForInstrument} onAdd={onAddInstrument} />
                )}
            </div>
            {instruments.map(n => (
                <ParticipantRow key={n.id} node={n} onRemove={() => onRemoveInstrument(n.id)} />
            ))}
        </div>

        {/* Locative (Object only, max 1) */}
        <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase" style={{ color: IX_COLOR }}>Locative</span>
                {locatives.length === 0 && (
                    <ParticipantDropdown btnLabel="Locative" available={availableForLocative} onAdd={onAddLocative} />
                )}
            </div>
            {locatives.map(n => (
                <ParticipantRow key={n.id} node={n} onRemove={() => onRemoveLocative(n.id)} />
            ))}
        </div>
    </div>
);

const Infobox = ({ selectedElement, onDelete, onHide, setJsonContent, jsonContent, setSelectedElement, onLevelHover, activeTool, setActiveTool }) => {
    const contentInputRef = useRef(null);

    useEffect(() => {
        if (selectedElement?.type === 'textSpan' && contentInputRef.current) {
            contentInputRef.current.focus();
        }
    }, [selectedElement?.id]);

    if (!selectedElement) return null;

    const handleNodeFieldChange = (fieldName, value) => {
        setJsonContent(prev => ({
            ...prev,
            node: {
                ...prev.node,
                [selectedElement.id]: {
                    ...prev.node[selectedElement.id],
                    [fieldName]: value === '' ? null : value
                }
            }
        }));
    };

    return (
        <div className="absolute top-4 right-4 z-50 bg-white p-4 rounded shadow-lg border border-gray-200 w-64 text-sm flex flex-col gap-4 max-h-[calc(100%-2rem)] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-2">
                    {selectedElement.source ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
                            <defs>
                                <marker id="ib-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                    <path d="M0,0 L0,6 L6,3 z" fill="#374151" />
                                </marker>
                            </defs>
                            <line x1="1" y1="8" x2="12" y2="8" stroke="#374151" strokeWidth="1.5" markerEnd="url(#ib-arrow)" />
                        </svg>
                    ) : (
                        <NodeIcon type={selectedElement.type} />
                    )}
                    <span className="font-bold text-sm text-gray-800 uppercase tracking-wide">
                        {selectedElement.type || selectedElement.relation}
                    </span>
                </div>
                <div className="flex gap-1">
                    {onHide && (
                        <button
                            onClick={onHide}
                            className="text-gray-500 hover:text-gray-700 font-bold text-xs border border-gray-200 bg-gray-50 px-2 py-1 rounded transition-colors"
                        >
                            HIDE
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="text-red-500 hover:text-red-700 font-bold text-xs border border-red-200 bg-red-50 px-2 py-1 rounded transition-colors"
                        >
                            DELETE
                        </button>
                    )}
                </div>
            </div>

            {/* SECTION PANEL */}
            {selectedElement.type === 'panel' && (
                <div className="flex flex-col gap-3">

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Border type</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            value={selectedElement.borderType || ""}
                            onChange={(e) => handleNodeFieldChange('borderType', e.target.value || null)}
                        >
                            <option value="">-- Not defined --</option>
                            <option value="full-fenced">Full-fenced</option>
                            <option value="half-closed">Half-closed</option>
                            <option value="frameless">Frameless</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Panel transition</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            value={selectedElement.panelTransition || ""}
                            onChange={(e) => handleNodeFieldChange('panelTransition', e.target.value || null)}
                        >
                            <option value="">-- Not defined --</option>
                            <option value="moment-to-moment">Moment-to-moment</option>
                            <option value="action-to-action">Action-to-action</option>
                            <option value="subject-to-subject">Subject-to-subject</option>
                            <option value="scene-to-scene">Scene-to-scene</option>
                            <option value="aspect-to-aspect">Aspect-to-aspect</option>
                            <option value="non-sequitur">Non-sequitur</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Graphic style</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            value={selectedElement.graphicStyle || ""}
                            onChange={(e) => handleNodeFieldChange('graphicStyle', e.target.value || null)}
                            placeholder="E.g.: watercolour, sketchy..."
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Rank</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            value={selectedElement.hasRank || ""}
                            onChange={(e) => handleNodeFieldChange('hasRank', e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="Reading order position"
                        />
                    </div>

                    <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
                        {[
                            { field: 'isLocative', label: 'Locative (establishing shot)' },
                            { field: 'isPolychronic', label: 'Polychronic (multiple time layers)' },
                            { field: 'isPolymorphic', label: 'Polymorphic (stroboscopic)' },
                            { field: 'isPolyptic', label: 'Polyptic (continuous composition)' },
                        ].map(({ field, label }) => (
                            <label key={field} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!selectedElement[field]}
                                    onChange={(e) => handleNodeFieldChange(field, e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-xs text-gray-600">{label}</span>
                            </label>
                        ))}
                    </div>

                    {/* --- LEVELS --- */}
                    {(() => {
                        const edges = Object.values(jsonContent?.edge || {});
                        const levelEdges = edges.filter(e => e.relation === 'hasLevel' && e.source === selectedElement.id);
                        const levels = levelEdges.map(e => ({ edge: e, node: jsonContent?.node?.[e.target] })).filter(l => l.node);

                        const handleDeleteLevel = (levelId) => {
                            setJsonContent(prev => {
                                const nextNodes = { ...prev.node };
                                const nextEdges = { ...prev.edge };
                                delete nextNodes[levelId];
                                Object.keys(nextEdges).forEach(eid => {
                                    if (nextEdges[eid].source === levelId || nextEdges[eid].target === levelId ||
                                        (nextEdges[eid].relation === 'hasLevel' && nextEdges[eid].target === levelId)) {
                                        delete nextEdges[eid];
                                    }
                                });
                                return { ...prev, node: nextNodes, edge: nextEdges };
                            });
                        };

                        const handleCreateLevel = () => {
                            const suffix = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                            const levelId = `level_${suffix}`;
                            const edgeId = `edge_hasLevel_${suffix}`;
                            setJsonContent(prev => ({
                                ...prev,
                                node: { ...prev.node, [levelId]: { id: levelId, type: 'level' } },
                                edge: { ...prev.edge, [edgeId]: { id: edgeId, source: selectedElement.id, target: levelId, relation: 'hasLevel' } },
                            }));
                        };

                        return (
                            <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Levels</span>
                                    <button
                                        onClick={handleCreateLevel}
                                        className="text-[10px] font-bold px-2 py-0.5 rounded border border-[#ff6600] text-[#ff6600] hover:bg-[#ff6600] hover:text-white transition-colors"
                                    >
                                        + Add
                                    </button>
                                </div>
                                {levels.length === 0 ? (
                                    <span className="text-[10px] text-gray-400 italic">No level — click + Add</span>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        {levels.map(({ node }) => (
                                            <div
                                                key={node.id}
                                                className="flex flex-col gap-0.5 bg-orange-50 border border-orange-200 rounded px-2 py-1.5"
                                                onMouseEnter={() => onLevelHover?.(node.id)}
                                                onMouseLeave={() => onLevelHover?.(null)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-mono text-orange-700 truncate max-w-[140px]">{node.id}</span>
                                                    <button
                                                        onClick={() => handleDeleteLevel(node.id)}
                                                        className="text-red-400 hover:text-red-600 text-[10px] font-bold ml-1 shrink-0"
                                                    >✕</button>
                                                </div>
                                                <SceneSettingInline
                                                    levelId={node.id}
                                                    jsonContent={jsonContent}
                                                    setJsonContent={setJsonContent}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* --- INVISIBLE CHARACTERS --- */}
                    {(() => {
                        const allEdgesArr = Object.values(jsonContent?.edge || {});
                        const allNodes = jsonContent?.node || {};

                        const levelIds = allEdgesArr
                            .filter(e => e.relation === 'hasLevel' && e.source === selectedElement.id)
                            .map(e => e.target);
                        const levelEdge = allEdgesArr.find(e => e.relation === 'hasLevel' && e.source === selectedElement.id);

                        const invisibleChars = levelIds.flatMap(lid =>
                            allEdgesArr
                                .filter(e => e.relation === 'hasCharacter' && e.source === lid)
                                .map(e => allNodes[e.target])
                                .filter(n => n && n.visible === false)
                        );

                        const getCharLabel = (char) => {
                            const isCharEdge = allEdgesArr.find(e => e.relation === 'isCharacter' && e.source === char.id);
                            const meta = isCharEdge ? allNodes[isCharEdge.target] : null;
                            return meta?.name || char.name || char.id;
                        };

                        const handleAddInvisibleCharacter = () => {
                            const suffix = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                            const charId = `character_${suffix}`;
                            setJsonContent(prev => {
                                const newChar = { id: charId, type: 'character', borderPoints: null, emotion: null, visible: false };
                                const newEdges = {};
                                if (levelEdge) {
                                    const charEdgeId = `edge_hasCharacter_${suffix}`;
                                    newEdges[charEdgeId] = { id: charEdgeId, source: levelEdge.target, target: charId, relation: 'hasCharacter' };
                                }
                                return { ...prev, node: { ...prev.node, [charId]: newChar }, edge: { ...(prev.edge || {}), ...newEdges } };
                            });
                            setSelectedElement?.(charId);
                        };

                        const handleDeleteInvisibleChar = (charId) => {
                            setJsonContent(prev => {
                                const nextNodes = { ...prev.node };
                                const nextEdges = { ...prev.edge };
                                delete nextNodes[charId];
                                Object.keys(nextEdges).forEach(eid => {
                                    if (nextEdges[eid].source === charId || nextEdges[eid].target === charId)
                                        delete nextEdges[eid];
                                });
                                return { ...prev, node: nextNodes, edge: nextEdges };
                            });
                        };

                        return (
                            <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Invisible Characters</span>
                                    <button
                                        onClick={handleAddInvisibleCharacter}
                                        disabled={!levelEdge}
                                        title={!levelEdge ? 'Add a Level first' : 'Add an invisible character'}
                                        className="text-[10px] font-bold px-2 py-0.5 rounded border transition-colors border-red-300 text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        + Add
                                    </button>
                                </div>
                                {!levelEdge && (
                                    <span className="text-[9px] text-gray-400 italic">Add a Level first</span>
                                )}
                                {levelEdge && invisibleChars.length === 0 && (
                                    <span className="text-[9px] text-gray-400 italic">No invisible character yet</span>
                                )}
                                {invisibleChars.map(char => (
                                    <div
                                        key={char.id}
                                        onClick={() => setSelectedElement?.(char.id)}
                                        className="flex items-center justify-between rounded px-2 py-1 border cursor-pointer hover:bg-red-50 transition-colors"
                                        style={{ borderColor: '#FF000044', backgroundColor: '#FF000008' }}
                                    >
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <svg viewBox="0 0 12 12" className="w-3 h-3 shrink-0">
                                                <circle cx="6" cy="6" r="5" fill="none" stroke="#FF0000" strokeWidth="1.5" strokeDasharray="3,2"/>
                                            </svg>
                                            <span className="text-[10px] font-mono text-red-700 truncate">{getCharLabel(char)}</span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteInvisibleChar(char.id); }}
                                            className="text-red-400 hover:text-red-600 text-[10px] font-bold ml-1 shrink-0"
                                        >✕</button>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}

                    {/* --- INTERACTIONS --- */}
                    {(() => {
                        const allEdgesArr = Object.values(jsonContent?.edge || {});
                        const allNodes    = jsonContent?.node || {};

                        // Levels du panel
                        const levelIds = allEdgesArr
                            .filter(e => e.relation === 'hasLevel' && e.source === selectedElement.id)
                            .map(e => e.target)
                            .filter(id => allNodes[id]);

                        // Characters + Objects dans ce panel (tous levels confondus)
                        const charsAndObjects = levelIds.flatMap(lid =>
                            allEdgesArr
                                .filter(e => (e.relation === 'hasCharacter' || e.relation === 'hasObject') && e.source === lid)
                                .map(e => {
                                    const node = allNodes[e.target];
                                    if (!node) return null;
                                    if (node.type === 'character') {
                                        const metaEdge = allEdgesArr.find(me => me.relation === 'isCharacter' && me.source === node.id);
                                        const meta = metaEdge ? allNodes[metaEdge.target] : null;
                                        return { ...node, metaCharacterName: meta?.name || node.name };
                                    }
                                    return node;
                                })
                        ).filter(Boolean);

                        const objectsOnly = levelIds.flatMap(lid =>
                            allEdgesArr
                                .filter(e => e.relation === 'hasObject' && e.source === lid)
                                .map(e => allNodes[e.target])
                        ).filter(Boolean);

                        // Interactions (avec leur levelId d'attachement)
                        const interactions = levelIds.flatMap(levelId =>
                            allEdgesArr
                                .filter(e => e.relation === 'hasInteraction' && e.source === levelId)
                                .map(e => ({ levelId, node: allNodes[e.target] }))
                                .filter(({ node }) => node)
                        );

                        const getParticipants = (ixId, rel) =>
                            allEdgesArr
                                .filter(e => e.relation === rel && e.source === ixId)
                                .map(e => {
                                    const node = allNodes[e.target];
                                    if (!node) return null;
                                    if (node.type === 'character') {
                                        const metaEdge = allEdgesArr.find(me => me.relation === 'isCharacter' && me.source === node.id);
                                        const meta = metaEdge ? allNodes[metaEdge.target] : null;
                                        return { ...node, metaCharacterName: meta?.name || node.name };
                                    }
                                    return node;
                                })
                                .filter(Boolean);

                        const handleCreateInteraction = () => {
                            if (levelIds.length === 0) return;
                            const targetLevel = levelIds[0]; // premier level disponible
                            const suffix = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                            const ixId   = `interaction_${suffix}`;
                            const edgeId = `edge_hasInteraction_${suffix}`;
                            setJsonContent(prev => ({
                                ...prev,
                                node: { ...prev.node, [ixId]: { id: ixId, type: 'interaction' } },
                                edge: { ...prev.edge, [edgeId]: { id: edgeId, source: targetLevel, target: ixId, relation: 'hasInteraction' } },
                            }));
                        };

                        const handleDeleteInteraction = (ixId) => {
                            setJsonContent(prev => {
                                const nextNodes = { ...prev.node };
                                const nextEdges = { ...prev.edge };
                                delete nextNodes[ixId];
                                Object.keys(nextEdges).forEach(eid => {
                                    if (nextEdges[eid].source === ixId || nextEdges[eid].target === ixId)
                                        delete nextEdges[eid];
                                });
                                return { ...prev, node: nextNodes, edge: nextEdges };
                            });
                        };

                        const handleUpdateType = (ixId, value) => {
                            setJsonContent(prev => ({
                                ...prev,
                                node: { ...prev.node, [ixId]: { ...prev.node[ixId], interactionType: value || undefined } },
                            }));
                        };

                        const handleAddParticipant = (ixId, participantId, rel) => {
                            const edgeId = `edge_${rel}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
                            setJsonContent(prev => ({
                                ...prev,
                                edge: { ...prev.edge, [edgeId]: { id: edgeId, source: ixId, target: participantId, relation: rel } },
                            }));
                        };

                        const handleRemoveParticipant = (ixId, participantId, rel) => {
                            setJsonContent(prev => {
                                const nextEdges = { ...prev.edge };
                                const eid = Object.keys(nextEdges).find(k =>
                                    nextEdges[k].relation === rel && nextEdges[k].source === ixId && nextEdges[k].target === participantId
                                );
                                if (eid) delete nextEdges[eid];
                                return { ...prev, edge: nextEdges };
                            });
                        };

                        return (
                            <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Interactions</span>
                                    {levelIds.length > 0 ? (
                                        <button
                                            onClick={handleCreateInteraction}
                                            className="text-[10px] font-bold px-2 py-0.5 rounded border transition-colors"
                                            style={{ borderColor: IX_COLOR, color: IX_COLOR }}
                                            onMouseEnter={e => { e.currentTarget.style.background = IX_COLOR; e.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = IX_COLOR; }}
                                        >
                                            + Add
                                        </button>
                                    ) : (
                                        <span className="text-[9px] text-gray-400 italic">Add a Level first</span>
                                    )}
                                </div>
                                {interactions.length === 0 && levelIds.length > 0 && (
                                    <span className="text-[10px] text-gray-400 italic">No interaction yet</span>
                                )}
                                {interactions.map(({ node: ix }) => {
                                    const agents      = getParticipants(ix.id, 'hasAgent');
                                    const patients    = getParticipants(ix.id, 'hasPatient');
                                    const instruments = getParticipants(ix.id, 'hasInstrument');
                                    const locatives   = getParticipants(ix.id, 'hasLocative');
                                    const agentIds      = new Set(agents.map(n => n.id));
                                    const patientIds    = new Set(patients.map(n => n.id));
                                    const instrumentIds = new Set(instruments.map(n => n.id));
                                    const locativeIds   = new Set(locatives.map(n => n.id));

                                    return (
                                        <InteractionCard
                                            key={ix.id}
                                            ix={ix}
                                            agents={agents}
                                            patients={patients}
                                            instruments={instruments}
                                            locatives={locatives}
                                            availableForAgent={charsAndObjects.filter(n => !agentIds.has(n.id))}
                                            availableForPatient={charsAndObjects.filter(n => !patientIds.has(n.id))}
                                            availableForInstrument={objectsOnly.filter(n => !instrumentIds.has(n.id))}
                                            availableForLocative={objectsOnly.filter(n => !locativeIds.has(n.id))}
                                            onDelete={() => handleDeleteInteraction(ix.id)}
                                            onUpdateType={(v) => handleUpdateType(ix.id, v)}
                                            onAddAgent={(pid) => handleAddParticipant(ix.id, pid, 'hasAgent')}
                                            onRemoveAgent={(pid) => handleRemoveParticipant(ix.id, pid, 'hasAgent')}
                                            onAddPatient={(pid) => handleAddParticipant(ix.id, pid, 'hasPatient')}
                                            onRemovePatient={(pid) => handleRemoveParticipant(ix.id, pid, 'hasPatient')}
                                            onAddInstrument={(pid) => handleAddParticipant(ix.id, pid, 'hasInstrument')}
                                            onRemoveInstrument={(pid) => handleRemoveParticipant(ix.id, pid, 'hasInstrument')}
                                            onAddLocative={(pid) => handleAddParticipant(ix.id, pid, 'hasLocative')}
                                            onRemoveLocative={(pid) => handleRemoveParticipant(ix.id, pid, 'hasLocative')}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* METACHARACTER SELECTOR */}
            {selectedElement.type === 'character' && (() => {
                const allEdges = Object.values(jsonContent?.edge || {});
                const allMetaCharacters = Object.values(jsonContent?.node || {}).filter(n => n.type === 'metaCharacter');
                if (allMetaCharacters.length === 0) return null;

                const currentIsCharEdge = allEdges.find(e => e.relation === 'isCharacter' && e.source === selectedElement.id);
                const currentMetaId = currentIsCharEdge?.target;
                const currentMeta = currentMetaId ? jsonContent?.node?.[currentMetaId] : null;

                const handleSelectMeta = (metaId) => {
                    setJsonContent(prev => {
                        const nextEdges = { ...prev.edge };
                        const oldEdgeId = Object.keys(nextEdges).find(eid =>
                            nextEdges[eid].relation === 'isCharacter' && nextEdges[eid].source === selectedElement.id
                        );
                        if (oldEdgeId) delete nextEdges[oldEdgeId];
                        if (metaId && metaId !== currentMetaId) {
                            const newEdgeId = `edge_isCharacter_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
                            nextEdges[newEdgeId] = { id: newEdgeId, source: selectedElement.id, target: metaId, relation: 'isCharacter' };
                        }
                        return { ...prev, edge: nextEdges };
                    });
                };

                return <MetaCharacterDropdown
                    allMetaCharacters={allMetaCharacters}
                    currentMeta={currentMeta}
                    currentMetaId={currentMetaId}
                    onSelect={handleSelectMeta}
                />;
            })()}

            {/* EMOTION SELECTOR */}
            {selectedElement.type === 'character' && (() => {
                const EMOTION_OPTIONS = [
                    { value: 'afraid',      label: 'Afraid'      },
                    { value: 'alarmed',     label: 'Alarmed'     },
                    { value: 'angry',       label: 'Angry'       },
                    { value: 'annoyed',     label: 'Annoyed'     },
                    { value: 'aroused',     label: 'Aroused'     },
                    { value: 'astonished',  label: 'Astonished'  },
                    { value: 'at ease',     label: 'At ease'     },
                    { value: 'bored',       label: 'Bored'       },
                    { value: 'calm',        label: 'Calm'        },
                    { value: 'content',     label: 'Content'     },
                    { value: 'delighted',   label: 'Delighted'   },
                    { value: 'depressed',   label: 'Depressed'   },
                    { value: 'distressed',  label: 'Distressed'  },
                    { value: 'droopy',      label: 'Droopy'      },
                    { value: 'excited',     label: 'Excited'     },
                    { value: 'frustrated',  label: 'Frustrated'  },
                    { value: 'glad',        label: 'Glad'        },
                    { value: 'gloomy',      label: 'Gloomy'      },
                    { value: 'happy',       label: 'Happy'       },
                    { value: 'miserable',   label: 'Miserable'   },
                    { value: 'pleased',     label: 'Pleased'     },
                    { value: 'relaxed',     label: 'Relaxed'     },
                    { value: 'sad',         label: 'Sad'         },
                    { value: 'satisfied',   label: 'Satisfied'   },
                    { value: 'serene',      label: 'Serene'      },
                    { value: 'sleepy',      label: 'Sleepy'      },
                    { value: 'tense',       label: 'Tense'       },
                    { value: 'tired',       label: 'Tired'       },
                ];
                const currentEmotion = selectedElement.emotion ?? null;
                const handleChangeEmotion = (value) => {
                    setJsonContent(prev => ({
                        ...prev,
                        node: {
                            ...prev.node,
                            [selectedElement.id]: { ...prev.node[selectedElement.id], emotion: value },
                        },
                    }));
                };
                return (
                    <div className="border-t border-gray-100 pt-2">
                        <TileSelect
                            label="Emotion"
                            value={currentEmotion}
                            options={EMOTION_OPTIONS}
                            onChange={handleChangeEmotion}
                            color="#C0392B"
                            borderColor="#E74C3C"
                        />
                    </div>
                );
            })()}

            {/* SECTION CHARACTER */}
            {selectedElement.type === 'character' && (() => {
                const allEdges = Object.values(jsonContent?.edge || {});

                // Edge hasCharacter pointant vers ce character
                const currentEdge = allEdges.find(e => e.relation === 'hasCharacter' && e.target === selectedElement.id);
                const currentLevelId = currentEdge?.source;

                // Panel parent du level courant
                const parentPanelEdge = currentLevelId
                    ? allEdges.find(e => e.relation === 'hasLevel' && e.target === currentLevelId)
                    : null;
                const panelId = parentPanelEdge?.source;

                // Tous les levels de ce panel
                const siblingLevels = panelId
                    ? allEdges
                        .filter(e => e.relation === 'hasLevel' && e.source === panelId)
                        .map(e => jsonContent.node?.[e.target])
                        .filter(Boolean)
                    : [];

                if (siblingLevels.length <= 1) return null;

                const handleChangeLevel = (newLevelId) => {
                    if (newLevelId === currentLevelId) return;
                    setJsonContent(prev => {
                        const nextEdges = { ...prev.edge };
                        // Supprimer l'ancien edge hasCharacter
                        const oldEdgeId = Object.keys(nextEdges).find(eid =>
                            nextEdges[eid].relation === 'hasCharacter' && nextEdges[eid].target === selectedElement.id
                        );
                        if (oldEdgeId) delete nextEdges[oldEdgeId];
                        // Créer le nouvel edge
                        const newEdgeId = `edge_hasCharacter_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
                        nextEdges[newEdgeId] = { id: newEdgeId, source: newLevelId, target: selectedElement.id, relation: 'hasCharacter' };
                        return { ...prev, edge: nextEdges };
                    });
                };

                return (
                    <div className="flex flex-col gap-2 border-t border-gray-100 pt-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Level</span>
                        <div className="flex flex-col gap-1">
                            {siblingLevels.map(level => {
                                const isActive = level.id === currentLevelId;
                                return (
                                    <div
                                        key={level.id}
                                        onClick={() => handleChangeLevel(level.id)}
                                        className={`flex items-center justify-between rounded px-2 py-1 border cursor-pointer transition-colors ${
                                            isActive
                                                ? 'bg-orange-100 border-orange-400'
                                                : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                                        }`}
                                    >
                                        <span className="text-[10px] font-mono text-orange-700 truncate max-w-[160px]">{level.id}</span>
                                        {isActive && (
                                            <span className="text-[9px] font-bold text-orange-500 shrink-0 ml-1">✓</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* METAOBJECT SELECTOR */}
            {selectedElement.type === 'object' && (() => {
                const allEdges = Object.values(jsonContent?.edge || {});
                const allMetaObjects = Object.values(jsonContent?.node || {}).filter(n => n.type === 'metaObject');
                if (allMetaObjects.length === 0) return null;

                const currentIsObjectEdge = allEdges.find(e => e.relation === 'isObject' && e.source === selectedElement.id);
                const currentMetaId = currentIsObjectEdge?.target;
                const currentMeta = currentMetaId ? jsonContent?.node?.[currentMetaId] : null;

                const handleSelectMeta = (metaId) => {
                    setJsonContent(prev => {
                        const nextEdges = { ...prev.edge };
                        const nextNodes = { ...prev.node };
                        const oldEdgeId = Object.keys(nextEdges).find(eid =>
                            nextEdges[eid].relation === 'isObject' && nextEdges[eid].source === selectedElement.id
                        );
                        if (oldEdgeId) delete nextEdges[oldEdgeId];
                        if (metaId) {
                            const newEdgeId = `edge_isObject_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
                            nextEdges[newEdgeId] = { id: newEdgeId, source: selectedElement.id, target: metaId, relation: 'isObject' };
                            const metaNode = prev.node[metaId];
                            if (metaNode?.name) {
                                nextNodes[selectedElement.id] = { ...nextNodes[selectedElement.id], name: metaNode.name };
                            }
                        }
                        return { ...prev, node: nextNodes, edge: nextEdges };
                    });
                };

                return <MetaObjectDropdown
                    allMetaObjects={allMetaObjects}
                    currentMeta={currentMeta}
                    currentMetaId={currentMetaId}
                    onSelect={handleSelectMeta}
                />;
            })()}

            {/* SECTION OBJECT */}
            {selectedElement.type === 'object' && (() => {
                const allEdges = Object.values(jsonContent?.edge || {});
                const isObjectEdge = allEdges.find(e => e.relation === 'isObject' && e.source === selectedElement.id);
                const metaNode = isObjectEdge ? jsonContent?.node?.[isObjectEdge.target] : null;
                const isNameLocked = !!metaNode;

                return (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                        <input
                            type="text"
                            className={`w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 ${
                                isNameLocked
                                    ? 'border-amber-300 bg-amber-50 text-amber-700 cursor-not-allowed focus:ring-amber-200'
                                    : 'border-gray-300 bg-gray-50 focus:ring-gray-400'
                            }`}
                            value={isNameLocked ? (metaNode.name || '') : (selectedElement.name || '')}
                            readOnly={isNameLocked}
                            onChange={isNameLocked ? undefined : (e) => handleNodeFieldChange('name', e.target.value || null)}
                            placeholder="Object name..."
                        />
                        {isNameLocked && (
                            <span className="text-[9px] text-amber-500 italic">Locked — set by MetaObject</span>
                        )}
                    </div>
                );
            })()}

            {/* SECTION BALLOON */}
            {selectedElement.type === 'balloon' && (
                <div className="flex flex-col gap-3">
                    <TileSelect
                        label="Balloon type"
                        value={selectedElement.balloonType || null}
                        options={[
                            { value: 'speech', label: 'Speech' },
                            { value: 'thought', label: 'Thought' },
                            { value: 'exclamation', label: 'Exclamation' },
                            { value: 'whisper', label: 'Whisper' },
                            { value: 'broadcast', label: 'Broadcast' },
                        ]}
                        onChange={(v) => handleNodeFieldChange('balloonType', v)}
                    />
                    <TileSelect
                        label="Border style"
                        value={selectedElement.borderStyle || null}
                        options={[
                            { value: 'smooth', label: 'Smooth' },
                            { value: 'wavy', label: 'Wavy' },
                            { value: 'zigzag', label: 'Zigzag' },
                        ]}
                        onChange={(v) => handleNodeFieldChange('borderStyle', v)}
                    />
                    <TileSelect
                        label="Closure state"
                        value={selectedElement.closureState || null}
                        options={[
                            { value: 'closed', label: 'Closed' },
                            { value: 'unclosed', label: 'Unclosed' },
                        ]}
                        onChange={(v) => handleNodeFieldChange('closureState', v)}
                    />
                    <TileSelect
                        label="Shape"
                        value={selectedElement.shape || null}
                        options={[
                            { value: 'oval', label: 'Oval' },
                            { value: 'rectangle', label: 'Rectangle' },
                            { value: 'cloud', label: 'Cloud' },
                            { value: 'peak', label: 'Peak' },
                            { value: 'suggested', label: 'Suggested' },
                        ]}
                        onChange={(v) => handleNodeFieldChange('shape', v)}
                    />

                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Background color</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                className="w-8 h-8 rounded border cursor-pointer p-0.5 bg-white"
                                style={{ borderColor: '#90D5FF' }}
                                value={selectedElement.backgroundColor && selectedElement.backgroundColor.startsWith('#') ? selectedElement.backgroundColor : '#ffffff'}
                                onChange={(e) => handleNodeFieldChange('backgroundColor', e.target.value)}
                            />
                            <div
                                className="flex-1 flex items-center justify-between rounded px-2 py-1 border"
                                style={{ borderColor: selectedElement.backgroundColor ? '#90D5FF' : '#90D5FF88', backgroundColor: selectedElement.backgroundColor ? '#90D5FF33' : '#90D5FF15' }}
                            >
                                <input
                                    type="text"
                                    className="text-[10px] font-bold bg-transparent outline-none w-full"
                                    style={{ color: '#2980B9' }}
                                    value={selectedElement.backgroundColor || ""}
                                    onChange={(e) => handleNodeFieldChange('backgroundColor', e.target.value || null)}
                                    placeholder="— Not defined —"
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- EMITTED BY --- */}
                    {(() => {
                        const allEdges = Object.values(jsonContent?.edge || {});
                        const allNodes = jsonContent?.node || {};

                        // Level parent de cette bulle
                        const parentEdge = allEdges.find(e => e.relation === 'hasBalloon' && e.target === selectedElement.id);
                        const parentId = parentEdge?.source;

                        // Uniquement le MetaCharacter Narrator
                        const metaCharacters = Object.values(allNodes).filter(n => n.type === 'metaCharacter' && n.name === 'Narrator');

                        // Personnages, objets du level + MetaCharacters globaux
                        const speakersPool = [
                            ...(parentId
                                ? [
                                    ...allEdges.filter(e => e.relation === 'hasCharacter' && e.source === parentId).map(e => allNodes[e.target]),
                                    ...allEdges.filter(e => e.relation === 'hasObject' && e.source === parentId).map(e => allNodes[e.target]),
                                  ]
                                : []),
                            ...metaCharacters,
                        ].filter(Boolean);

                        if (speakersPool.length === 0) return null;

                        // Résoudre le nom affiché selon le type
                        const getNodeName = (node) => {
                            if (node.type === 'character') {
                                const edge = allEdges.find(e => e.relation === 'isCharacter' && e.source === node.id);
                                const meta = edge ? allNodes[edge.target] : null;
                                return meta?.name || node.name || node.id;
                            }
                            if (node.type === 'object') {
                                const edge = allEdges.find(e => e.relation === 'isObject' && e.source === node.id);
                                const meta = edge ? allNodes[edge.target] : null;
                                return meta?.name || node.name || node.id;
                            }
                            if (node.type === 'metaCharacter') {
                                return node.name || node.id;
                            }
                            return node.name || node.id;
                        };

                        // Enrichir les nœuds avec metaCharacterName pour que NodeLabel l'affiche
                        const enriched = speakersPool.map(n => ({ ...n, metaCharacterName: getNodeName(n) }));

                        const currentSpeakerIds = new Set(
                            allEdges.filter(e => e.relation === 'emittedBy' && e.source === selectedElement.id).map(e => e.target)
                        );
                        const speakers  = enriched.filter(c => currentSpeakerIds.has(c.id));
                        const available = enriched.filter(c => !currentSpeakerIds.has(c.id));

                        const handleAdd = (charId) => {
                            setJsonContent(prev => {
                                const newEdgeId = `edge_emittedBy_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
                                return {
                                    ...prev,
                                    edge: { ...prev.edge, [newEdgeId]: { id: newEdgeId, source: selectedElement.id, target: charId, relation: 'emittedBy' } }
                                };
                            });
                        };

                        const handleRemove = (charId) => {
                            setJsonContent(prev => {
                                const nextEdges = { ...prev.edge };
                                const eid = Object.keys(nextEdges).find(k =>
                                    nextEdges[k].relation === 'emittedBy' && nextEdges[k].source === selectedElement.id && nextEdges[k].target === charId
                                );
                                if (eid) delete nextEdges[eid];
                                return { ...prev, edge: nextEdges };
                            });
                        };

                        return (
                            <div className="flex flex-col gap-1.5 border-t pt-2" style={{ borderColor: '#90D5FF' }}>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Emitted by</span>
                                    <ParticipantDropdown btnLabel="Speaker" available={available} onAdd={handleAdd} />
                                </div>
                                {speakers.length === 0 && (
                                    <span className="text-[10px] text-gray-400 italic">No speaker linked</span>
                                )}
                                {speakers.map(c => (
                                    <ParticipantRow key={c.id} node={c} onRemove={() => handleRemove(c.id)} />
                                ))}
                            </div>
                        );
                    })()}

                    {/* --- MENTIONS --- */}
                    <MentionSection
                        elementId={selectedElement.id}
                        jsonContent={jsonContent}
                        setJsonContent={setJsonContent}
                        borderColor="#90D5FF"
                    />

                    {/* --- TAILS --- */}
                    {setActiveTool && (() => {
                        const allEdges = Object.values(jsonContent?.edge || {});
                        const tailEdges = allEdges.filter(e => e.relation === 'hasTail' && e.source === selectedElement.id);
                        const tails = tailEdges.map(e => ({ edge: e, node: jsonContent?.node?.[e.target] })).filter(t => t.node);
                        const isAddingTail = activeTool === 'tail';

                        const handleDeleteTail = (tailId) => {
                            setJsonContent(prev => {
                                const nextNodes = { ...prev.node };
                                const nextEdges = { ...prev.edge };
                                delete nextNodes[tailId];
                                Object.keys(nextEdges).forEach(eid => {
                                    if (nextEdges[eid].source === tailId || nextEdges[eid].target === tailId)
                                        delete nextEdges[eid];
                                });
                                return { ...prev, node: nextNodes, edge: nextEdges };
                            });
                        };

                        return (
                            <div className="flex flex-col gap-2 border-t pt-2" style={{ borderColor: '#90D5FF' }}>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Tails</span>
                                    <button
                                        onClick={() => setActiveTool(isAddingTail ? null : 'tail')}
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                                            isAddingTail
                                                ? 'border-[#2980B9] bg-[#2980B9] text-white animate-pulse'
                                                : 'border-[#2980B9] text-[#2980B9] hover:bg-[#90D5FF33]'
                                        }`}
                                    >
                                        {isAddingTail ? '↗ Click on image...' : '+ Add'}
                                    </button>
                                </div>
                                {tails.length === 0 && !isAddingTail && (
                                    <span className="text-[10px] text-gray-400 italic">No tail yet</span>
                                )}
                                {tails.map(({ node }) => (
                                    <div
                                        key={node.id}
                                        className="flex items-center justify-between rounded px-2 py-1 border"
                                        style={{ borderColor: '#90D5FF', backgroundColor: '#90D5FF15' }}
                                    >
                                        <span className="text-[10px] font-mono font-bold leading-tight" style={{ color: '#2980B9' }}>
                                            {node.tailBase && <span className="opacity-60">{node.tailBase} → </span>}
                                            {node.tailTip}
                                            {node.tailDirection && (
                                                <span className="ml-1 text-[9px] opacity-70">({node.tailDirection})</span>
                                            )}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteTail(node.id)}
                                            className="text-red-400 hover:text-red-600 text-[10px] font-bold ml-2 shrink-0"
                                        >✕</button>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* SECTION TEXTLINE */}
            {selectedElement.type === 'textLine' && (
                <div className="flex flex-col gap-3">
                    <TileSelect
                        label="Text orientation"
                        value={selectedElement.textOrientation || null}
                        options={[
                            { value: 'horizontal', label: 'Horizontal' },
                            { value: 'vertical',   label: 'Vertical' },
                        ]}
                        onChange={(v) => handleNodeFieldChange('textOrientation', v)}
                        color="#4a4a4a"
                        borderColor="#808080"
                    />
                    <TileSelect
                        label="Text line type"
                        value={selectedElement.textLineType || null}
                        options={[
                            { value: 'narrative', label: 'Narrative' },
                            { value: 'diegetic',  label: 'Diegetic' },
                            { value: 'paratext',  label: 'Paratext' },
                        ]}
                        onChange={(v) => handleNodeFieldChange('textLineType', v)}
                        color="#4a4a4a"
                        borderColor="#808080"
                    />
                    <div className="pt-1 border-t border-gray-100">
                        <button
                            onClick={() => {
                                const suffix = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                                const tsId = `textspan_${suffix}`;
                                const edgeId = `edge_hasTextSpan_${suffix}`;
                                setJsonContent(prev => ({
                                    ...prev,
                                    node: {
                                        ...prev.node,
                                        [tsId]: {
                                            id: tsId,
                                            type: 'textSpan',
                                            borderPoints: selectedElement.borderPoints || null,
                                            content: null,
                                            isBold: false,
                                            isItalic: false,
                                            textColor: '#000000',
                                            textEffect: null
                                        }
                                    },
                                    edge: {
                                        ...prev.edge,
                                        [edgeId]: { id: edgeId, source: selectedElement.id, target: tsId, relation: 'hasTextSpan' }
                                    }
                                }));
                            }}
                            className="w-full text-[10px] font-bold px-2 py-1 rounded border transition-colors"
                            style={{ borderColor: '#A0A0A0', color: '#4a4a4a' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#D3D3D3'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                            title="Keyboard shortcut: C → N"
                        >
                            + Create TextSpan{' '}
                            <span className="opacity-40 font-mono">[C→N]</span>
                        </button>
                    </div>
                </div>
            )}

            {/* SECTION ONOMATOPOEIA */}
            {selectedElement.type === 'onomatopoeia' && (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Content</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            value={selectedElement.content || ""}
                            onChange={(e) => handleNodeFieldChange('content', e.target.value || null)}
                            placeholder="BANG, SPLASH, CRASH..."
                        />
                    </div>
                    <TileSelect
                        label="Category"
                        value={selectedElement.category || null}
                        options={[
                            { value: 'ambient-emotion',    label: 'Ambient emotion' },
                            { value: 'animal-sound',       label: 'Animal sound' },
                            { value: 'creaking',           label: 'Creaking' },
                            { value: 'cry',                label: 'Cry' },
                            { value: 'human-emotion',      label: 'Human emotion' },
                            { value: 'human-noise',        label: 'Human noise' },
                            { value: 'impact-explosion',   label: 'Impact / Explosion' },
                            { value: 'nature-sound',       label: 'Nature sound' },
                            { value: 'symbol',             label: 'Symbol' },
                            { value: 'technological-sound',label: 'Technological sound' },
                        ]}
                        onChange={(v) => handleNodeFieldChange('category', v)}
                        color="#296a2b"
                        borderColor="#296a2b"
                    />

                    {/* --- HAS ORIGIN (emittedBy) --- */}
                    {(() => {
                        const allEdges = Object.values(jsonContent?.edge || {});
                        const allNodes = jsonContent?.node || {};

                        const parentEdge = allEdges.find(e => e.relation === 'hasOnomatopoeia' && e.target === selectedElement.id);
                        const parentLevelId = parentEdge?.source;

                        const speakersPool = parentLevelId ? [
                            ...allEdges.filter(e => e.relation === 'hasCharacter' && e.source === parentLevelId).map(e => allNodes[e.target]),
                            ...allEdges.filter(e => e.relation === 'hasObject' && e.source === parentLevelId).map(e => allNodes[e.target]),
                        ].filter(Boolean) : [];

                        if (speakersPool.length === 0) return null;

                        const getNodeName = (node) => {
                            if (node.type === 'character') {
                                const edge = allEdges.find(e => e.relation === 'isCharacter' && e.source === node.id);
                                return (edge ? allNodes[edge.target]?.name : null) || node.name || node.id;
                            }
                            if (node.type === 'object') {
                                const edge = allEdges.find(e => e.relation === 'isObject' && e.source === node.id);
                                return (edge ? allNodes[edge.target]?.name : null) || node.name || node.id;
                            }
                            return node.name || node.id;
                        };

                        const enriched = speakersPool.map(n => ({ ...n, metaCharacterName: getNodeName(n) }));
                        const currentOriginIds = new Set(
                            allEdges.filter(e => e.relation === 'hasOrigin' && e.source === selectedElement.id).map(e => e.target)
                        );
                        const origins   = enriched.filter(n => currentOriginIds.has(n.id));
                        const available = enriched.filter(n => !currentOriginIds.has(n.id));

                        const handleAdd = (nodeId) => {
                            setJsonContent(prev => {
                                const newEdgeId = `edge_hasOrigin_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
                                return { ...prev, edge: { ...prev.edge, [newEdgeId]: { id: newEdgeId, source: selectedElement.id, target: nodeId, relation: 'hasOrigin' } } };
                            });
                        };

                        const handleRemove = (nodeId) => {
                            setJsonContent(prev => {
                                const nextEdges = { ...prev.edge };
                                const eid = Object.keys(nextEdges).find(k =>
                                    nextEdges[k].relation === 'hasOrigin' && nextEdges[k].source === selectedElement.id && nextEdges[k].target === nodeId
                                );
                                if (eid) delete nextEdges[eid];
                                return { ...prev, edge: nextEdges };
                            });
                        };

                        return (
                            <div className="flex flex-col gap-1.5 border-t pt-2" style={{ borderColor: '#296a2b' }}>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Emitted by</span>
                                    <ParticipantDropdown btnLabel="Origin" available={available} onAdd={handleAdd} />
                                </div>
                                {origins.length === 0 && (
                                    <span className="text-[10px] text-gray-400 italic">No origin linked</span>
                                )}
                                {origins.map(n => (
                                    <ParticipantRow key={n.id} node={n} onRemove={() => handleRemove(n.id)} />
                                ))}
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* ONOMATOPOEIA - LEVEL */}
            {selectedElement.type === 'onomatopoeia' && (() => {
                const allEdges = Object.values(jsonContent?.edge || {});
                const allNodes = jsonContent?.node || {};

                // All hasOnomatopoeia edges pointing to this ono where source is a level
                const currentLevelEdges = allEdges.filter(
                    e => e.relation === 'hasOnomatopoeia' && e.target === selectedElement.id && allNodes[e.source]?.type === 'level'
                );
                if (currentLevelEdges.length === 0) return null;
                const currentLevelIds = new Set(currentLevelEdges.map(e => e.source));

                // level → panel → plate (using first linked level)
                const firstLevelId = currentLevelEdges[0].source;
                const panelEdge = allEdges.find(e => e.relation === 'hasLevel' && e.target === firstLevelId);
                const plateEdge = panelEdge
                    ? allEdges.find(e => e.relation === 'hasPanel' && e.target === panelEdge.source)
                    : null;
                const plateId = plateEdge?.source;

                const pagePanelIds = plateId
                    ? allEdges.filter(e => e.relation === 'hasPanel' && e.source === plateId).map(e => e.target)
                    : (panelEdge ? [panelEdge.source] : []);

                const isPointInBBox = (bpString, px, py) => {
                    if (!bpString) return false;
                    const pts = bpString.split(' ').map(p => p.split(',').map(Number));
                    const xs = pts.map(p => p[0]);
                    const ys = pts.map(p => p[1]);
                    return px >= Math.min(...xs) && px <= Math.max(...xs) &&
                           py >= Math.min(...ys) && py <= Math.max(...ys);
                };

                const onoPoints = selectedElement.borderPoints
                    ? selectedElement.borderPoints.split(' ').map(p => p.split(',').map(Number))
                    : [];

                const candidateLevels = [];
                const seenLevelIds = new Set();
                for (const panelId of pagePanelIds) {
                    const panel = allNodes[panelId];
                    if (!panel) continue;
                    if (!onoPoints.some(([px, py]) => isPointInBBox(panel.borderPoints, px, py))) continue;
                    allEdges
                        .filter(e => e.relation === 'hasLevel' && e.source === panelId)
                        .map(e => allNodes[e.target])
                        .filter(Boolean)
                        .forEach(lvl => {
                            if (!seenLevelIds.has(lvl.id)) {
                                seenLevelIds.add(lvl.id);
                                candidateLevels.push(lvl);
                            }
                        });
                }

                // Always include already-linked levels even if spatial check fails
                currentLevelEdges.forEach(e => {
                    const lvl = allNodes[e.source];
                    if (lvl && !seenLevelIds.has(lvl.id)) {
                        seenLevelIds.add(lvl.id);
                        candidateLevels.unshift(lvl);
                    }
                });

                if (candidateLevels.length === 0) return null;

                const handleAddLevel = (levelId) => {
                    setJsonContent(prev => {
                        const newEdgeId = `edge_hasOnomatopoeia_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
                        return {
                            ...prev,
                            edge: { ...prev.edge, [newEdgeId]: { id: newEdgeId, source: levelId, target: selectedElement.id, relation: 'hasOnomatopoeia' } }
                        };
                    });
                };

                const handleRemoveLevel = (levelId) => {
                    setJsonContent(prev => {
                        const nextEdges = { ...prev.edge };
                        const edgeId = Object.keys(nextEdges).find(eid =>
                            nextEdges[eid].relation === 'hasOnomatopoeia' &&
                            nextEdges[eid].source === levelId &&
                            nextEdges[eid].target === selectedElement.id
                        );
                        if (edgeId) delete nextEdges[edgeId];
                        return { ...prev, edge: nextEdges };
                    });
                };

                return (
                    <div className="flex flex-col gap-2 border-t border-gray-100 pt-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Level</span>
                        <div className="flex flex-col gap-1">
                            {candidateLevels.map(level => {
                                const isLinked = currentLevelIds.has(level.id);
                                return (
                                    <div
                                        key={level.id}
                                        className={`flex items-center justify-between rounded px-2 py-1 border transition-colors ${
                                            isLinked
                                                ? 'bg-orange-100 border-orange-400'
                                                : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                                        }`}
                                    >
                                        <span className="text-[10px] font-mono text-orange-700 truncate max-w-[130px]">{level.id}</span>
                                        {isLinked ? (
                                            <button
                                                onClick={() => handleRemoveLevel(level.id)}
                                                className="text-[10px] font-bold text-red-400 hover:text-red-600 shrink-0 ml-1 px-1"
                                                title="Retirer ce level"
                                            >✕</button>
                                        ) : (
                                            <button
                                                onClick={() => handleAddLevel(level.id)}
                                                className="text-[10px] font-bold text-orange-400 hover:text-orange-600 shrink-0 ml-1 px-1"
                                                title="Lier à ce level"
                                            >+</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* SECTION TEXTSPAN */}
            {selectedElement.type === 'textSpan' && (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Content</label>
                        <input
                            ref={contentInputRef}
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            value={selectedElement.content || ""}
                            onChange={(e) => handleNodeFieldChange('content', e.target.value || null)}
                            placeholder="Text content..."
                        />
                    </div>
                    <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
                        {[
                            { field: 'isBold', label: 'Bold' },
                            { field: 'isItalic', label: 'Italic' },
                        ].map(({ field, label }) => (
                            <label key={field} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!selectedElement[field]}
                                    onChange={(e) => handleNodeFieldChange(field, e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <span className="text-xs text-gray-600">{label}</span>
                            </label>
                        ))}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Text effect</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            value={selectedElement.textEffect || ""}
                            onChange={(e) => handleNodeFieldChange('textEffect', e.target.value || null)}
                            placeholder="E.g.: yellow circle, drop shadow..."
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Text color</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                className="w-8 h-8 rounded border cursor-pointer p-0.5 bg-white"
                                style={{ borderColor: '#808080' }}
                                value={selectedElement.textColor && selectedElement.textColor.startsWith('#') ? selectedElement.textColor : '#000000'}
                                onChange={(e) => handleNodeFieldChange('textColor', e.target.value)}
                            />
                            <div
                                className="flex-1 flex items-center justify-between rounded px-2 py-1 border"
                                style={{ borderColor: selectedElement.textColor ? '#808080' : '#80808088', backgroundColor: selectedElement.textColor ? '#80808033' : '#80808015' }}
                            >
                                <input
                                    type="text"
                                    className="text-[10px] font-bold bg-transparent outline-none w-full"
                                    style={{ color: '#4a4a4a' }}
                                    value={selectedElement.textColor || ""}
                                    onChange={(e) => handleNodeFieldChange('textColor', e.target.value || null)}
                                    placeholder="— Not defined —"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION CAPTION */}
            {selectedElement.type === 'caption' && (
                <div className="flex flex-col gap-3">
                    <TileSelect
                        label="Caption type"
                        value={selectedElement.captionType || null}
                        options={[
                            { value: 'Narrative', label: 'Narrative' },
                            { value: 'Effect', label: 'Effect' },
                            { value: 'Internal', label: 'Internal' },
                        ]}
                        onChange={(v) => handleNodeFieldChange('captionType', v)}
                        color="#b03a8e"
                        borderColor="#ffadf2"
                    />

                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Background color</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                className="w-8 h-8 rounded border cursor-pointer p-0.5 bg-white"
                                style={{ borderColor: '#ffadf2' }}
                                value={selectedElement.backgroundColor && selectedElement.backgroundColor.startsWith('#') ? selectedElement.backgroundColor : '#ffffff'}
                                onChange={(e) => handleNodeFieldChange('backgroundColor', e.target.value)}
                            />
                            <div
                                className="flex-1 flex items-center justify-between rounded px-2 py-1 border"
                                style={{ borderColor: selectedElement.backgroundColor ? '#ffadf2' : '#ffadf288', backgroundColor: selectedElement.backgroundColor ? '#ffadf233' : '#ffadf215' }}
                            >
                                <input
                                    type="text"
                                    className="text-[10px] font-bold bg-transparent outline-none w-full"
                                    style={{ color: '#b03a8e' }}
                                    value={selectedElement.backgroundColor || ""}
                                    onChange={(e) => handleNodeFieldChange('backgroundColor', e.target.value || null)}
                                    placeholder="— Not defined —"
                                />
                            </div>
                        </div>
                    </div>

                    <MentionSection
                        elementId={selectedElement.id}
                        jsonContent={jsonContent}
                        setJsonContent={setJsonContent}
                        borderColor="#ffadf2"
                    />
                </div>
            )}

            {/* PROPRIÉTÉS GÉNÉRIQUES */}
            <div className="space-y-1">
                {Object.entries(selectedElement).map(([key, value]) => {
                    if (selectedElement.type === 'panel' && PANEL_EDITABLE_FIELDS.includes(key)) return null;
                    if (selectedElement.type === 'balloon' && BALLOON_EDITABLE_FIELDS.includes(key)) return null;
                    if (selectedElement.type === 'caption' && CAPTION_EDITABLE_FIELDS.includes(key)) return null;
                    if (selectedElement.type === 'textLine' && TEXTLINE_EDITABLE_FIELDS.includes(key)) return null;
                    if (selectedElement.type === 'textSpan' && TEXTSPAN_EDITABLE_FIELDS.includes(key)) return null;
                    if (selectedElement.type === 'onomatopoeia' && ONOMATOPOEIA_EDITABLE_FIELDS.includes(key)) return null;
                    if (selectedElement.type === 'object' && OBJECT_EDITABLE_FIELDS.includes(key)) return null;
                    return (
                        <div key={key} className="flex justify-between items-center">
                            <span className="font-semibold text-gray-400 text-[10px] uppercase">{key}:</span>
                            <span className="text-gray-800 font-mono truncate max-w-[120px] text-[10px]">
                                {value === null ? 'null' : typeof value === 'object' ? '...' : String(value)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Infobox;
