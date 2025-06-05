import React, { useState } from "react";
import { Plus, X, CheckCircle } from "lucide-react";

const ServerManager = ({ servers, activeServerId, onAddServer, onRemoveServer, onSelectServer, onClose }) => {
  const [newServerName, setNewServerName] = useState("");
  const [newServerUrl, setNewServerUrl] = useState("");

  const handleAddServer = () => {
    if (newServerName.trim() && newServerUrl.trim()) {
      onAddServer({
        name: newServerName.trim(),
        url: newServerUrl.trim()
      });
      setNewServerName("");
      setNewServerUrl("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Server Management</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Add New Server */}
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-white font-semibold mb-3">Add New Server</h3>
          <input
            type="text"
            placeholder="Server Name"
            value={newServerName}
            onChange={(e) => setNewServerName(e.target.value)}
            className="w-full p-2 mb-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="WebSocket URL (ws://localhost:8000/ws/ai)"
            value={newServerUrl}
            onChange={(e) => setNewServerUrl(e.target.value)}
            className="w-full p-2 mb-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleAddServer}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} className="inline mr-2" />
            Add Server
          </button>
        </div>

        {/* Server List */}
        <div>
          <h3 className="text-white font-semibold mb-3">Available Servers</h3>
          {servers.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No servers configured</p>
          ) : (
            <div className="space-y-2">
              {servers.map((server) => (
                <div
                  key={server.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    activeServerId === server.id
                      ? "bg-blue-600 border-blue-500"
                      : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                  }`}
                  onClick={() => onSelectServer(server.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">{server.name}</div>
                      <div className="text-gray-300 text-sm">{server.url}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {activeServerId === server.id && (
                        <CheckCircle size={16} className="text-green-400" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveServer(server.id);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerManager;