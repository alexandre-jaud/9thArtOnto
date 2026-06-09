import { useState, useRef, useEffect } from 'react';
import { UIProvider, useUI } from './contexts/UIContext';
import Header from './components/Header';
import { jsonToTurtle } from './utils/jsonToTurtle';
import GraphPanel from "./components/GraphPanel";
import PagesPanel from "./components/PagesPanel";

const redFilter = 'invert(8%) sepia(95%) saturate(3448%) hue-rotate(351deg) brightness(115%) contrast(94%)';

const downloadBlob = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
};

function AppShell() {
    const { setCurrentIndex, showOntology, setShowOntology, showPages, setShowPages, setShowSettings } = useUI();

    const [images, setImages] = useState([]);
    const [jsonContent, setJsonContent] = useState(null);
    const inputRef = useRef(null);

    const [shownElements, setShownElements] = useState([]);
    const [elements, setElements] = useState([]);

    useEffect(() => {
        const BASE = '/dataset/Patents';
        const autoLoad = async () => {
            const imageNames = await fetch(`${BASE}/manifest.json`).then(r => r.json());
            setImages(imageNames.map(name => ({ name, url: `${BASE}/${name}` })));
            setCurrentIndex(0);
            const content = await fetch(`${BASE}/graph.json`).then(r => r.json());
            setJsonContent(content);
            const uniqueRelations = content.edge ? [...new Set(Object.values(content.edge).map(e => e.relation))] : [];
            const uniqueTypes = content.node ? [...new Set(Object.values(content.node).map(e => e.type))] : [];
            const allTypes = [...uniqueRelations, ...uniqueTypes];
            setShownElements(allTypes);
            setElements(allTypes);
        };
        autoLoad().catch(console.error);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.altKey && e.key === 'S') {
                e.preventDefault();
                setShowSettings(s => !s);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setShowSettings]);

    useEffect(() => {
        if (!jsonContent) return;
        const uniqueRelations = jsonContent.edge ? [...new Set(Object.values(jsonContent.edge).map(e => e.relation))] : [];
        const uniqueTypes = jsonContent.node ? [...new Set(Object.values(jsonContent.node).map(e => e.type))] : [];
        const allTypes = [...uniqueRelations, ...uniqueTypes];

        setElements(prev => {
            const newEntries = allTypes.filter(t => !prev.includes(t));
            if (newEntries.length === 0) return prev;
            setShownElements(s => [...s, ...newEntries]);
            return [...prev, ...newEntries];
        });
    }, [jsonContent]);

    const handleFolderSelect = (event) => {
        const files = Array.from(event.target.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        images.forEach(img => URL.revokeObjectURL(img.url));

        const imagesWithUrls = imageFiles.map(file => ({
            name: file.name,
            url: URL.createObjectURL(file)
        }));
        setImages(imagesWithUrls);
        setCurrentIndex(0);

        const jsonFile = files.find(file => file.name === "graph.json");
        if (jsonFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = JSON.parse(e.target.result);
                    console.log("JSON Loaded:", content);
                    setJsonContent(content);

                    const uniqueRelations = content.edge ? [...new Set(Object.values(content.edge).map(e => e.relation))] : [];
                    const uniqueTypes = content.node ? [...new Set(Object.values(content.node).map(e => e.type))] : [];
                    const allTypes = [...uniqueRelations, ...uniqueTypes];
                    setShownElements(allTypes);
                    setElements(allTypes);
                } catch (err) {
                    console.error("Erreur de lecture du JSON", err);
                }
            };
            reader.readAsText(jsonFile);
        } else {
            setJsonContent(null);
            setElements([]);
            setShownElements([]);
        }
    };

    const handleSaveJson = () => {
        if (!jsonContent) { alert("Rien à sauvegarder !"); return; }
        downloadBlob(JSON.stringify(jsonContent, null, 2), "graph.json", "application/json");
    };

    const handleSaveTtl = () => {
        if (!jsonContent) { alert("Rien à sauvegarder !"); return; }
        downloadBlob(jsonToTurtle(jsonContent), "graph.ttl", "text/turtle");
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white relative">
            <Header
                inputRef={inputRef}
                handleFolderSelect={handleFolderSelect}
                handleSaveJson={handleSaveJson}
                handleSaveTtl={handleSaveTtl}
                redFilter={redFilter}
            />

            <div className="flex flex-1 min-h-0 overflow-hidden relative">
                <GraphPanel
                    jsonContent={jsonContent}
                    setJsonContent={setJsonContent}
                    images={images}
                    shownElements={shownElements}
                    setShownElements={setShownElements}
                    elements={elements}
                />
            </div>

            {showPages && (
                <div
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 10000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    onClick={() => setShowPages(false)}
                >
                    <div
                        style={{
                            width: '90vw', height: '90vh',
                            background: 'white', borderRadius: '12px',
                            overflow: 'hidden', position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
                            display: 'flex', flexDirection: 'column',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <span style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>Pages</span>
                            <button
                                onClick={() => setShowPages(false)}
                                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6b7280', lineHeight: 1 }}
                            >✕</button>
                        </div>
                        <PagesPanel images={images} />
                    </div>
                </div>
            )}
            {showOntology && (
                <div
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 10000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    onClick={() => setShowOntology(false)}
                >
                    <div
                        style={{
                            width: '90vw', height: '90vh',
                            background: 'white', borderRadius: '12px',
                            overflow: 'hidden', position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowOntology(false)}
                            style={{
                                position: 'absolute', top: 10, right: 14,
                                zIndex: 1, background: 'none', border: 'none',
                                fontSize: '22px', cursor: 'pointer', color: '#6b7280',
                                lineHeight: 1,
                            }}
                            title="Fermer"
                        >✕</button>
                        <iframe
                            src="/ontology.html"
                            title="SequArtOnto"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function App() {
    return (
        <UIProvider>
            <AppShell />
        </UIProvider>
    );
}

export default App;