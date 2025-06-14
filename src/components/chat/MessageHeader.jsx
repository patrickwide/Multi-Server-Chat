import React from "react";

const MessageHeader = ({ isUser, isSystem, messageType, messageStage, toolName, message, toolInfo }) => {
  if (isUser) {
    return (
      <div className="flex items-center mb-2 pb-2 border-b border-emerald-300/30">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mr-3 shadow-lg">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-emerald-100 font-semibold tracking-wide">YOU</span>
          {message.id && (
            <span className="text-[10px] text-emerald-300/50">{message.id.split('-')[0]}</span>
          )}
        </div>
      </div>
    );
  }

  if (isSystem) {
    let isSuccess = false;
    try {
      const parsed = JSON.parse(message.text);
      isSuccess = parsed.status === "success";
    } catch (error) {
      isSuccess = false;
    }

    return (
      <div className={`flex items-center mb-2 pb-2 border-b ${isSuccess ? "border-green-300/30" : "border-red-300/30"}`}>
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${isSuccess ? "from-green-400 to-emerald-500" : "from-red-400 to-red-500"} flex items-center justify-center mr-3 shadow-lg`}>
          {isSuccess ? (
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path stroke="white" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
            </svg>
          ) : (
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path stroke="white" strokeWidth="2.5" d="M12 9v6m0-9v.01M12 21a9 9 0 100-18 9 9 0 000 18z"/>
            </svg>
          )}
        </div>
        <div className="flex flex-col">
          <span className={`text-xs ${isSuccess ? "text-green-100" : "text-red-100"} font-semibold tracking-wide`}>
            SYSTEM
          </span>
          {message.id && (
            <span className={`text-[10px] ${isSuccess ? "text-green-300/50" : "text-red-300/50"}`}>
              {message.id.split('-')[0]}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Define consistent styling with subtle variations
  const getHeaderStyles = () => {
    const baseClasses = "flex items-center mb-2 pb-2 border-b";
    
    switch (messageStage) {
      case "tool_call":
        return `${baseClasses} border-amber-400/30 bg-gradient-to-r from-amber-800/20 to-orange-900/20 rounded-lg px-3 py-2`;
      case "tool_result":
        return `${baseClasses} border-cyan-400/30 bg-gradient-to-r from-cyan-900/20 to-teal-900/20 rounded-lg px-3 py-2`;
      default:
        return `${baseClasses} border-gray-500/30`;
    }
  };

  const getIconAndText = () => {
    const executionTime = toolInfo?.executionTime;
    const status = toolInfo?.status;

    switch (messageStage) {
      case "tool_call":
        return {
          icon: (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mr-3 shadow-lg">
              <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path stroke="white" strokeWidth="2.5" d="M12 6v2m0 8v2M6 12h2m8 0h2m-11 0a5 5 0 1110 0 5 5 0 01-10 0z"/>
              </svg>
            </div>
          ),
          text: "TOOL CALL",
          textColor: "text-amber-200",
          subText: toolInfo?.toolCallId ? `ID: ${toolInfo.toolCallId}` : undefined
        };
      case "tool_result":
        return {
          icon: (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center mr-3 shadow-lg">
              {status === "error" ? (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path stroke="white" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              ) : (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path stroke="white" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                </svg>
              )}
            </div>
          ),
          text: "TOOL RESULT",
          textColor: status === "error" ? "text-red-200" : "text-cyan-200",
          subText: executionTime ? `${executionTime}ms` : undefined
        };
      default:
        return {
          icon: (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3 shadow-lg">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
          ),
          text: messageType === "welcome" ? "WELCOME" : 
                messageType === "goodbye" ? "GOODBYE" : "AI AGENT",
          textColor: "text-gray-200",
          subText: message.id ? message.id.split('-')[0] : undefined
        };
    }
  };

  const { icon, text, textColor, subText } = getIconAndText();

  return (
    <div className={getHeaderStyles()}>
      {icon}
      <div className="flex flex-col">
        <span className={`text-xs font-semibold tracking-wide ${textColor}`}>
          {text}
        </span>
        {subText && (
          <span className="text-[10px] text-gray-400">
            {subText}
          </span>
        )}
      </div>
      {(messageStage === "tool_call" || messageStage === "tool_result") && toolName && (
        <>
          <span className="mx-2 text-white/40">•</span>
          <span className="text-xs font-medium text-white/80 tracking-wide uppercase">
            {toolName}
          </span>
        </>
      )}
    </div>
  );
};

export default MessageHeader;