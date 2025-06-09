import React from "react";
import MessageHeader from "./MessageHeader";
import MarkdownRenderer from "./MarkdownRenderer";
import ToolInfo from "./ToolInfo";
import { Copy, Check } from "lucide-react";

const Message = ({ message, index }) => {
  const isUser = message.type === "user";
  const isAI = message.type === "ai";
  const isSystem = message.type === "system";
  
  // Parse the message to determine its type and stage
  let messageType = "default";
  let messageStage = null;
  let toolInfo = null;
  let toolName = null;
  
  if (isAI || isSystem) {
    try {
      const parsed = JSON.parse(message.text);
      messageType = parsed.type || "default";
      messageStage = parsed.stage;
      toolName = parsed.tool;
      
      if (messageStage === "tool_call" || messageStage === "tool_result") {
        toolInfo = {
          name: parsed.tool,
          args: parsed.arguments || parsed.args,
          response: parsed.response,
          executionInfo: parsed.execution_info,
          executionTime: parsed.execution_time_ms
        };
      }
    } catch (error) {
      // If parsing fails, use default message type
    }
  }

  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // ignore
    }
  };

  const getMessageStyles = () => {
    if (isUser) {
      return "bg-gradient-to-br from-emerald-700/90 to-teal-800/90 text-white ml-12 shadow-xl border border-emerald-400/20 backdrop-blur-sm";
    }
    
    if (isSystem) {
      const parsed = JSON.parse(message.text);
      if (parsed.status === "success") {
        return "bg-gradient-to-br from-green-800/90 to-emerald-900/90 text-white mx-auto shadow-xl border border-green-400/20 backdrop-blur-sm";
      }
      return "bg-gradient-to-br from-red-800/90 to-red-900/90 text-white mx-auto shadow-xl border border-red-400/20 backdrop-blur-sm";
    }
         
    switch (messageType) {
      case "welcome":
        return "bg-gradient-to-br from-blue-800/90 to-indigo-900/90 text-white mr-12 shadow-xl border border-blue-400/20 backdrop-blur-sm";
      case "goodbye":
        return "bg-gradient-to-br from-purple-800/90 to-pink-900/90 text-white mr-12 shadow-xl border border-purple-400/20 backdrop-blur-sm";
      default:
        switch (messageStage) {
          case "tool_call":
            return "bg-gradient-to-br from-amber-800/90 to-orange-900/90 text-white mr-12 shadow-xl border border-amber-400/20 backdrop-blur-sm";
          case "tool_result":
            return "bg-gradient-to-br from-cyan-800/90 to-teal-900/90 text-white mr-12 shadow-xl border border-cyan-400/20 backdrop-blur-sm";
          default:
            return "bg-gradient-to-br from-gray-800/90 to-gray-900/90 text-white mr-12 shadow-lg border border-gray-500/30 backdrop-blur-sm";
        }
    }
  };
  
  const getTailStyles = () => {
    if (isUser) {
      return "bg-gradient-to-br from-emerald-400 to-teal-500 -right-1 shadow-lg border border-emerald-300/20";
    }
    
    if (isSystem) {
      const parsed = JSON.parse(message.text);
      if (parsed.status === "success") {
        return "bg-gradient-to-br from-green-400 to-emerald-500 -left-1 shadow-lg border border-green-300/20";
      }
      return "bg-gradient-to-br from-red-400 to-red-500 -left-1 shadow-lg border border-red-300/20";
    }
         
    switch (messageType) {
      case "welcome":
        return "bg-gradient-to-br from-blue-500 to-purple-600 -left-1 shadow-lg border border-blue-400/20";
      case "goodbye":
        return "bg-gradient-to-br from-purple-500 to-pink-600 -left-1 shadow-lg border border-purple-400/20";
      default:
        switch (messageStage) {
          case "tool_call":
            return "bg-gradient-to-br from-amber-400 to-orange-500 -left-1 shadow-lg border border-amber-300/20";
          case "tool_result":
            return "bg-gradient-to-br from-cyan-400 to-teal-500 -left-1 shadow-lg border border-cyan-300/20";
          default:
            return "bg-gradient-to-br from-gray-600 to-gray-700 -left-1 shadow-lg border border-gray-500/30";
        }
    }
  };
  
  const extractMessageContent = (message) => {
    if (isUser) return message.text;
    
    try {
      const parsed = JSON.parse(message.text);
      
      if (parsed.type === "welcome" || parsed.type === "goodbye") {
        return parsed.message;
      }
      
      if (parsed.status === "error") {
        return `Error: ${parsed.error || parsed.message}`;
      }
      
      switch (parsed.stage) {
        case "initial_response":
        case "final_response":
          return parsed.content;
        case "tool_call":
          return "";
        case "tool_result":
          return "";
        default:
          return parsed.content || parsed.message || parsed.text;
      }
    } catch (error) {
      return message.text;
    }
  };

  return (
    <div
      className={`flex ${isUser ? "justify-end" : isSystem ? "justify-center" : "justify-start"} mb-6 group`}
    >
      <div
        className={`relative min-w-[280px] max-w-2xl lg:max-w-4xl xl:max-w-5xl px-6 py-4 rounded-md shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${getMessageStyles()}`}
      >
        {/* Copy button for user/agent (not tool_call/tool_result) */}
        {(!isAI || (isAI && messageStage !== "tool_call" && messageStage !== "tool_result")) && (
          <button
            onClick={() => handleCopy(extractMessageContent(message))}
            className={`absolute top-2 right-2 z-10 p-1 rounded-full bg-black/10 hover:bg-black/30 transition-colors ${isUser ? "text-emerald-300 hover:text-white" : isSystem ? "text-red-300 hover:text-white" : "text-blue-300 hover:text-white"}`}
            title="Copy message"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        )}
        {/* Message tail */}
        <div
          className={`absolute top-4 w-3 h-3 transform rotate-45 ${getTailStyles()}`}
        />

        <MessageHeader
          isUser={isUser}
          isSystem={isSystem}
          messageType={messageType !== "default" ? messageType : null}
          messageStage={messageStage}
          toolName={toolName}
          message={message}
        />

        <div className={`${isUser ? "font-medium" : ""} leading-relaxed`}>
          {isAI ? (
            <>
              <MarkdownRenderer content={extractMessageContent(message)} />
              <ToolInfo toolInfo={toolInfo} />
            </>
          ) : (
            extractMessageContent(message)
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-xs mt-2 opacity-60 ${isUser ? "text-right" : "text-left"}`}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default Message; 