import React from 'react';
import { useUI } from '../contexts/UIContext';

const NavigationGraphMode = ({ panelNeighbours, setPanelNeighbours, onStartNavigation, isNavigating, onStopNavigation, onNextNode, onPreviousNode, currentPanelIndex, totalPanels }) => {
    const { showGraphNavigation, setShowGraphNavigation } = useUI();

    if (!showGraphNavigation) return null;

    return (
        <div className="w-1/4 h-full bg-white border-l border-gray-200 flex flex-col transition-all z-50 shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <span className="text-gray-500 uppercase text-xs font-bold tracking-widest">
                    Navigation
                </span>
                <button
                    onClick={() => setShowGraphNavigation(false)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                >
                    ✕
                </button>
            </div>

            {/* Body Content */}
            <div className="p-4 flex flex-col gap-6">

                {/* Bouton Démarrer / Arrêter */}
                {isNavigating ? (
                    <button
                        onClick={onStopNavigation}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        </svg>
                        Stop navigation
                    </button>
                ) : (
                    <button
                        onClick={onStartNavigation}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Start navigation
                    </button>
                )}

                {/* Boutons Précédent / Suivant - affichés uniquement si navigation active */}
                {isNavigating && (
                    <>
                        <hr className="border-gray-100" />

                        {/* Affichage du numéro de panel dans l'ordre de lecture */}
                        {currentPanelIndex && totalPanels > 0 && (
                            <div className="flex justify-center items-center py-2">
                                <span className="text-lg font-semibold text-gray-700">
                                    Panel {currentPanelIndex} / {totalPanels}
                                </span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={onPreviousNode}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 transform active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Previous
                            </button>
                            <button
                                onClick={onNextNode}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 transform active:scale-95"
                            >
                                Next
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default NavigationGraphMode;