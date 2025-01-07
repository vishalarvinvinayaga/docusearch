import React, { useState } from 'react';
import PDFDisplay from './PDFDisplay';
import UploadButton from './UploadButton';
import Chatbot from './Chatbot';
import { pdfjs } from 'react-pdf';

// Configure the worker
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

const PdfViewer = () => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFile(URL.createObjectURL(uploadedFile));
        }
    };

    return (
        <div className="flex h-screen">
            {/* Left Column */}
            <div className="w-1/2 bg-[#7a98a3] flex flex-col">
                {/* PDF Viewer */}
                <div className="flex-grow overflow-hidden">
                    <PDFDisplay file={file} />
                </div>

                {/* Upload Button */}
                <UploadButton onFileChange={handleFileChange} />
            </div>

            {/* Right Column */}
            <div className="w-1/2">
                <Chatbot />
            </div>
        </div>
    );
};

export default PdfViewer;
