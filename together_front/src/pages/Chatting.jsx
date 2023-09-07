import { useState, useContext, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useParams } from "react-router-dom";

import { AuthContext } from "../contexts/AuthContext";

function Chattings() {
  const { conversationName } = useParams();
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [message, setMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);

  const { user, authAxios } = useContext(AuthContext);

  async function getUserInfo() {
    const res = await authAxios.get("api/v1/users/myinfo/");
  }

  const { readyState, sendJsonMessage } = useWebSocket(
    user ? `ws://127.0.0.1:8000/chattings/${conversationName}/` : null,
    {
      queryParams: {
        token: user ? user : "",
      },
      onOpen: (e) => {
        console.log("Connected!", e);
      },
      onClose: (e) => {
        console.log("Disconnected!", e);
        if (e.code === 1006) {
          getUserInfo();
        }
      },
      onMessage: (e) => {
        // MessageEvent {isTrusted: true, data: `{"type": "welcome_message", "message": "Hey there! You've successfully connected!"}`, origin: 'ws://127.0.0.1:8000', lastEventId: '', source: null, …}

        const data = JSON.parse(e.data);
        switch (data.type) {
          case "chat_message_echo":
            setMessageHistory((prev) => prev.concat(data.message));
            break;
          case "last_50_messages":
            setMessageHistory(data.messages);
            break;

          default:
            console.error("Unknown message type!");
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

  function handleChangeMessage(e) {
    setMessage(e.target.value);
  }

  function handleSubmit() {
    sendJsonMessage({
      type: "chat_message",
      message,
    });
    setMessage("");
  }

  return (
    <>
      <div>
        <span>The WebSocket is currently {connectionStatus}</span>
      </div>

      <hr />
      <ul>
        {messageHistory.map((message, i) => (
          <div className="border border-gray-200 py-3 px-3" key={i}>
            {message.from_user.username}: {message.content}
          </div>
        ))}
      </ul>
      <div>
        <input
          name="message"
          placeholder="Message"
          onChange={handleChangeMessage}
          value={message}
          className="ml-2 shadow-sm sm:text-sm border-gray-300 bg-gray-100 rounded-md"
        />
        <button className="ml-3 bg-gray-300 px-3 py-1" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </>
  );
}

export default Chattings;
