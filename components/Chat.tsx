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
    onChatSubmit: (prompt: string, imageContext: 'current' | 'previous', chatImageFile: File | null) => void;
    isLoading: boolean;
    history: ChatMessage[];
    hasPreviousImage: boolean;
}

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

const AttachmentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a3 3 0 006 0V7a1 1 0 112 0v4a5 5 0 01-10 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


const Chat: React.FC<ChatProps> = ({ onChatSubmit, isLoading, history, hasPreviousImage }) => {
    const [message, setMessage] = useState('');
    const [imageContext, setImageContext] = useState<'current' | 'previous'>('current');
    const [chatImageFile, setChatImageFile] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            onChatSubmit(message, imageContext, chatImageFile);
            setMessage('');
            setChatImageFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setChatImageFile(file);
        }
    };
    
    const removeAttachment = () => {
        setChatImageFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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
                    {chatImageFile && (
                        <div className="mb-2 flex items-center justify-between bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-lg animate-fade-in">
                            <span>{chatImageFile.name}</span>
                            <button onClick={removeAttachment} type="button" className="ml-2 p-1 rounded-full hover:bg-blue-200" aria-label="Remove attachment">
                                <CloseIcon />
                            </button>
                        </div>
                    )}
                    <div className="flex items-center space-x-2">
                        <input
                           ref={fileInputRef}
                           type="file"
                           className="hidden"
                           accept="image/png, image/jpeg, image/webp"
                           onChange={handleFileChange}
                           id="chat-file-input"
                        />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-zinc-500 hover:text-blue-600 p-2.5 rounded-md transition-colors disabled:opacity-50" disabled={isLoading} aria-label="Attach file">
                            <AttachmentIcon />
                        </button>
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
