import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

const Chatbot = ({ setHighlightedChunk }) => {
    const [messages, setMessages] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false); // State to track if bot is "typing"
    const chatContainerRef = useRef(null); // Reference for chat container

    const handleSend = async () => {
        if (query.trim() === "") return;

        // Add user's query to messages
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: query, sender: "user" },
        ]);
        setQuery("");
        setLoading(true); // Set loading state to true

        try {
            const response = await fetch("http://127.0.0.1:8000/query/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch response from server.");
            }

            const data = await response.json();

            // Update messages with the bot's response
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: data.response, sender: "bot" },
            ]);

            // Pass the similar chunk to the parent (PDFDisplay)
            console.log("Similar chunk received from backend:", data.response);
            setHighlightedChunk(data.response);
        } catch (error) {
            console.error("Error fetching response:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: "Sorry, something went wrong.", sender: "bot" },
            ]);
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

    // Function to scroll to the latest message
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    };

    // Trigger scroll whenever messages are updated
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="w-full h-full bg-[#001212] p-4 flex flex-col">
            {/* Chat Messages Section */}
            <div
                ref={chatContainerRef}
                className="flex-grow overflow-y-auto mb-4 p-4"
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex mb-2 ${
                            message.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                    >
                        <div
                            className={`p-2 rounded-md max-w-xs ${
                                message.sender === "user"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-700 text-white"
                            }`}
                        >
                            {message.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="p-2 rounded-md max-w-xs bg-gray-700 text-white">
                            <div className="flex items-center">
                                <span>Typing</span>
                                <span className="dot-flashing"></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Input Section */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow p-2 border rounded-md bg-gray-800 text-white placeholder-gray-400"
                    placeholder="Type your message..."
                />
                <button
                    onClick={handleSend}
                    className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
