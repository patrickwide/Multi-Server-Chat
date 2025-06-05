import React, { useEffect, useState, useRef } from "react";
import Header from "./components/Header";
import ChatMessages from "./components/ChatMessages";
import MessageInput from "./components/MessageInput";
import ServerManager from "./components/ServerManager";

// Main App Component
function App() {
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [showServerManager, setShowServerManager] = useState(false);
  const [servers, setServers] = useState([
    { id: 1, name: "Local AI Server", url: "ws://localhost:8000/ws/ai" }
  ]);
  const [activeServerId, setActiveServerId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const RECONNECT_INTERVAL = 3000;

  const activeServer = servers.find(server => server.id === activeServerId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const connectWebSocket = (serverUrl) => {
    // Close existing connection
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setConnectionStatus("connecting");
    setLog([]); // Clear chat log when switching servers
    
    const ws = new WebSocket(serverUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setConnectionStatus("connected");
    };

    ws.onmessage = (event) => {
      setIsTyping(false);
      setLog((prev) => [...prev, { type: "ai", text: event.data }]);
    };

    ws.onclose = () => {
      setIsConnected(false);
      setConnectionStatus("disconnected");
      
      // Auto-reconnect only if we have an active server
      if (activeServerId) {
        reconnectTimeoutRef.current = setTimeout(() => {
          setConnectionStatus("connecting");
          connectWebSocket(serverUrl);
        }, RECONNECT_INTERVAL);
      }
    };

    ws.onerror = () => {
      setIsConnected(false);
      setConnectionStatus("error");
    };
  };

  const handleAddServer = ({ name, url }) => {
    const newServer = {
      id: Date.now(),
      name,
      url: url.startsWith('ws://') || url.startsWith('wss://') ? url : `ws://${url}`
    };
    setServers(prev => [...prev, newServer]);
  };

  const handleRemoveServer = (serverId) => {
    if (serverId === activeServerId) {
      // Disconnect if removing active server
      setActiveServerId(null);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    }
    setServers(prev => prev.filter(server => server.id !== serverId));
  };

  const handleSelectServer = (serverId) => {
    const server = servers.find(s => s.id === serverId);
    if (server) {
      setActiveServerId(serverId);
      connectWebSocket(server.url);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [log]);

  useEffect(() => {
    // Cleanup function
    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const sendMsg = () => {
    if (!msg.trim() || !isConnected || !wsRef.current) return;
    
    setLog((prev) => [...prev, { type: "user", text: msg }]);
    wsRef.current.send(msg);
    setMsg("");
    setIsTyping(true);
    inputRef.current?.focus();
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <Header 
        isConnected={isConnected} 
        connectionStatus={connectionStatus}
        activeServer={activeServer}
        onOpenServerManager={() => setShowServerManager(true)}
      />

      <ChatMessages 
        log={log}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
        connectionStatus={connectionStatus}
        activeServer={activeServer}
      />

      <MessageInput 
        msg={msg}
        setMsg={setMsg}
        sendMsg={sendMsg}
        isConnected={isConnected}
        inputRef={inputRef}
        connectionStatus={connectionStatus}
        activeServer={activeServer}
      />

      {showServerManager && (
        <ServerManager
          servers={servers}
          activeServerId={activeServerId}
          onAddServer={handleAddServer}
          onRemoveServer={handleRemoveServer}
          onSelectServer={handleSelectServer}
          onClose={() => setShowServerManager(false)}
        />
      )}
    </div>
  );
}

export default App;