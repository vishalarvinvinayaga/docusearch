import React from "react";
import "./UploadButton.css";

const UploadButton = ({ onFileChange }) => {
    const handleFileUpload = async (e) => {
        const uploadedFile = e.target.files[0]; // Get the uploaded file

        if (uploadedFile) {
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
            }
        }

        // Call the parent handler to set the file in state
        if (onFileChange) {
            onFileChange(e);
        }
    };

    return (
        <div className="upload-button-container">
            <label htmlFor="file-upload" className="upload-button">
                UPLOAD
            </label>
            <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
            />
        </div>
    );
};

export default UploadButton;
