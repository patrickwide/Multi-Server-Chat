import React from "react";

const MessageHeader = ({ isUser, messageType, messageStage }) => {
  if (isUser) {
    return (
      <div className="flex items-center mb-2 pb-2 border-b border-emerald-300/30">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mr-3 shadow-lg">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <span className="text-xs text-emerald-100 font-semibold tracking-wide">YOU</span>
        <div className="ml-auto">
          <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse shadow-lg shadow-emerald-300/50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center mb-2 pb-2 border-b border-gray-500/30">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mr-3 shadow-lg">
        <div className="w-4 h-1 bg-white rounded-full"></div>
      </div>
      <span className="text-xs text-gray-200 font-semibold tracking-wide">
        {messageType === "welcome" ? "WELCOME" :
         messageType === "goodbye" ? "GOODBYE" :
         messageStage === "tool_call" ? "TOOL CALL" :
         messageStage === "tool_result" ? "TOOL RESULT" :
         "AI AGENT"}
      </span>
      <div className="ml-auto">
        <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse shadow-lg shadow-amber-300/50"></div>
      </div>
    </div>
  );
};

export default MessageHeader; 