import React from 'react';
import { useUI } from '../contexts/UIContext';

const Toggle = ({ checked, onChange, label }) => (
    <label className="flex items-center justify-between cursor-pointer gap-4">
        <span className="text-sm text-gray-700">{label}</span>
        <div
            onClick={onChange}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-red-600' : 'bg-gray-300'}`}
        >
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
    </label>
);

const SettingsPanel = () => {
    const { showSettings, setShowSettings, presentationMode, setPresentationMode } = useUI();

    const [defaultMode, setDefaultMode] = React.useState(
        () => localStorage.getItem('defaultMode') || 'book'
    );

    const handleDefaultModeChange = (value) => {
        setDefaultMode(value);
        localStorage.setItem('defaultMode', value);
    };

    if (!showSettings) return null;

    return (
        <div className="w-1/4 h-full bg-white border-l border-gray-200 flex flex-col z-50 shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <span className="text-gray-500 uppercase text-xs font-bold tracking-widest">
                    Settings
                </span>
                <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                >
                    ✕
                </button>
            </div>

            <div className="p-4 flex flex-col gap-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Startup</p>
                    <p className="text-sm text-gray-700 mb-2">Default mode</p>
                    <div className="flex gap-2">
                        {['book', 'graph'].map(m => (
                            <button
                                key={m}
                                onClick={() => handleDefaultModeChange(m)}
                                className={`flex-1 py-1.5 rounded text-xs font-medium border transition-all capitalize ${
                                    defaultMode === m
                                        ? 'bg-red-600 text-white border-red-600'
                                        : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                                }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Display</p>
                    <Toggle
                        checked={presentationMode}
                        onChange={() => setPresentationMode(p => {
                            localStorage.setItem('presentationMode', String(!p));
                            return !p;
                        })}
                        label="Presentation mode"
                    />
                    {presentationMode && (
                        <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                            Hides toolbar controls. Navigation, Filter and Ontology Helper remain accessible.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
