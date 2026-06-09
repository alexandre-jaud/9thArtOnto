import React from 'react';
import { NodeIcon } from '../nodeStyles';
import { useUI } from '../contexts/UIContext';

const FilterGraphMode = ({ elements, shownElements, setShownElements, jsonContent, setJsonContent }) => {
    const { showFilterGraphMode: showFilter, setShowFilterGraphMode: setShowFilter } = useUI();

    if (!showFilter) return null;

    const nodeTypesSet = new Set(
        jsonContent?.node ? Object.values(jsonContent.node).map(n => n.type).filter(Boolean) : []
    );
    const edgeTypesSet = new Set(
        jsonContent?.edge ? Object.values(jsonContent.edge).map(e => e.relation).filter(Boolean) : []
    );

    const nodeTypes = elements.filter(el => nodeTypesSet.has(el));
    const edgeTypes = elements.filter(el => edgeTypesSet.has(el) && !nodeTypesSet.has(el));

    const toggleElement = (name) => {
        setShownElements(prev =>
            prev.includes(name) ? prev.filter(el => el !== name) : [...prev, name]
        );
    };

    const toggleAll = (items, activate) => {
        setShownElements(prev =>
            activate
                ? [...new Set([...prev, ...items])]
                : prev.filter(el => !items.includes(el))
        );
    };

    const deleteAllOfType = (type) => {
        const count = Object.values(jsonContent?.node || {}).filter(n => n.type === type).length;
        if (count === 0) return;
        if (!window.confirm(`Delete all ${count} "${type}" nodes and their edges?`)) return;

        setJsonContent(prev => {
            const idsToDelete = new Set(
                Object.entries(prev.node || {})
                    .filter(([, n]) => n.type === type)
                    .map(([id]) => id)
            );
            return {
                ...prev,
                node: Object.fromEntries(Object.entries(prev.node || {}).filter(([id]) => !idsToDelete.has(id))),
                edge: Object.fromEntries(Object.entries(prev.edge || {}).filter(([, e]) => !idsToDelete.has(e.source) && !idsToDelete.has(e.target))),
            };
        });
        setShownElements(prev => prev.filter(el => el !== type));
    };

    const NodeSection = ({ items }) => {
        if (items.length === 0) return null;
        const allActive = items.every(el => shownElements.includes(el));
        return (
            <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Nodes</span>
                    <button
                        onClick={() => toggleAll(items, !allActive)}
                        className={`text-[10px] ${allActive ? 'text-red-500' : 'text-blue-500'} hover:underline`}
                    >
                        {allActive ? 'Uncheck all' : 'Check all'}
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                    {items.map(el => {
                        const isActive = shownElements.includes(el);
                        const count = Object.values(jsonContent?.node || {}).filter(n => n.type === el).length;
                        return (
                            <div key={el} className="flex items-center gap-1">
                                <button
                                    onClick={() => toggleElement(el)}
                                    className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium text-left transition-all border ${
                                        isActive
                                            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                                            : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
                                    }`}
                                >
                                    <NodeIcon type={el} size={22} />
                                    <span className="flex-1">{el}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-gray-300 text-gray-500'}`}>
                                        {count}
                                    </span>
                                </button>
                                <button
                                    onClick={() => deleteAllOfType(el)}
                                    title={`Delete all "${el}" nodes`}
                                    className="p-1.5 rounded border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-400 transition-colors text-xs"
                                >
                                    🗑
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const EdgeSection = ({ items }) => {
        if (items.length === 0) return null;
        const allActive = items.every(el => shownElements.includes(el));
        return (
            <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Edges</span>
                    <button
                        onClick={() => toggleAll(items, !allActive)}
                        className={`text-[10px] ${allActive ? 'text-red-500' : 'text-blue-500'} hover:underline`}
                    >
                        {allActive ? 'Uncheck all' : 'Check all'}
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                    {items.map(el => {
                        const isActive = shownElements.includes(el);
                        return (
                            <button
                                key={el}
                                onClick={() => toggleElement(el)}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium text-left transition-all border ${
                                    isActive
                                        ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                                        : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
                                }`}
                            >
                                <svg width={22} height={22} viewBox="0 0 22 22" className="shrink-0">
                                    <line x1={2} y1={11} x2={20} y2={11} stroke={isActive ? '#fff' : '#9ca3af'} strokeWidth={2} />
                                    <polygon points="20,11 15,8 15,14" fill={isActive ? '#fff' : '#9ca3af'} />
                                </svg>
                                <span>{el}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="w-1/4 h-full bg-white border-l border-gray-200 flex flex-col transition-all z-50 shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <span className="text-gray-500 uppercase text-xs font-bold tracking-widest">Display Filters</span>
                <button onClick={() => setShowFilter(false)} className="text-gray-400 hover:text-red-600 transition-colors">✕</button>
            </div>

            <div className="p-4 overflow-y-auto">
                <div className="flex justify-between mb-4">
                    <button onClick={() => setShownElements(elements)} className="text-xs text-blue-600 hover:underline">
                        Check all
                    </button>
                    <button onClick={() => setShownElements([])} className="text-xs text-red-600 hover:underline">
                        Uncheck all
                    </button>
                </div>

                <NodeSection items={nodeTypes} />
                <EdgeSection items={edgeTypes} />

                {elements.length === 0 && (
                    <p className="text-sm text-gray-400 italic text-center mt-10">
                        No data to filter. Load a graph.json file.
                    </p>
                )}
            </div>
        </div>
    );
};

export default FilterGraphMode;