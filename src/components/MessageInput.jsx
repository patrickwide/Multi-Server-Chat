import React from 'react';
import { Send } from 'lucide-react';

const MessageInput = ({ msg, setMsg, sendMsg, isConnected, inputRef, connectionStatus, activeServer }) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMsg();
    }
  };

  const isDisabled = !isConnected || connectionStatus !== "connected" || !activeServer;

  return (
    <div className="bg-gray-800/95 backdrop-blur-lg border-t-2 border-gray-700/50 shadow-2xl">
      <div className="max-w-4xl mx-auto px-8 py-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                !activeServer 
                  ? "Select a server to start chatting..." 
                  : isConnected 
                    ? "Type your message..." 
                    : "Connecting to server..."
              }
              disabled={isDisabled}
              className="w-full px-6 py-4 pr-16 border-2 border-gray-600 rounded-2xl resize-none focus:ring-4 focus:ring-orange-300/30 focus:border-orange-400 transition-all duration-300 bg-gradient-to-r from-gray-700 to-gray-600 focus:from-gray-600 focus:to-gray-500 shadow-lg text-lg font-medium placeholder-gray-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              rows="1"
              style={{ minHeight: "60px", maxHeight: "160px" }}
            />
          </div>
          
          <button
            onClick={sendMsg}
            disabled={!msg.trim() || isDisabled}
            className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-orange-500 via-red-500 to-red-600 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-3xl transform hover:scale-110 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
          >
            <Send className="w-6 h-6 drop-shadow-sm" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-4 text-sm text-gray-400 font-medium">
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-200">Enter</kbd> to send, 
            <kbd className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-200">Shift + Enter</kbd> for new line
          </span>
          {activeServer && (
            <div className="text-xs text-gray-400">
              {connectionStatus === "connected" ? (
                `Connected to ${activeServer.name}`
              ) : connectionStatus === "connecting" ? (
                `Connecting to ${activeServer.name}...`
              ) : (
                `Disconnected from ${activeServer.name}`
              )}
            </div>
          )}
          <span className={`${msg.length > 400 ? 'text-orange-400 font-bold' : ''}`}>
            {msg.length}/500
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;