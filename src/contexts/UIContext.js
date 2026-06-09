import { createContext, useContext, useState } from 'react';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
    const [mode, setMode] = useState(() => localStorage.getItem('defaultMode') || 'book');
    const [viewMode, setViewMode] = useState('gallery');
    const [currentIndex, setCurrentIndex] = useState(0);

    const [showCode, setShowCode] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [showMetaNode, setShowMetaNode] = useState(false);
    const [showFilterBookMode, setShowFilterBookMode] = useState(false);
    const [showFilterGraphMode, setShowFilterGraphMode] = useState(false);
    const [showAutoBuild, setShowAutoBuild] = useState(false);
    const [showEventMenu, setShowEventMenu] = useState(false);
    const [showTimeMenu, setShowTimeMenu] = useState(false);
    const [showLocationMenu, setShowLocationMenu] = useState(false);
    const [showGraphNavigation, setShowGraphNavigation] = useState(false);
    const [showOntology, setShowOntology] = useState(false);
    const [showPages, setShowPages] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [presentationMode, setPresentationMode] = useState(() => localStorage.getItem('presentationMode') !== 'false');

    return (
        <UIContext.Provider value={{
            mode, setMode,
            viewMode, setViewMode,
            currentIndex, setCurrentIndex,
            showCode, setShowCode,
            showEditor, setShowEditor,
            showMetaNode, setShowMetaNode,
            showFilterBookMode, setShowFilterBookMode,
            showFilterGraphMode, setShowFilterGraphMode,
            showAutoBuild, setShowAutoBuild,
            showEventMenu, setShowEventMenu,
            showTimeMenu, setShowTimeMenu,
            showLocationMenu, setShowLocationMenu,
            showGraphNavigation, setShowGraphNavigation,
            showOntology, setShowOntology,
            showPages, setShowPages,
            showSettings, setShowSettings,
            presentationMode, setPresentationMode,
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const ctx = useContext(UIContext);
    if (!ctx) throw new Error('useUI must be used within UIProvider');
    return ctx;
};