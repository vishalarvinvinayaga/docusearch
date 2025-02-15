import React, { useState } from "react";
import "./UploadButton.css";

const UploadButton = ({ onFileChange }) => {
    const [loading, setLoading] = useState(false); // Manage loading state

    const handleFileUpload = async (e) => {
        const uploadedFile = e.target.files[0]; // Get the uploaded file

        if (uploadedFile) {
            setLoading(true); // Start loading
            const formData = new FormData(); // Create form data
            formData.append("file", uploadedFile);

            try {
                // Send the file to the correct backend API endpoint
                const response = await fetch("http://127.0.0.1:8000/upload/", {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("File uploaded successfully:", data);
                } else {
                    console.error("File upload failed:", response.statusText);
                }
            } catch (error) {
                console.error("Error uploading file:", error);
            } finally {
                setLoading(false); // Stop loading after backend processing
            }
        }

        // Call the parent handler to set the file in state
        if (onFileChange) {
            onFileChange(e);
        }
    };

    return (
        <div className="upload-button-container">
            {/* Spinner */}
            {loading && (
                <div className="loader-container">
                    <div className="loader"></div>
                </div>
            )}
            <label htmlFor="file-upload" className="upload-button">
                UPLOAD
            </label>
            <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={loading} // Disable upload during loading
            />
        </div>
    );
};

export default UploadButton;
