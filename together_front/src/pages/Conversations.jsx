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

  if (!conversations && !user) {
    return <Loading />;
  }

  if (conversations.length === 0) {
    return <div>채팅방이 아직 존재하지 않습니다..</div>;
  }

  console.log(conversations);
  return (
    <>
      <ul role="list" className="divide-y divide-gray-100 px-5 lg:px-36">
        {conversations.map((c) => (
          <li key={c.id}>
            <Link
              to={`/chattings/${createConversationName(
                c.other_user?.username
              )}`}
              className="flex justify-between gap-x-6 py-5"
              key={c.other_user?.username}
            >
              <div className="flex min-w-0 gap-x-4">
                <img
                  className="h-12 w-12 flex-none rounded-full bg-gray-50"
                  src={c.other_user.avatar}
                />
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    {c.other_user.nickname}
                  </p>
                  <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                    {c.last_message.content}
                  </p>
                </div>
              </div>
              <div className=" shrink-0 sm:flex sm:flex-col sm:items-end">
                <p className="text-sm leading-6 text-gray-900">{c.role}</p>
                <p className="mt-1 text-xs leading-5 text-gray-500 flex items-center">
                  {c.unread_messages_count ? (
                    <div className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-400 mr-3">
                      <span className="text-xs font-medium leading-none text-white">
                        {c.unread_messages_count}
                      </span>
                    </div>
                  ) : null}

                  <time
                    dateTime={c.last_message.timestamp}
                    className="flex flex-col items-end"
                  >
                    <div>
                      {formatMessageTimestamp(c.last_message?.timestamp)?.date}
                    </div>
                    <div>
                      {formatMessageTimestamp(c.last_message?.timestamp)?.hours}
                    </div>
                  </time>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export default Conversations;
