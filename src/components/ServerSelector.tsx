import React from 'react';

interface ServerSelectorProps {
  onConnect: () => void;
  isConnected: boolean;
  isLoading: boolean;
  activeServers: string[];
}

const ServerSelector: React.FC<ServerSelectorProps> = ({
  onConnect,
  isConnected,
  isLoading,
  activeServers
}) => {
  return (
    <div className="server-selector">
      {isConnected ? (
        <div className="connection-status connected">
          <span className="status-indicator"></span>
          Connected to: {activeServers.join(', ')}
        </div>
      ) : (
        <button
          className="connect-button"
          onClick={onConnect}
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Connect to Servers'}
        </button>
      )}
    </div>
  );
};

export default ServerSelector;