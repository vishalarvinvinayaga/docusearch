import React from 'react';
import { Document, Page } from 'react-pdf';

const PDFDisplay = ({ file, numPages, setNumPages }) => {
    return (
        <div className="flex-grow h-full w-full justify-center overflow-auto bg-[#7a98a3] p-4">
            {file ? (
                <Document
                    file={file}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    className="flex flex-col items-center"
                >
                    {Array.from(new Array(numPages), (el, index) => (
                        <Page key={index} pageNumber={index + 1} className="mb-4" />
                    ))}
                </Document>
            ) : (
                <p className="text-center text-white">No file uploaded</p>
            )}
        </div>
    );
};

export default PDFDisplay;
