import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";

import { AuthContext } from "../contexts/AuthContext";
import Loading from "../components/uiux/Loading";

function Conversations() {
  const { authAxios, user: loggedinUser } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [user, setUser] = useState();

  const { readyState, sendJsonMessage } = useWebSocket(
    user ? `ws://127.0.0.1:8000/conversations/` : null,
    {
      queryParams: {
        token: loggedinUser ? loggedinUser : "",
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
          case "conversations":
            setConversations(data.conversations);
            console.log("converrsations다임마", conversations);
            break;

          case "new_messages":
            setConversations(data.conversations);

          default:
            console.error("Unknown message type!");
        }
      },
    }
  );

  // async function getConversationList() {
  //   try {
  //     const res = await authAxios("api/v1/chattings/conversations/");
  //     setConversations(res.data);
  //     console.log("res", res);
  //   } catch {
  //     return;
  //   }
  // }

  async function getUserInfo() {
    const res = await authAxios.get("api/v1/users/myinfo/");
    await setUser(res.data);
  }

  useEffect(() => {
    getUserInfo();
  }, []);

  // useEffect(() => {
  //   getConversationList();
  // }, [user]);

  function createConversationName(username) {
    const namesAlph = [user?.username, username].sort();
    return `${namesAlph[0]}__${namesAlph[1]}`;
  }

  function formatMessageTimestamp(timestamp) {
    if (!timestamp) return;
    const date = new Date(timestamp);
    const formattedDate = {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDay(),
      hour: date.getHours(),
      minute: date.getMinutes(),
    };
    console.log("date", formattedDate);
    // return date.toLocaleTimeString().slice(0, 7);
    return {
      date: `${formattedDate.year}-${formattedDate.month}-${formattedDate.day}`,
      hours: `${formattedDate.hour}:${formattedDate.minute}`,
    };
  }

  if (!conversations && !user) {
    return <Loading />;
  }

  if (conversations.length === 0) {
    return <div>채팅방이 아직 존재하지 않습니다..</div>;
  }

  console.log(conversations);
  return (
    <div>
      {conversations.map((c) => (
        <Link
          to={`/chattings/${createConversationName(c.other_user?.username)}`}
          key={c.other_user?.username}
        >
          {c.other_user?.username}
          <div>{formatMessageTimestamp(c.last_message?.timestamp)?.date}</div>
          <div>{formatMessageTimestamp(c.last_message?.timestamp)?.hours}</div>
          <div>마지막 메세지:{c.last_message?.content}</div>
          <div>안읽은 메세지:{c.unread_messages_count}</div>
        </Link>
      ))}
    </div>
  );
}

export default Conversations;
