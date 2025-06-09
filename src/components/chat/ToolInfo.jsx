import React from "react";
import { Copy, Check, FileText } from "lucide-react";

const ToolInfo = ({ toolInfo }) => {
  const [copied, setCopied] = React.useState(false);
  const [expandedResult, setExpandedResult] = React.useState(false);
  const [expandedArgs, setExpandedArgs] = React.useState(false);

  if (!toolInfo) return null;

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // ignore
    }
  };

  // Helper to determine if result is lengthy
  const getResultString = () => {
    if (!toolInfo.response) return "";
    if (typeof toolInfo.response === 'string') return toolInfo.response;
    return JSON.stringify(toolInfo.response, null, 2);
  };

  // Helper to determine if args is lengthy
  const getArgsString = () => {
    if (!toolInfo.args) return "";
    return JSON.stringify(toolInfo.args, null, 2);
  };

  const resultString = getResultString();
  const resultLines = resultString.split('\n').length;
  const isLongResult = resultLines > 8 || resultString.length > 500;

  const argsString = getArgsString();
  const argsLines = argsString.split('\n').length;
  const isLongArgs = argsLines > 8 || argsString.length > 500;

  return (
    <div className="mt-4">
      {toolInfo.args && (
        <div className="mb-3 bg-white/10 rounded-xl shadow border border-white/10 overflow-hidden">
          <div className="flex items-center px-4 py-2 border-b border-white/10">
            <FileText size={16} className="text-cyan-300 mr-2" />
            <span className="text-xs text-cyan-200 font-semibold tracking-wide uppercase">Arguments</span>
            <button
              onClick={() => handleCopy(argsString)}
              className="ml-auto flex items-center text-xs text-cyan-200 hover:text-white transition-colors"
              title="Copy arguments"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span className="ml-1">{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <div className="relative">
            <pre className={`px-4 py-3 text-xs font-mono text-cyan-100 bg-transparent transition-all duration-200 custom-scrollbar ${isLongArgs && !expandedArgs ? 'max-h-40 overflow-y-auto' : ''} overflow-x-auto`}>
              {argsString}
            </pre>
            {isLongArgs && (
              <button
                className="absolute right-4 bottom-2 z-10 text-xs text-cyan-200 bg-black/30 hover:bg-black/60 px-2 py-1 mb-1.5 rounded shadow pointer-events-auto"
                onClick={() => setExpandedArgs(e => !e)}
              >
                {expandedArgs ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      )}
      {toolInfo.response && (
        <div className="mb-3 bg-white/10 rounded-xl shadow border border-white/10 overflow-hidden">
          <div className="flex items-center px-4 py-2 border-b border-white/10">
            <FileText size={16} className="text-green-300 mr-2" />
            <span className="text-xs text-green-200 font-semibold tracking-wide uppercase">Result</span>
          </div>
          <div className="relative">
            <pre className={`px-4 py-3 text-xs font-mono text-green-100 bg-transparent transition-all duration-200 custom-scrollbar ${isLongResult && !expandedResult ? 'max-h-40 overflow-y-auto' : ''} overflow-x-auto`}>
              {resultString}
            </pre>
            {isLongResult && (
              <button
                className="absolute right-4 bottom-2 z-10 text-xs text-green-200 bg-black/30 hover:bg-black/60 px-2 py-1 mb-1.5 rounded shadow pointer-events-auto"
                onClick={() => setExpandedResult(e => !e)}
              >
                {expandedResult ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      )}
      {toolInfo.executionTime && (
        <div className="px-4 py-1 text-xs text-gray-400">
          Execution time: {toolInfo.executionTime}ms
        </div>
      )}
    </div>
  );
};

export default ToolInfo;