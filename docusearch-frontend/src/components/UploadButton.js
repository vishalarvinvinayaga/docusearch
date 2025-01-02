import React from 'react';

const UploadButton = ({ onFileChange }) => {
    return (
        <div className="h-16 flex items-center justify-center bg-[#7a98a3]">
            {/* Add Button */}
            <label
                htmlFor="file-upload"
                className="bg-gradient-to-b from-blue-500 to-blue-700 text-white px-6 py-2 rounded-full text-lg font-semibold cursor-pointer shadow-lg hover:brightness-110 transition"
            >
                UPLOAD
            </label>
            <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={onFileChange}
            />
        </div>
    );
};

export default UploadButton;
