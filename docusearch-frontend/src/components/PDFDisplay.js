import React, { useState } from "react";
import { Document, Page } from "react-pdf";

const PDFDisplay = ({ file }) => {
    const [numPages, setNumPages] = useState(null);

    const onLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    if (!file) {
        return (
            <div className="flex justify-center items-center h-full text-gray-700">
                No file uploaded
            </div>
        );
    }

    return (
        <div className="w-full h-full flex justify-center bg-gray-200 overflow-y-auto">
            <div className="flex flex-col items-center">
                <Document file={file} onLoadSuccess={onLoadSuccess}>
                    {Array.from({ length: numPages }, (_, index) => (
                        <Page
                            key={`page_${index + 1}`}
                            pageNumber={index + 1}
                            renderTextLayer={false} // Optional: Disable text layer
                            renderAnnotationLayer={false} // Optional: Disable annotation layer
                            width={600} // Adjust the width as per your layout
                        />
                    ))}
                </Document>
            </div>
        </div>
    );
};

export default PDFDisplay;