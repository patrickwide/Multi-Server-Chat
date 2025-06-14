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
    { id: 1, url: "ws://localhost:8000/ws/ai" }
  ]);
  const [activeServerId, setActiveServerId] = useState(null);

  // Add new state for message correlation
  const [conversations, setConversations] = useState(new Map());
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messageSequence, setMessageSequence] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const RECONNECT_INTERVAL = 3000;

  const activeServer = servers.find(server => server.id === activeServerId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addToConversation = (message) => {
    const conversationId = currentConversationId || generateId();
    if (!currentConversationId) {
      setCurrentConversationId(conversationId);
    }

    const messageId = generateId();
    const enrichedMessage = {
      ...message,
      id: messageId,
      conversationId,
      sequence: messageSequence,
      timestamp: new Date().toISOString(),
      parentId: message.type === "ai" ? log[log.length - 1]?.id : null
    };

    setMessageSequence(prev => prev + 1);
    setConversations(prev => {
      const updated = new Map(prev);
      if (!updated.has(conversationId)) {
        updated.set(conversationId, []);
      }
      updated.get(conversationId).push(enrichedMessage);
      return updated;
    });

    return enrichedMessage;
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

    try {
      const ws = new WebSocket(serverUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionStatus("connected");
        // Add welcome message to log
        setLog(prev => [...prev, {
          type: "system",
          text: JSON.stringify({
            status: "success",
            type: "welcome",
            message: "Connected to AI server"
          })
        }]);
      };

      const handleServerMessage = (event) => {
        setIsTyping(false);
        try {
          const jsonData = JSON.parse(event.data);
          console.log('Received message from server:', '\n', JSON.stringify(jsonData, null, 2));

          // Enrich the message with correlation IDs
          const aiMessage = addToConversation({
            type: "ai",
            text: event.data,
            tool_correlation: jsonData.tool_call_id ? {
              tool_call_id: jsonData.tool_call_id,
              execution_time_ms: jsonData.execution_time_ms,
              stage: jsonData.stage
            } : null
          });

          setLog(prev => [...prev, aiMessage]);
        } catch (error) {
          console.error('Failed to parse server message:', error);
          const errorMessage = addToConversation({
            type: "system",
            text: JSON.stringify({
              status: "error",
              type: "parse_error",
              message: "Failed to parse server message"
            })
          });
          setLog(prev => [...prev, errorMessage]);
        }
      };

      ws.onmessage = handleServerMessage;

      ws.onclose = (event) => {
        setIsConnected(false);
        setConnectionStatus("disconnected");

        // Add disconnect message to log
        setLog(prev => [...prev, {
          type: "system",
          text: JSON.stringify({
            status: "error",
            type: "disconnect",
            message: "Connection to server lost. Attempting to reconnect..."
          })
        }]);

        // Auto-reconnect only if we have an active server
        if (activeServerId) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setConnectionStatus("connecting");
            connectWebSocket(serverUrl);
          }, RECONNECT_INTERVAL);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        setConnectionStatus("error");

        // Add error message to log
        setLog(prev => [...prev, {
          type: "system",
          text: JSON.stringify({
            status: "error",
            type: "connection_error",
            message: "Failed to connect to server. Please check if the server is running and try again."
          })
        }]);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionStatus("error");
      setIsConnected(false);

      // Add error message to log
      setLog(prev => [...prev, {
        type: "system",
        text: JSON.stringify({
          status: "error",
          type: "connection_error",
          message: "Failed to establish WebSocket connection. Please check the server URL and try again."
        })
      }]);
    }
  };

  const handleAddServer = ({ url }) => {
    const newServer = {
      id: Date.now(),
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

    const userMessage = addToConversation({ type: "user", text: msg });
    setLog((prev) => [...prev, userMessage]);

    wsRef.current.send(JSON.stringify({
      text: msg,
      message_id: userMessage.id,
      conversation_id: userMessage.conversationId,
      sequence: userMessage.sequence
    }));

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