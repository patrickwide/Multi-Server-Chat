import React from "react";
import { Settings, Globe, CheckCircle, AlertCircle, Clock } from "lucide-react";

const Header = ({ isConnected, connectionStatus, activeServer, onOpenServerManager }) => {
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected": return <CheckCircle size={16} />;
      case "connecting": return <Clock size={16} />;
      case "error": return <AlertCircle size={16} />;
      default: return <Globe size={16} />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected": return "text-green-400";
      case "connecting": return "text-yellow-400";
      case "error": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Multi-Server Chat</h1>
          {activeServer && (
            <div className="flex items-center mt-1">
              <span className="text-gray-300 text-sm mr-2">Connected to:</span>
              <span className="text-blue-400 font-medium">{activeServer.name}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="capitalize text-sm">{connectionStatus}</span>
          </div>
          <button
            onClick={onOpenServerManager}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
            title="Manage Servers"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
