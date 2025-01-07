import React, { useState } from 'react';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [query, setQuery] = useState('');

    const handleSend = async () => {
        if (query.trim() === '') return;

        // Add the user's query to the messages list
        const newMessages = [...messages, { text: query, sender: 'user' }];
        console.log('Sending query:', query);

        try {
            console.log('Sending query:', query);
            // Send the query to the backend
            const response = await fetch('http://127.0.0.1:8000/query/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            const data = await response.json();

            // Add the backend's response to the messages list
            if (response.ok && data.response) {
                newMessages.push({
                    text: `Retrieved chunk: ${data.response}`, // Displaying only the first chunk
                    sender: 'bot',
                });
            } else {
                newMessages.push({
                    text: 'Sorry, something went wrong.',
                    sender: 'bot',
                });
            }
        } catch (error) {
            console.error('Error sending query:', error);
            newMessages.push({
                text: 'Sorry, something went wrong.',
                sender: 'bot',
            });
        }

        setMessages(newMessages);
        setQuery('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="w-full h-full bg-[#001212] p-4 flex flex-col">
            {/* Chat Messages Section */}
            <div className="flex-grow overflow-y-auto mb-4 p-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex mb-2 ${
                            message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        <div
                            className={`p-2 rounded-md max-w-xs ${
                                message.sender === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-700 text-white'
                            }`}
                        >
                            {message.text}
                        </div>
                    </div>
                ))}
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
