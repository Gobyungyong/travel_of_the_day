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
  const [typingByMe, setTypingByMe] = useState(false);
  const [typing, setTyping] = useState(false);
  const [username, setUsername] = useState();
  const [participants, setParticipants] = useState([]);
  const [conversation, setConversation] = useState();

  const { user, authAxios } = useContext(AuthContext);

  async function getUserInfo() {
    const res = await authAxios.get("api/v1/users/myinfo/");
    await setUsername(res.data.username);
  }

  async function getConversationInfo() {
    const res = await authAxios.get(`api/v1/chattings/${conversationName}/`);
    if (res.status === 202) {
      await setConversation(res.data);
    }
  }

  useEffect(() => {
    const noTimeout = () => clearTimeout(timeout.current);
    getUserInfo();
    getConversationInfo();
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
            sendJsonMessage({ type: "read_messages" });
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
          case "user_join":
            setParticipants((prev) => {
              if (!prev.includes(data.user)) {
                return [...prev, data.user];
              }
              return prev;
            });
            break;
          case "user_leave":
            setParticipants((prev) => {
              const newPcpts = prev.filter((x) => x !== data.user);
              return newPcpts;
            });
            break;
          case "online_user_list":
            setParticipants(data.users);
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

  useEffect(() => {
    if (connectionStatus === "Open") {
      sendJsonMessage({
        type: "read_messages",
      });
    }
  }, [connectionStatus, sendJsonMessage]);

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

  function handleSubmit(e) {
    e.preventDefault();
    if (message.length === 0) return;
    if (message.length > 512) return;
    sendJsonMessage({
      type: "chat_message",
      message,
    });
    clearTimeout(timeout.current);
    handleQuitTyping();
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

  // 타이핑 안하는 중으로 상태 변경 후 ws에 typing false 송신
  function handleQuitTyping() {
    setTypingByMe(false);
    sendJsonMessage({ type: "typing", typing: false });
  }

  function handleTyping() {
    if (typingByMe === false) {
      // 타이핑 중 아니였으면 타이핑중으로 상태 변경 후 ws에 타이핑 메세지 송신
      setTypingByMe(true);
      sendJsonMessage({ type: "typing", typing: true });
      timeout.current = setTimeout(handleQuitTyping, 200); // 200 미리세컨드 뒤에 ws에 타이핑 종료 메세지 송신
    } else {
      // 이미 타이핑 중이였으면 handleQuitTyping 호출 200미리세컨드 지연
      clearTimeout(timeout.current);
      timeout.current = setTimeout(handleQuitTyping, 200); // 200 미리세컨드 뒤에 ws에 타이핑 종료 메세지 송신
    }
  }
  // 타이핑중인 사용자가 본인이면 입력중 표시 안나오게
  function updateTyping(typingData) {
    if (typingData.user !== username) {
      setTyping(typingData.typing);
    }
  }

  function handleChangeMessage(e) {
    setMessage(e.target.value);
    handleTyping();
  }

  return (
    <>
      <div>
        <span>The WebSocket is currently {connectionStatus}</span>
      </div>
      {/* online */}
      {conversation && (
        <div className="py-6">
          <h3 className="text-3xl font-semibold text-gray-900">
            대화상대: {conversation?.other_user?.username}
          </h3>
          <span className="text-sm">
            {conversation?.other_user?.username}
            {participants.includes(conversation.other_user?.username)
              ? " online"
              : " offline"}
          </span>
        </div>
      )}

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
        {typing && <p>상대방이 메세지를 입력중입니다...</p>}
        <button>전송</button>
      </form>
    </>
  );
}

export default Chattings;
