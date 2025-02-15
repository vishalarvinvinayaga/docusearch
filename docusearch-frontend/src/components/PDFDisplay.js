import React, { useState } from "react";
import { Document, Page } from "react-pdf";
import Fuse from "fuse.js"; // Import Fuse.js for fuzzy matching

const PDFDisplay = ({ file, highlightedChunk, generatedResponse }) => {
    const [numPages, setNumPages] = useState(null);

    const onLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    // Fuzzy matching function with logging
    const highlightFuzzyMatches = (text, response) => {
        console.log("text:", text);
        console.log("response:", response);
    
        // Skip if there's no response or text
        if (!response || !text) return text;
    
        console.log("Original PDF text:", text);
        console.log("Generated response:", response);
    
        // Configure Fuse.js
        const fuse = new Fuse([response], {
            includeMatches: true,
            threshold: 0.3, // Adjust threshold for sensitivity
        });
    
        // Perform fuzzy search
        const results = fuse.search(text);
        console.log("Fuzzy search results:", results);
    
        if (results.length > 0) {
            const match = results[0]; // Get the first match
            const matchedSegment = match.matches?.[0]; // Extract the first matched segment
    
            if (matchedSegment) {
                const start = matchedSegment.indices[0][0];
                const end = matchedSegment.indices[0][1] + 1;
    
                // Highlight the first matched segment and stop further processing
                return (
                    <>
                        {text.slice(0, start)}
                        <span style={{ backgroundColor: "limeyellow" }}>
                            {text.slice(start, end)}
                        </span>
                        {text.slice(end)}
                    </>
                );
            }
        }
    
        console.log("No suitable match found.");
        return text; // Return the original text if no match is found
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
                            renderTextLayer={true} // Ensure text layer is rendered
                            customTextRenderer={({ str }) =>
                                highlightFuzzyMatches(str, highlightedChunk) // Apply fuzzy matching here
                            }
                        />
                    ))}
                </Document>
            </div>
        </div>
    );
};

export default PDFDisplay;
