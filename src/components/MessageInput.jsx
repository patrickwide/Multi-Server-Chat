import React, { useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

const MessageInput = ({ msg, setMsg, sendMsg, isConnected, inputRef, connectionStatus, activeServer }) => {
  const adjustTextareaHeight = () => {
    if (inputRef?.current) {
      const textarea = inputRef.current;
      textarea.style.height = 'auto';
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 80), 400);
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [msg]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMsg();
    }
  };

  const handleChange = (e) => {
    setMsg(e.target.value);
    setTimeout(adjustTextareaHeight, 0);
  };

  const isDisabled = !isConnected || connectionStatus !== "connected" || !activeServer;

  return (
    <div className="bg-gradient-to-r from-gray-900/98 via-gray-800/98 to-gray-900/98 backdrop-blur-xl border-t border-gray-700/50 shadow-2xl">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(31, 41, 55, 0.5);
            border-radius: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #374151 0%, #4b5563 100%);
            border-radius: 8px;
            border: 1px solid rgba(75, 85, 99, 0.3);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #4b5563 0%, #6b7280 100%);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:active {
            background: linear-gradient(180deg, #6b7280 0%, #9ca3af 100%);
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #4b5563 rgba(31, 41, 55, 0.5);
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-12 sm:py-8">
        <div className="flex gap-4 sm:gap-6 items-end">
          <div className="flex-1 relative group">
            <textarea
              ref={inputRef}
              value={msg}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder={
                !activeServer 
                  ? "✨ Select a server to begin your AI conversation..." 
                  : isConnected 
                    ? "Share your thoughts, ask questions, or start a conversation..." 
                    : "🔄 Establishing connection to AI..."
              }
              disabled={isDisabled}
              className="custom-scrollbar w-full px-4 sm:px-8 py-4 sm:py-6 pr-16 sm:pr-20 border-2 border-gray-600/50 rounded-md resize-none focus:outline-none focus:border-emerald-400/70 focus:shadow-lg focus:shadow-emerald-400/10 transition-all duration-300 bg-gradient-to-br from-gray-800/90 to-gray-700/90 focus:from-gray-700/90 focus:to-gray-600/90 shadow-xl text-base sm:text-lg font-medium placeholder-gray-400 text-gray-100 disabled:opacity-40 disabled:cursor-not-allowed overflow-y-auto leading-relaxed hover:shadow-2xl hover:border-gray-500/70 hover:shadow-emerald-500/5"
              style={{ minHeight: "80px", maxHeight: "400px", height: "80px" }}
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>

          <button
            onClick={sendMsg}
            disabled={!msg.trim() || isDisabled}
            className="flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl flex items-center justify-center shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Send className="w-5 h-5 sm:w-7 sm:h-7 drop-shadow-lg relative z-10" />
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 absolute top-2 right-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 sm:mt-6 gap-3 sm:gap-0 text-xs sm:text-sm text-gray-400 font-medium">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 sm:px-3 sm:py-2 bg-gray-700/80 rounded-lg text-xs text-gray-200 font-mono shadow-lg">Enter</kbd>
              <span className="text-gray-300">to send</span>
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 sm:px-3 sm:py-2 bg-gray-700/80 rounded-lg text-xs text-gray-200 font-mono shadow-lg">Shift + Enter</kbd>
              <span className="text-gray-300">for new line</span>
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {activeServer && (
              <div className="text-xs sm:text-sm text-gray-300 bg-gray-800/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-sm">
                {connectionStatus === "connected" ? (
                  <span className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                    Connected to {activeServer.name}
                  </span>
                ) : connectionStatus === "connecting" ? (
                  <span className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50" />
                    Connecting to {activeServer.name}...
                  </span>
                ) : (
                  <span className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-lg shadow-red-400/50" />
                    Disconnected from {activeServer.name}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-1 text-xs sm:text-sm">
              <span className={`transition-colors duration-200 ${
                msg.length > 800 ? 'text-red-400 font-bold' :
                msg.length > 600 ? 'text-amber-400 font-semibold' :
                'text-gray-400'
              }`}>
                {msg.length}
              </span>
              <span className="text-gray-500">/</span>
              <span className="text-gray-400">1000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
