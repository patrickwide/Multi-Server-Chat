import React from "react";
import { Globe } from "lucide-react";
import Message from "./chat/Message";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatMessages = ({ log, isTyping, messagesEndRef, connectionStatus, activeServer }) => {
  const renderTypingIndicator = () => (
    <div className="flex justify-start mb-6 group">
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 text-white max-w-2xl lg:max-w-4xl xl:max-w-5xl px-6 py-4 rounded-2xl mr-12 border border-gray-700/50 shadow-lg backdrop-blur-sm">
        {/* Message tail */}
        <div className="absolute top-4 w-3 h-3 transform rotate-45 bg-gradient-to-br from-gray-800 to-gray-900 -left-1 border-l border-t border-gray-700/50" />
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce shadow-lg shadow-blue-400/50"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce shadow-lg shadow-purple-400/50" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce shadow-lg shadow-pink-400/50" style={{ animationDelay: "0.2s" }}></div>
          </div>
          <span className="text-gray-300 text-sm font-medium">thinking...</span>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => {
    if (!activeServer) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Globe size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No server selected</p>
            <p className="text-sm">Click the settings button to add and select a server</p>
          </div>
        </div>
      );
    }

    if (connectionStatus === "connecting") {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-300 max-w-md mx-auto">
            <div className="relative mb-8">
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-spin">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
              </div>
            </div>
            <div className="text-xl font-bold mb-3 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Connecting to AI
            </div>
            <div className="text-sm text-gray-400 leading-relaxed">
              Establishing secure connection to your personal assistant
            </div>
            <div className="mt-6 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        </div>
      );
    }

    if (connectionStatus === "error" || connectionStatus === "disconnected") {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-300 max-w-md mx-auto">
            <div className="relative mb-8">
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <div className="text-xl font-bold mb-3 bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
              Connection Issue
            </div>
            <div className="text-sm text-gray-400 leading-relaxed">
              {connectionStatus === "error" 
                ? "Unable to reach AI servers. Please check your internet connection and try again." 
                : "Connection lost. Attempting to reconnect automatically..."}
            </div>
            {connectionStatus === "disconnected" && (
              <div className="mt-6 flex justify-center space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }}></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: "0.6s" }}></div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Group messages by conversation
  const groupMessagesByConversation = (messages) => {
    const conversations = new Map();
    
    messages.forEach(message => {
      if (!message.conversationId) return;
      
      if (!conversations.has(message.conversationId)) {
        conversations.set(message.conversationId, []);
      }
      conversations.get(message.conversationId).push(message);
    });

    return Array.from(conversations.values());
  };

  // Group tool-related messages
  const groupToolMessages = (messages) => {
    const toolGroups = new Map();
    
    messages.forEach(message => {
      try {
        const parsed = JSON.parse(message.text);
        if (parsed.tool_call_id) {
          if (!toolGroups.has(parsed.tool_call_id)) {
            toolGroups.set(parsed.tool_call_id, []);
          }
          toolGroups.get(parsed.tool_call_id).push(message);
        }
      } catch (error) {
        // Not a tool message
      }
    });

    return toolGroups;
  };

  const renderConversation = (conversation) => {
    const toolGroups = groupToolMessages(conversation);
    
    return conversation.map((message, index) => {
      const isToolMessage = message.tool_correlation?.tool_call_id;
      const toolGroup = isToolMessage ? toolGroups.get(message.tool_correlation.tool_call_id) : null;
      
      return (
        <div key={message.id || index} className="relative">
          {/* Tool execution chain connection lines */}
          {toolGroup && toolGroup.length > 1 && (
            <div className="absolute left-4 -top-3 w-px bg-gradient-to-b from-transparent via-amber-500/30 to-cyan-500/30" 
                 style={{ height: `${(toolGroup.length) * 100}%` }} />
          )}
          
          <Message 
            message={message} 
            index={index}
            toolGroup={toolGroup}
            isLastInToolGroup={toolGroup ? message === toolGroup[toolGroup.length - 1] : false}
          />
        </div>
      );
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-gradient-to-b from-gray-900/50 to-gray-900/80">
      {log.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {groupMessagesByConversation(log).map((conversation, i) => (
            <div key={i} className="mb-8 last:mb-0">
              {renderConversation(conversation)}
            </div>
          ))}
          {isTyping && renderTypingIndicator()}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;