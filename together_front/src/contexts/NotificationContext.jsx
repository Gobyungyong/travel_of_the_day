import React, { createContext, useContext, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

import { AuthContext } from "./AuthContext";

const DefaultProps = {
  unreadMessageCount: 0,
  connectionStatus: "Uninstantiated",
};

export const NotificationContext = createContext(DefaultProps);

export const NotificationContextProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const { readyState } = useWebSocket(
    user ? `ws://127.0.0.1:8000/notifications/` : null,
    {
      queryParams: {
        token: user ? user : "",
      },
      onOpen: () => {
        console.log("Connected to Notifications!");
      },
      onClose: () => {
        console.log("Disconnected from Notifications!");
      },
      onMessage: (e) => {
        const data = JSON.parse(e.data);
        switch (data.type) {
          case "unread_count":
            setUnreadMessageCount(data.unread_count);
            break;
          case "new_message_notification":
            setUnreadMessageCount((prev) => (prev += 1));
            break;

          default:
            console.error("Unknown message type!");
            break;
        }
      },
    }
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return (
    <NotificationContext.Provider
      value={{ unreadMessageCount, connectionStatus }}
    >
      {children}
    </NotificationContext.Provider>
  );
};