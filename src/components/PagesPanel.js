import React, { useState } from 'react';

const PagesPanel = ({ images }) => {
    const [fullscreen, setFullscreen] = useState(null);

    if (!images || images.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                No pages loaded.
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                <div className="grid grid-cols-3 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                    {images.map((img, i) => (
                        <div
                            key={img.name}
                            onClick={() => setFullscreen(i)}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-300 transition-all"
                        >
                            <img
                                src={img.url}
                                alt={img.name}
                                className="w-full object-contain"
                                style={{ maxHeight: '320px' }}
                            />
                            <div className="px-3 py-2 text-xs text-gray-400 font-mono text-center border-t border-gray-100">
                                {i + 1} / {images.length}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {fullscreen !== null && (
                <div
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.85)',
                        zIndex: 10000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    onClick={() => setFullscreen(null)}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setFullscreen(f => Math.max(0, f - 1)); }}
                        disabled={fullscreen === 0}
                        style={{
                            position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                            width: 44, height: 44, cursor: fullscreen === 0 ? 'default' : 'pointer',
                            fontSize: 22, color: 'white', opacity: fullscreen === 0 ? 0.3 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >‹</button>

                    <img
                        src={images[fullscreen].url}
                        alt={images[fullscreen].name}
                        onClick={e => e.stopPropagation()}
                        style={{ maxHeight: '90vh', maxWidth: '90vw', borderRadius: 8, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
                    />

                    <button
                        onClick={(e) => { e.stopPropagation(); setFullscreen(f => Math.min(images.length - 1, f + 1)); }}
                        disabled={fullscreen === images.length - 1}
                        style={{
                            position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                            width: 44, height: 44, cursor: fullscreen === images.length - 1 ? 'default' : 'pointer',
                            fontSize: 22, color: 'white', opacity: fullscreen === images.length - 1 ? 0.3 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >›</button>

                    <div style={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                        {fullscreen + 1} / {images.length}
                    </div>

                    <button
                        onClick={() => setFullscreen(null)}
                        style={{
                            position: 'absolute', top: 16, right: 20,
                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
                            fontSize: 26, cursor: 'pointer', lineHeight: 1,
                        }}
                    >✕</button>
                </div>
            )}
        </>
    );
};

export default PagesPanel;
