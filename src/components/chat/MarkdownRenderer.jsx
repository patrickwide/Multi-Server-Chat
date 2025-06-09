import React from "react";
import { Copy, Check } from "lucide-react";

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

export default MarkdownRenderer; 