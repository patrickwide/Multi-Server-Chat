import React from "react";
import { Copy, Check, FileText, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

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

  const getResultString = () => {
    if (!toolInfo.response) return "";
    if (typeof toolInfo.response === 'string') return toolInfo.response;
    return JSON.stringify(toolInfo.response, null, 2);
  };

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

  const ProgressBar = () => {
    const duration = toolInfo.executionTime || 0;
    const status = toolInfo.status || 'running';

    return (
      <div className="relative h-1 bg-gray-700/50 rounded-full overflow-hidden mt-2">
        <div 
          className={`absolute inset-0 ${
            status === 'error' 
              ? 'bg-red-500'
              : status === 'success'
                ? 'bg-emerald-500'
                : 'bg-amber-500 animate-pulse'
          }`}
          style={{
            width: status === 'running' ? '60%' : '100%',
          }}
        />
      </div>
    );
  };

  const ExecutionStatus = () => (
    <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 mt-2">
      <div className="flex items-center space-x-2">
        {toolInfo.status === 'error' ? (
          <AlertCircle size={14} className="text-red-400" />
        ) : toolInfo.status === 'success' ? (
          <CheckCircle2 size={14} className="text-emerald-400" />
        ) : (
          <Clock size={14} className="text-amber-400 animate-spin" />
        )}
        <span className={`text-xs font-medium ${
          toolInfo.status === 'error' 
            ? 'text-red-400' 
            : toolInfo.status === 'success'
              ? 'text-emerald-400'
              : 'text-amber-400'
        }`}>
          {toolInfo.status === 'error' 
            ? 'Execution Failed' 
            : toolInfo.status === 'success'
              ? 'Execution Complete'
              : 'Executing...'}
        </span>
      </div>
      {toolInfo.executionTime && (
        <span className="text-xs text-gray-400">
          Execution time: {toolInfo.executionTime}ms
        </span>
      )}
    </div>
  );

  return (
    <div className="mt-4 space-y-3">
      {toolInfo.toolCallId && (
        <div className="px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Tool Call ID:</span>
            <span className="text-xs text-gray-300 font-mono">{toolInfo.toolCallId}</span>
          </div>
          <ProgressBar />
        </div>
      )}
      
      {toolInfo.args && (
        <div className="bg-white/10 rounded-xl shadow border border-white/10 overflow-hidden">
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
                className="absolute right-4 bottom-2 z-10 text-xs text-cyan-200 bg-black/30 hover:bg-black/60 px-2 py-1 mb-2.5 rounded shadow pointer-events-auto"
                onClick={() => setExpandedArgs(e => !e)}
              >
                {expandedArgs ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      )}

      {toolInfo.response && (
        <div className="bg-white/10 rounded-xl shadow border border-white/10 overflow-hidden">
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
                className="absolute right-4 bottom-2 z-10 text-xs text-green-200 bg-black/30 hover:bg-black/60 px-2 py-1 mb-2.5 rounded shadow pointer-events-auto"
                onClick={() => setExpandedResult(e => !e)}
              >
                {expandedResult ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      )}

      <ExecutionStatus />
    </div>
  );
};

export default ToolInfo;