import React from "react";

const ToolInfo = ({ toolInfo }) => {
  if (!toolInfo) return null;

  return (
    <div className="mt-4 p-3 bg-black/20 rounded-lg">
      {toolInfo.args && (
        <div className="mb-2">
          <span className="text-xs text-gray-400">Arguments:</span>
          <pre className="text-xs text-gray-300 mt-1 overflow-x-auto">
            {JSON.stringify(toolInfo.args, null, 2)}
          </pre>
        </div>
      )}
      {toolInfo.executionInfo && (
        <div className="text-xs text-gray-400">
          {toolInfo.executionInfo}
        </div>
      )}
      {toolInfo.executionTime && (
        <div className="text-xs text-gray-400 mt-1">
          Execution time: {toolInfo.executionTime}ms
        </div>
      )}
    </div>
  );
};

export default ToolInfo; 