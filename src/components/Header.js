import React from 'react';
import { useUI } from '../contexts/UIContext';

const iconDark   = 'brightness(0) saturate(100%) invert(7%) sepia(30%) saturate(600%) hue-rotate(210deg)';
const iconDimmed = 'brightness(0) saturate(100%) invert(7%) sepia(30%) saturate(600%) hue-rotate(210deg) opacity(0.35)';

const NavBtn = ({ onClick, active, title, children }) => (
    <button
        onClick={onClick}
        title={title}
        style={{
            width: 34,
            height: 34,
            borderRadius: '5px',
            border: '3px solid #1a1a2e',
            cursor: 'pointer',
            background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}
    >
        {children}
    </button>
);

const Header = ({ inputRef, handleFolderSelect, handleSaveJson, handleSaveTtl }) => {
    const {
        showFilterGraphMode, setShowFilterGraphMode,
        showGraphNavigation, setShowGraphNavigation,
        showOntology, setShowOntology,
        showPages, setShowPages,
        presentationMode,
    } = useUI();

    const stripeStyle = {
        background: `repeating-linear-gradient(
            -45deg,
            #e63022 0px,
            #e63022 8px,
            #c9281e 8px,
            #c9281e 10px
        )`,
    };

    return (
        <nav
            id="navigation_bar"
            style={{
                ...stripeStyle,
                padding: '10px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                borderBottom: '3px solid #1a1a2e',
            }}
        >
            {/* Titre */}
            <span style={{ fontFamily: "'Mochiy Pop One', sans-serif", fontSize: '20px', color: 'white', letterSpacing: '0.02em', textShadow: '2px 2px 0px #1a1a2e, 4px 4px 0px rgba(26,26,46,0.3)' }}>
                9<sup style={{ fontSize: '11px', verticalAlign: 'super' }}>th</sup>Art<span style={{ color: '#ffbf00' }}>Onto</span>
            </span>

            {/* Outils */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {!presentationMode && (
                    <button
                        onClick={() => inputRef.current.click()}
                        style={{
                            fontFamily: 'Montserrat, sans-serif',
                            padding: '6px 14px',
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.6)',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: 600,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginRight: '8px',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    >
                        Select a folder
                    </button>
                )}
                <input
                    type="file"
                    ref={inputRef}
                    onChange={handleFolderSelect}
                    webkitdirectory="true"
                    directory="true"
                    multiple
                    className="hidden"
                />

                <NavBtn onClick={() => setShowPages(!showPages)} active={showPages} title="Pages">
                    <img src="/icon/book-svgrepo-com.svg" alt="Pages" style={{ width: 20, height: 20, filter: iconDark }} />
                </NavBtn>

                <NavBtn onClick={() => setShowGraphNavigation(!showGraphNavigation)} active={showGraphNavigation} title="Navigation">
                    <img src="/icon/boat-svgrepo-com.svg" alt="Navigation" style={{ width: 20, height: 20, filter: iconDark }} />
                </NavBtn>

                <NavBtn onClick={() => setShowFilterGraphMode(!showFilterGraphMode)} active={showFilterGraphMode} title="Filter">
                    <img src="/icon/filter-svgrepo-com.svg" alt="Filter" style={{ width: 20, height: 20, filter: iconDark }} />
                </NavBtn>

                <NavBtn onClick={handleSaveJson} active={false} title="Download JSON">
                    <img src="/icon/save-svgrepo-com.svg" alt="Download JSON" style={{ width: 20, height: 20, filter: iconDark }} />
                </NavBtn>
                {!presentationMode && (
                    <NavBtn onClick={handleSaveTtl} active={false} title="Save Turtle (.ttl)">
                        <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'monospace', color: '#1a1a2e', letterSpacing: '-0.05em', lineHeight: 1 }}>TTL</span>
                    </NavBtn>
                )}

                <NavBtn onClick={() => setShowOntology(!showOntology)} active={showOntology} title="SequArtOnto – Ontology helper">
                    <img src="/icon/help-svgrepo-com.svg" alt="Ontology" style={{ width: 20, height: 20, filter: iconDark }} />
                </NavBtn>
            </div>
        </nav>
    );
};

export default Header;
