import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import Button from './Button';
import { FaUser, FaRobot, FaCheck, FaTimes, FaPaperPlane } from 'react-icons/fa';

interface FlashcardChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isCompleted: boolean;
  disabled?: boolean;
}

const FlashcardChat: React.FC<FlashcardChatProps> = ({
  messages,
  onSendMessage,
  isLoading,
  isCompleted,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading && !isCompleted && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-96 bg-gray-50 rounded-lg border">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <FaRobot className="mx-auto text-3xl mb-2" />
            <p>Type your answer below to get started!</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.isCorrect === true
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : message.isCorrect === false
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <div className="flex items-center mb-1">
                {message.role === 'user' ? (
                  <FaUser className="text-sm mr-2" />
                ) : (
                  <div className="flex items-center">
                    <FaRobot className="text-sm mr-2" />
                    {message.isCorrect === true && <FaCheck className="text-green-600 text-xs ml-1" />}
                    {message.isCorrect === false && <FaTimes className="text-red-600 text-xs ml-1" />}
                  </div>
                )}
                <span className="text-xs opacity-75">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
              <div className="flex items-center">
                <FaRobot className="text-sm mr-2" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t bg-white p-4 rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              isCompleted 
                ? "Great job! Click 'Next Card' to continue." 
                : "Type your answer here..."
            }
            disabled={isLoading || isCompleted || disabled}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading || isCompleted || disabled}
            className="flex items-center px-4 py-2"
          >
            <FaPaperPlane className="text-sm" />
          </Button>
        </form>
        
        {isCompleted && (
          <div className="mt-2 text-center">
            <p className="text-green-600 text-sm font-medium">
              <FaCheck className="inline mr-1" />
              Correct! You can now move to the next card.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardChat; 