import React from 'react';

const Footer = ({ currentIndex, totalImages, goToPrevious, goToNext, redFilter }) => {
    return (
        <div className="h-16 border-t border-gray-200 bg-white flex items-center justify-between px-8 flex-shrink-0 z-10">
            <div className="font-montserrat text-sm font-medium text-gray-500">
                <span className="text-red-700 font-bold">{currentIndex + 1}</span> / {totalImages}
            </div>

            <div className="flex items-center gap-2">
                <button onClick={goToPrevious} className="p-2 rounded-md transition-all hover:bg-gray-100">
                    <img
                        src="/icon/chevron-left-svgrepo-com.svg"
                        alt="Previous"
                        className="w-6 h-6"
                        style={{ filter: redFilter }}
                    />
                </button>
                <button onClick={goToNext} className="p-2 rounded-md transition-all hover:bg-gray-100">
                    <img
                        src="/icon/chevron-right-svgrepo-com.svg"
                        alt="Next"
                        className="w-6 h-6"
                        style={{ filter: redFilter }}
                    />
                </button>
            </div>
        </div>
    );
};

export default Footer;