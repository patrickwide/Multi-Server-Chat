import React from "react";
import { Globe, Copy, Check } from "lucide-react";
import Message from "./chat/Message";

// Reliable markdown renderer component
const MarkdownRenderer = ({ content }) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    const elements = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      
      // Code blocks
      if (line.startsWith('```')) {
        const language = line.slice(3).trim();
        const codeLines = [];
        i++;
        
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        
        const code = codeLines.join('\n');
        elements.push(
          <div key={`code-${i}-${Date.now()}`} className="my-4 rounded-lg overflow-hidden bg-gray-800">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-700 border-b border-gray-600">
              <span className="text-xs text-gray-300 font-mono">
                {language || 'code'}
              </span>
              <button
                onClick={() => handleCopy(code)}
                className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 text-sm font-mono text-gray-200 overflow-x-auto">
              {code}
            </pre>
          </div>
        );
        i++;
        continue;
      }
      
      // Headers
      if (line.startsWith('### ')) {
        elements.push(<h3 key={`h3-${i}-${Date.now()}`} className="text-lg font-semibold mt-4 mb-2 text-gray-100">{line.slice(4)}</h3>);
        i++;
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={`h2-${i}-${Date.now()}`} className="text-xl font-semibold mt-4 mb-2 text-gray-100">{line.slice(3)}</h2>);
        i++;
        continue;
      }
      if (line.startsWith('# ')) {
        elements.push(<h1 key={`h1-${i}-${Date.now()}`} className="text-2xl font-bold mt-4 mb-2 text-white">{line.slice(2)}</h1>);
        i++;
        continue;
      }
      
      // Lists
      if (line.match(/^\d+\.\s/)) {
        const listItems = [];
        while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
          listItems.push(lines[i].replace(/^\d+\.\s/, ''));
          i++;
        }
        elements.push(
          <ol key={`ol-${i}-${Date.now()}`} className="list-decimal list-inside my-2 space-y-1 text-gray-200">
            {listItems.map((item, idx) => (
              <li key={`ol-item-${i}-${idx}-${Date.now()}`} className="leading-relaxed">{renderInlineMarkdown(item)}</li>
            ))}
          </ol>
        );
        continue;
      }
      
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const listItems = [];
        while (i < lines.length && (lines[i].startsWith('* ') || lines[i].startsWith('- '))) {
          listItems.push(lines[i].slice(2));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}-${Date.now()}`} className="list-disc list-inside my-2 space-y-1 text-gray-200">
            {listItems.map((item, idx) => (
              <li key={`ul-item-${i}-${idx}-${Date.now()}`} className="leading-relaxed">{renderInlineMarkdown(item)}</li>
            ))}
          </ul>
        );
        continue;
      }
      
      // Empty lines
      if (line.trim() === '') {
        elements.push(<br key={`br-${i}-${Date.now()}`} />);
        i++;
        continue;
      }
      
      // Regular paragraphs
      elements.push(
        <p key={`p-${i}-${Date.now()}`} className="mb-2 leading-relaxed text-gray-200">
          {renderInlineMarkdown(line)}
        </p>
      );
      i++;
    }
    
    return elements;
  };
  
  const renderInlineMarkdown = (text) => {
    if (!text) return text;
    
    // Split by backticks for inline code
    const parts = text.split(/(`[^`]+`)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={`code-inline-${index}-${Date.now()}`} className="bg-gray-700 text-yellow-300 px-1.5 py-0.5 rounded text-sm font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      
      // Handle bold and italic
      let result = part
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-100">$1</em>');
      
      if (result !== part) {
        return <span key={`span-${index}-${Date.now()}`} dangerouslySetInnerHTML={{ __html: result }} />;
      }
      
      return part;
    });
  };
  
  return <div className="space-y-1">{renderMarkdown(content)}</div>;
};

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

    if (connectionStatus === "connected" && log.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">
          <p>Connected to {activeServer.name}</p>
          <p className="text-sm">Start chatting by typing a message below</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-gradient-to-b from-gray-900/50 to-gray-900/80">
      {log.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {log.map((message, index) => (
            <Message key={index} message={message} index={index} />
          ))}
          {isTyping && renderTypingIndicator()}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;