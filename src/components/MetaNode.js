import React, { useState } from 'react';

const MetaNode = ({ showMetaNode, setShowMetaNode, jsonContent, setJsonContent }) => {
    // État local pour le formulaire d'ajout
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState("metaCharacter");

    // États pour l'édition d'un noeud existant
    const [editingId, setEditingId] = useState(null);
    const [tempName, setTempName] = useState("");
    const [tempConfidence, setTempConfidence] = useState(null);

    if (!showMetaNode) return null;

    const isMetaChar = (type) => type === 'metaCharacter';
    const isMetaObj  = (type) => type === 'metaObject';

    const metaNodes = jsonContent && jsonContent.node
        ? Object.values(jsonContent.node).filter(node => isMetaChar(node.type) || isMetaObj(node.type))
        : [];

    // --- Actions ---

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setJsonContent((prevJson) => {
            const currentJson = prevJson ? { ...prevJson } : { node: {} };
            const prefix = newType === 'metaCharacter' ? 'metaCharacter' : 'metaObject';
        const id = `${prefix}_${Date.now()}`;
            return {
                ...currentJson,
                node: {
                    ...currentJson.node,
                    [id]: { id, name: newName, type: newType }
                }
            };
        });
        setNewName("");
    };

    const handleDelete = (idToDelete) => {
        if(!window.confirm("Delete this meta node?")) return;
        setJsonContent((prevJson) => {
            const nextNodes = { ...prevJson.node };
            delete nextNodes[idToDelete];
            return { ...prevJson, node: nextNodes };
        });
    };

    const startEditing = (node) => {
        setEditingId(node.id);
        setTempName(node.name);
        setTempConfidence(node.confidence !== undefined ? node.confidence : null);
    };

    const saveEdit = (id) => {
        if (!tempName.trim()) return;
        const nodeToSave = jsonContent.node[id];
        const updatedNode = { ...nodeToSave, name: tempName };

        // Ajouter confidence seulement pour les metaCharacters
        if (isMetaChar(nodeToSave.type) && tempConfidence !== null) {
            updatedNode.confidence = tempConfidence;
        }

        setJsonContent((prevJson) => ({
            ...prevJson,
            node: {
                ...prevJson.node,
                [id]: updatedNode
            }
        }));
        setEditingId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setTempName("");
        setTempConfidence(null);
    };

    return (
        <div className="w-1/4 h-full bg-white border-l border-gray-200 flex flex-col transition-all z-50 shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 ">
                <span className="text-gray-500 uppercase text-xs font-bold tracking-widest">Meta Nodes</span>
                <button onClick={() => setShowMetaNode(false)} className="text-gray-400 hover:text-red-600">✕</button>
            </div>

            {/* Formulaire d'ajout */}
            <div className="p-4 border-b border-gray-100">
                <form onSubmit={handleAdd} className="flex flex-col gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">New node name</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-red-500"
                            placeholder="E.g.: Gandalf"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Type</label>
                        <select
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-red-500"
                        >
                            <option value="metaCharacter">Character</option>
                            <option value="metaObject">Object</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={!newName.trim()}
                        className="bg-red-600 text-white text-xs font-bold py-2 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                        ADD NODE
                    </button>
                </form>
            </div>

            {/* Liste des items */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-tighter">List ({metaNodes.length})</h3>

                <div className="space-y-3">
                    {metaNodes.map((node) => (
                        <div key={node.id} className="bg-white border border-gray-200 p-3 rounded shadow-sm group">
                            {editingId === node.id ? (
                                // --- MODE ÉDITION ---
                                <div className="space-y-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(node.id)}
                                        className="w-full border-b-2 border-red-500 px-1 py-1 text-sm outline-none font-medium"
                                    />
                                    {/* Score de confiance pour les metaCharacters */}
                                    {isMetaChar(node.type) && (
                                        <div className="mt-2">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                                                Confidence: {tempConfidence !== null ? `${Math.round(tempConfidence * 100)}%` : 'Not defined'}
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={tempConfidence !== null ? tempConfidence * 100 : 50}
                                                    onChange={(e) => setTempConfidence(parseInt(e.target.value) / 100)}
                                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setTempConfidence(null)}
                                                    className="text-[9px] text-gray-400 hover:text-red-500"
                                                    title="Reset"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <button onClick={() => saveEdit(node.id)} className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-bold uppercase">Save</button>
                                        <button onClick={cancelEdit} className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold uppercase">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                // --- MODE AFFICHAGE ---
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-sm text-gray-800">{node.name}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded inline-block font-bold"
                                                 style={{
                                                     backgroundColor: isMetaChar(node.type) ? '#f3e8ff' : '#ffedd5',
                                                     color: isMetaChar(node.type) ? '#6b21a8' : '#c2410c'
                                                 }}>
                                                {isMetaChar(node.type) ? 'Character' : 'Object'}
                                            </div>
                                            {/* Afficher le score de confiance pour les characters */}
                                            {isMetaChar(node.type) && node.confidence !== undefined && (
                                                <div className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-purple-100 text-purple-700">
                                                    {Math.round(node.confidence * 100)}% confidence
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEditing(node)}
                                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                            title="Edit name"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(node.id)}
                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MetaNode;