import { useState, useContext, useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";

import { AuthContext } from "../contexts/AuthContext";
import Loading from "../components/uiux/Loading";

function Chattings() {
  const { conversationName } = useParams();
  const timeout = useRef();
  const [page, setPage] = useState(2);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [message, setMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);
  const [meTyping, setMeTyping] = useState(false);
  const [typing, setTyping] = useState(false);
  const [username, setUsername] = useState();

  const { user, authAxios } = useContext(AuthContext);

  async function getUserInfo() {
    const res = await authAxios.get("api/v1/users/myinfo/");
    await setUsername(res.data.username);
  }

  useEffect(() => {
    const noTimeout = () => clearTimeout(timeout.current);
    getUserInfo();
    noTimeout();
  }, []);

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
        const data = JSON.parse(e.data);
        switch (data.type) {
          case "chat_message_echo":
            setMessageHistory((prev) => [data.message, ...prev]);
            break;
          case "last_50_messages":
            console.log("data.has_more", data.has_more);
            setMessageHistory(data.messages);
            setHasMoreMessages(data.has_more);
            break;
          case "typing":
            console.log(data);
            updateTyping(data);
            break;

          default:
            console.error("Unknown message type!");
        }
      },
    }
  );
  if (!username) {
    return <Loading />;
  }

  async function loadMessages() {
    const res = await authAxios.get(
      `api/v1/chattings/messages/?conversation=${conversationName}&page=${page}`
    );
    console.log("res", res);
    if (res.status === 202) {
      setHasMoreMessages(res.data.next);
      setPage(page + 1);
      setMessageHistory((prev) => prev.concat(res.data.messages));
    }
  }

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  function handleSubmit(e) {
    e.preventDefault();
    if (message.length === 0) return;
    if (message.length > 512) return;
    sendJsonMessage({
      type: "chat_message",
      message,
    });
    clearTimeout(timeout.current);
    timeoutFunction();
    setMessage("");
  }

  function formatMessageTimestamp(timestamp) {
    if (!timestamp) return;

    const date = new Date(timestamp);

    const formattedDate = {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDay(),
      hour: String(date.getHours()).padStart(2, "0"),
      minute: String(date.getMinutes()).padStart(2, "0"),
    };

    return {
      date: `${formattedDate.year}-${formattedDate.month}-${formattedDate.day}`,
      hours: `${formattedDate.hour}:${formattedDate.minute}`,
    };
  }
  // 사용자 입력중 여부 체크
  function timeoutFunction() {
    setMeTyping(false);
    sendJsonMessage({ type: "typing", typing: false });
  }

  function onType() {
    if (meTyping === false) {
      setMeTyping(true);
      sendJsonMessage({ type: "typing", typing: true });
      timeout.current = setTimeout(timeoutFunction, 200);
    } else {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(timeoutFunction, 200);
    }
  }
  function updateTyping(event) {
    if (event.user !== username) {
      setTyping(event.typing);
    }
  }

  function handleChangeMessage(e) {
    setMessage(e.target.value);
    onType();
  }

  return (
    <>
      <div>
        <span>The WebSocket is currently {connectionStatus}</span>
      </div>

      <hr />
      <div
        id="infinityScroll"
        style={{
          height: 300,
          overflow: "scroll",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        <InfiniteScroll
          style={{ display: "flex", flexDirection: "column-reverse" }}
          dataLength={messageHistory.length}
          next={loadMessages}
          inverse={true}
          hasMore={hasMoreMessages}
          loader={<Loading />}
          scrollableTarget="infinityScroll"
        >
          {messageHistory.map((message, i) => (
            <div key={i}>
              {message?.from_user?.username}: {message?.content} -{" "}
              {formatMessageTimestamp(message?.timestamp)?.hours}
            </div>
          ))}
        </InfiniteScroll>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          name="message"
          type="text"
          required
          maxLength={511}
          placeholder="Message"
          onChange={handleChangeMessage}
          value={message}
        />
        {typing && <p>typing...</p>}
        <button>전송</button>
      </form>
    </>
  );
}

export default Chattings;
