import React from "react";
import MessageHeader from "./MessageHeader";
import MarkdownRenderer from "./MarkdownRenderer";
import ToolInfo from "./ToolInfo";

const Message = ({ message, index }) => {
  const isUser = message.type === "user";
  const isAI = message.type === "ai";
  
  // Parse the message to determine its type and stage
  let messageType = "default";
  let messageStage = null;
  let toolInfo = null;
  
  if (isAI) {
    try {
      const parsed = JSON.parse(message.text);
      messageType = parsed.type || "default";
      messageStage = parsed.stage;
      
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

  const getMessageStyles = () => {
    if (isUser) {
      return "bg-gradient-to-br from-emerald-600 to-teal-700 text-white ml-12";
    }
    
    switch (messageType) {
      case "welcome":
        return "bg-gradient-to-br from-blue-600 to-indigo-700 text-white mr-12";
      case "goodbye":
        return "bg-gradient-to-br from-purple-600 to-pink-700 text-white mr-12";
      default:
        switch (messageStage) {
          case "tool_call":
            return "bg-gradient-to-br from-amber-600 to-orange-700 text-white mr-12";
          case "tool_result":
            return "bg-gradient-to-br from-cyan-600 to-teal-700 text-white mr-12";
          default:
            return "bg-gradient-to-br from-gray-800 to-gray-900 text-white mr-12 border border-gray-600/50";
        }
    }
  };

  const getTailStyles = () => {
    if (isUser) {
      return "bg-gradient-to-br from-emerald-600 to-teal-700 -right-1";
    }
    
    switch (messageType) {
      case "welcome":
        return "bg-gradient-to-br from-blue-600 to-indigo-700 -left-1";
      case "goodbye":
        return "bg-gradient-to-br from-purple-600 to-pink-700 -left-1";
      default:
        switch (messageStage) {
          case "tool_call":
            return "bg-gradient-to-br from-amber-600 to-orange-700 -left-1";
          case "tool_result":
            return "bg-gradient-to-br from-cyan-600 to-teal-700 -left-1";
          default:
            return "bg-gradient-to-br from-gray-800 to-gray-900 -left-1 border-l border-t border-gray-600/50";
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
          return `Using tool: ${parsed.tool}\n${parsed.content || ''}`;
        case "tool_result":
          const toolInfo = [
            `Tool: ${parsed.tool}`,
            `Result: ${parsed.response}`,
            parsed.execution_info ? `Details: ${parsed.execution_info}` : '',
            parsed.execution_time_ms ? `Time: ${parsed.execution_time_ms}ms` : ''
          ].filter(Boolean).join('\n');
          return toolInfo;
        default:
          return parsed.content || parsed.message || parsed.text;
      }
    } catch (error) {
      return message.text;
    }
  };

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6 group`}
    >
      <div
        className={`relative min-w-[280px] max-w-2xl lg:max-w-4xl xl:max-w-5xl px-6 py-4 rounded-md shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${getMessageStyles()}`}
      >
        {/* Message tail */}
        <div
          className={`absolute top-4 w-3 h-3 transform rotate-45 ${getTailStyles()}`}
        />

        <MessageHeader
          isUser={isUser}
          messageType={messageType}
          messageStage={messageStage}
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