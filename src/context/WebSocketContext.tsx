import React, { createContext, useContext, useEffect, useState } from 'react';
import { webSocket } from '../api/bridge';

interface WebSocketContextProps {
  isConnected: boolean;
  lastMessage: any;
  sendMessage: (data: any) => boolean;
  addListener: (event: string, handler: Function) => void;
  removeListener: (event: string, handler: Function) => void;
}

const WebSocketContext = createContext<WebSocketContextProps>({
  isConnected: false,
  lastMessage: null,
  sendMessage: () => false,
  addListener: () => {},
  removeListener: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    if (!webSocket) return;

    // Set up connection handler
    const connectHandler = () => {
      setIsConnected(true);
    };

    // Set up disconnect handler
    const disconnectHandler = () => {
      setIsConnected(false);
    };

    // Set up message handler
    const messageHandler = (data: any) => {
      setLastMessage(data);
    };

    // Register event handlers
    webSocket.on('connect', connectHandler);
    webSocket.on('disconnect', disconnectHandler);
    webSocket.on('message', messageHandler);

    // Initial connection if not already connected
    if (!isConnected) {
      webSocket.connect();
    }

    // Clean up on unmount
    return () => {
      webSocket.off('connect', connectHandler);
      webSocket.off('disconnect', disconnectHandler);
      webSocket.off('message', messageHandler);
    };
  }, [isConnected]);

  // Send message via WebSocket
  const sendMessage = (data: any): boolean => {
    if (!webSocket) return false;
    return webSocket.send(data);
  };

  // Add event listener
  const addListener = (event: string, handler: Function) => {
    if (!webSocket) return;
    webSocket.on(event, handler);
  };

  // Remove event listener
  const removeListener = (event: string, handler: Function) => {
    if (!webSocket) return;
    webSocket.off(event, handler);
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        lastMessage,
        sendMessage,
        addListener,
        removeListener,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};