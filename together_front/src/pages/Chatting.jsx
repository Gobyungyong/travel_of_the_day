import { useState, useContext, useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useParams, useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { Avatar, AvatarBadge } from "@chakra-ui/react";

import { AuthContext } from "../contexts/AuthContext";
import Loading from "../components/uiux/Loading";
import routes from "../routes";

function Chattings() {
  const { conversationName: encodedConversationName } = useParams();
  const timeout = useRef();
  const [page, setPage] = useState(2);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [message, setMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);
  const [typingByMe, setTypingByMe] = useState(false);
  const [typing, setTyping] = useState(false);
  const [username, setUsername] = useState();
  const [participants, setParticipants] = useState([]);
  const [conversationName, setConversationName] = useState();
  const [conversation, setConversation] = useState();

  const navigate = useNavigate();

  const { user, authAxios } = useContext(AuthContext);

  async function getUserInfo() {
    const res = await authAxios.get("api/v1/users/myinfo/");
    if (res.status === 200) {
      await setUsername(res.data.username);
    }
  }

  async function getConversationInfo() {
    const res = await authAxios.get(`api/v1/chattings/${conversationName}/`);
    if (res.status === 202) {
      await setConversation(res.data);
    }
  }

  useEffect(() => {
    setConversationName(atob(encodedConversationName));
    if (conversationName) {
      const noTimeout = () => clearTimeout(timeout.current);
      const conversationUsers = conversationName.split("__");
      if (conversationUsers[0] === conversationUsers[1]) {
        alert("본인과의 대화는 지원하지 않습니다.");
        navigate(routes.homepage, { replace: true });
      }
      getUserInfo();
      noTimeout();
    }
  }, [conversationName]);

  useEffect(() => {
    getConversationInfo();
  }, [username]);

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
          setTimeout(getUserInfo, 1000);
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
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({
        type: "read_messages",
      });
    }
  }, [connectionStatus]);

  if (!username) {
    return <Loading />;
  }

  async function loadMessages() {
    const res = await authAxios.get(
      `api/v1/chattings/messages/?conversation=${conversationName}&page=${page}`
    );
    console.log("res", res);
    if (res?.status === 202) {
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
    if (!conversation) {
      getConversationInfo();
    }
    setMessage("");
  }

  function formatMessageTimestamp(timestamp) {
    if (!timestamp) return;

    const date = new Date(timestamp);

    const formattedDate = {
      year: date.getFullYear(),
      month: String(date.getMonth()).padStart(2, "0"),
      day: String(date.getDay()).padStart(2, "0"),
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
      {/* <div>
        <span>The WebSocket is currently {connectionStatus}</span>
      </div> */}
      {/* online */}
      {conversation ? (
        <div className="pb-6 px-3 md:px-5">
          {participants.includes(conversation?.other_user?.username) ? (
            <Avatar src={conversation?.other_user?.avatar}>
              <AvatarBadge boxSize="1.25em" bg="green.500" />
            </Avatar>
          ) : (
            <Avatar src={conversation?.other_user?.avatar}>
              <AvatarBadge bg="gray" boxSize="1.25em" />
            </Avatar>
          )}
          <h3 className="text-3xl font-semibold text-gray-900">
            {conversation?.other_user?.nickname}님과의 대화
          </h3>
        </div>
      ) : (
        <div className="font-semibold text-3xl text-center mb-5">
          지금 바로 대화를 시작해보세요!
        </div>
      )}

      <hr />
      <div className="flex justify-center">
        <div
          id="infinityScroll"
          className="h-[40rem] 2xl:h-[45rem] border-gray-200 border-x border-b px-3 overflow-y-scroll scrollbar-hide flex flex-col-reverse w-full md:w-2/3"
        >
          <InfiniteScroll
            className="flex flex-col-reverse"
            dataLength={messageHistory.length}
            next={loadMessages}
            inverse={true}
            hasMore={hasMoreMessages}
            loader={<Loading />}
            scrollableTarget="infinityScroll"
          >
            <ul className="flex flex-col-reverse">
              {messageHistory.map((message, i) =>
                message?.from_user?.username === username ? (
                  <li key={i} className="flex flex-col">
                    <div className="flex flex-row-reverse">
                      <div className="border border-gray-200 bg-gray-100 w-1/2 md:w-1/3 rounded-md mb-2 px-2 text-right">
                        {message?.content}
                      </div>
                      <div className="text-xs text-gray-500 my-auto mx-1 mb-2">
                        <p>
                          {formatMessageTimestamp(message?.timestamp)?.date}
                        </p>
                        <p className="text-right">
                          {formatMessageTimestamp(message?.timestamp)?.hours}
                        </p>
                      </div>
                    </div>
                  </li>
                ) : (
                  <li key={i} className="flex flex-col">
                    <div className="font-semibold mb-1">
                      {message?.from_user?.nickname}
                    </div>
                    <div className="flex">
                      <div className="border border-blue-200 bg-blue-100 md:w-1/3 w-1/2 rounded-md mb-2 px-2">
                        {message?.content}
                      </div>
                      <div className="text-xs text-gray-500 my-auto mx-1 mb-2">
                        <p>
                          {formatMessageTimestamp(message?.timestamp)?.date}
                        </p>
                        <p>
                          {formatMessageTimestamp(message?.timestamp)?.hours}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              )}
            </ul>
          </InfiniteScroll>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center justify-center mt-2"
      >
        <div className="flex justify-between rounded-md shadow-sm  ring-1  ring-gray-300 w-4/5 md:w-1/2">
          <div className="rounded-md pl-1 w-full">
            <input
              name="message"
              type="text"
              required
              maxLength={511}
              placeholder="Message"
              onChange={handleChangeMessage}
              value={message}
              className="h-full block w-full  border-0 py-1.5 px-4 text-gray-900 sm:text-sm sm:leading-6 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-300"
            />
          </div>
          <button className="text-gray-600 mr-1 w-1/5 focus:ring-1 focus:ring-inset focus:ring-indigo-300">
            보내기
          </button>
        </div>
        {typing && (
          <p className="text-sm text-gray-700 mt-1">
            상대방이 메세지를 입력중입니다...
          </p>
        )}
      </form>
    </>
  );
}

export default Chattings;
