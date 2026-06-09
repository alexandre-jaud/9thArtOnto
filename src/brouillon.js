import { useState, useRef, useEffect } from 'react';

function App() {
    const [images, setImages] = useState([]);
    const [viewMode, setViewMode] = useState('gallery'); // 'gallery' ou 'single'
    const [currentIndex, setCurrentIndex] = useState(0); // L'index de la photo affichée

    const inputRef = useRef(null);

    // --- LOGIQUE DE CHARGEMENT ---
    const handleFolderSelect = (event) => {
        const files = Array.from(event.target.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        // Nettoyer les anciennes URLs pour éviter les fuites de mémoire
        images.forEach(img => URL.revokeObjectURL(img.url));

        const imagesWithUrls = imageFiles.map(file => ({
            name: file.name,
            url: URL.createObjectURL(file)
        }));

        setImages(imagesWithUrls);
        setViewMode('gallery'); // On revient à la galerie après le chargement
        setCurrentIndex(0);
    };

    // --- LOGIQUE DE NAVIGATION ---
    const goToNext = () => {
        // Le modulo (%) permet de revenir au début (0) quand on arrive à la fin
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const goToPrev = () => {
        // Si on est à 0, on repart à la dernière image
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const openSingleView = (index) => {
        setCurrentIndex(index);
        setViewMode('single');
    };

    // Gestion des touches fléchées du clavier (bonus)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (viewMode === 'single') {
                if (e.key === 'ArrowRight') goToNext();
                if (e.key === 'ArrowLeft') goToPrev();
                if (e.key === 'Escape') setViewMode('gallery');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewMode, images]); // Dépendances pour que le listener soit à jour

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', overflow: 'hidden' }}>

            {/* --- BANDEAU DU HAUT --- */}
            <div style={{ padding: '10px 20px', background: '#333', color: 'white', display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                <button onClick={() => inputRef.current.click()} style={{ cursor: 'pointer', padding: '5px 10px' }}>
                    📂 Charger Dossier
                </button>

                {/* Switcher de mode (affiché seulement si on a des images) */}
                {images.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setViewMode('gallery')}
                            style={{ fontWeight: viewMode === 'gallery' ? 'bold' : 'normal', background: viewMode === 'gallery' ? '#fff' : '#ccc' }}
                        >
                            田 Galerie
                        </button>
                        <button
                            onClick={() => setViewMode('single')}
                            style={{ fontWeight: viewMode === 'single' ? 'bold' : 'normal', background: viewMode === 'single' ? '#fff' : '#ccc' }}
                        >
                            🖼️ Photo Unique
                        </button>
                        <span style={{ marginLeft: 'auto' }}>
               {viewMode === 'single' ? `${currentIndex + 1} / ${images.length}` : `${images.length} photos`}
            </span>
                    </div>
                )}

                <input
                    type="file"
                    ref={inputRef}
                    onChange={handleFolderSelect}
                    webkitdirectory="true"
                    directory="true"
                    multiple
                    style={{ display: 'none' }}
                />
            </div>

            {/* --- ZONE PRINCIPALE --- */}
            <div style={{ flex: 1, overflow: 'auto', background: '#222', position: 'relative' }}>

                {/* MODE GALERIE */}
                {viewMode === 'gallery' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '20px', justifyContent: 'center' }}>
                        {images.map((img, index) => (
                            <img
                                key={index}
                                src={img.url}
                                onClick={() => openSingleView(index)}
                                style={{ height: '150px', cursor: 'pointer', border: '2px solid transparent', objectFit: 'cover' }}
                                onMouseOver={(e) => e.target.style.borderColor = 'white'}
                                onMouseOut={(e) => e.target.style.borderColor = 'transparent'}
                            />
                        ))}
                        {images.length === 0 && <p style={{color: 'white'}}>Aucune image chargée.</p>}
                    </div>
                )}

                {/* MODE PHOTO UNIQUE */}
                {viewMode === 'single' && images.length > 0 && (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                        {/* Bouton Précédent */}
                        <button
                            onClick={goToPrev}
                            style={{ position: 'absolute', left: '20px', fontSize: '3rem', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer', zIndex: 10 }}
                        >
                            ‹
                        </button>

                        {/* L'Image */}
                        <img
                            src={images[currentIndex].url}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />

                        {/* Bouton Suivant */}
                        <button
                            onClick={goToNext}
                            style={{ position: 'absolute', right: '20px', fontSize: '3rem', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer', zIndex: 10 }}
                        >
                            ›
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

export default App;