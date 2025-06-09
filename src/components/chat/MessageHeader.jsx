import React from "react";

const MessageHeader = ({ isUser, isSystem, messageType, messageStage, toolName, message }) => {
  if (isUser) {
    return (
      <div className="flex items-center mb-2 pb-2 border-b border-emerald-300/30">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mr-3 shadow-lg">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <span className="text-xs text-emerald-100 font-semibold tracking-wide">YOU</span>
      </div>
    );
  }

  if (isSystem) {
    let isSuccess = false;
    try {
      const parsed = JSON.parse(message.text);
      isSuccess = parsed.status === "success";
    } catch (error) {
      // If parsing fails, treat as error message
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
        <span className={`text-xs ${isSuccess ? "text-green-100" : "text-red-100"} font-semibold tracking-wide`}>SYSTEM</span>
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
    switch (messageStage) {
      case "tool_call":
        return {
          icon: (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mr-3 shadow-lg">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path stroke="white" strokeWidth="2.5" d="M12 5v14m7-7H5"/>
              </svg>
            </div>
          ),
          text: "TOOL CALL",
          textColor: "text-amber-200"
        };
      case "tool_result":
        return {
          icon: (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center mr-3 shadow-lg">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path stroke="white" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          ),
          text: "TOOL RESULT",
          textColor: "text-cyan-200"
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
          textColor: "text-gray-200"
        };
    }
  };

  const { icon, text, textColor } = getIconAndText();

  return (
    <div className={getHeaderStyles()}>
      {icon}
      <span className={`text-xs font-semibold tracking-wide ${textColor}`}>
        {text}
      </span>
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