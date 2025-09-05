/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

interface ChatProps {
    onChatSubmit: (prompt: string, imageContext: 'current' | 'previous') => void;
    isLoading: boolean;
    history: ChatMessage[];
    hasPreviousImage: boolean;
}

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

const Chat: React.FC<ChatProps> = ({ onChatSubmit, isLoading, history, hasPreviousImage }) => {
    const [message, setMessage] = useState('');
    const [imageContext, setImageContext] = useState<'current' | 'previous'>('current');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [history]);

    useEffect(() => {
        if (!hasPreviousImage && imageContext === 'previous') {
            setImageContext('current');
        }
    }, [hasPreviousImage, imageContext]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !isLoading) {
            onChatSubmit(message, imageContext);
            setMessage('');
        }
    };

    const baseButtonClasses = "px-4 py-2 text-sm font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    const activeButtonClasses = "bg-blue-600 text-white";
    const inactiveButtonClasses = "bg-zinc-200 text-zinc-700 hover:bg-zinc-300";

    return (
        <div className="w-full max-w-2xl mx-auto mt-4 border border-zinc-200 rounded-lg shadow-md flex flex-col bg-white animate-fade-in">
            <div className="flex-1 p-4 overflow-y-auto h-64 bg-zinc-50 rounded-t-lg">
                {history.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-zinc-500">Ask me to edit the image!</p>
                    </div>
                ) : (
                    history.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow-sm ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-zinc-200 text-zinc-800'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-zinc-200 bg-white rounded-b-lg">
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-zinc-600">Edit Image:</span>
                        <button type="button" onClick={() => setImageContext('current')} className={`${baseButtonClasses} ${imageContext === 'current' ? activeButtonClasses : inactiveButtonClasses}`} disabled={isLoading}>Current</button>
                        <button type="button" onClick={() => setImageContext('previous')} className={`${baseButtonClasses} ${imageContext === 'previous' ? activeButtonClasses : inactiveButtonClasses}`} disabled={!hasPreviousImage || isLoading}>Previous</button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={isLoading ? "Editing image..." : "e.g., 'make the sofa red'"}
                            className="flex-1 p-2 bg-white text-zinc-900 placeholder:text-zinc-500 border border-zinc-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-zinc-100"
                            disabled={isLoading}
                            aria-label="Chat input for image editing"
                        />
                        <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition flex items-center justify-center h-10 w-10" disabled={isLoading || !message.trim()} aria-label="Send chat message">
                            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SendIcon />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Chat;