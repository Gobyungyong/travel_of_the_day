import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import Image from "next/image";

import { AuthContext } from "../../contexts/AuthContext";
import Loading from "../../components/uiux/Loading";
import { ProtectedRoute } from "../../utils/ProtectedRoute";
import { formatTimestamp, createConversationName } from "../../utils/Funcs";

function Conversations() {
  const { authAxios, user: loggedinUser } = useContext(AuthContext);
  const [conversations, setConversations] = useState(null);
  const [user, setUser] = useState(null);

  const { readyState, sendJsonMessage } = useWebSocket(
    // user ? `wss://${window.location.host}/ws/conversations/` : null,
    user ? `ws://127.0.0.1:8000/ws/conversations/` : null,
    {
      queryParams: {
        token: loggedinUser ? loggedinUser : "",
      },

      onClose: (e) => {
        if (e.code === 1006) {
          getUserInfo();
        }
      },
      onMessage: (e) => {
        const data = JSON.parse(e.data);
        switch (data.type) {
          case "conversations":
            setConversations(data.conversations);
            break;

          case "new_messages":
            setConversations(data.conversations);

          default:
            console.error("Unknown message type!");
        }
      },
    }
  );

  async function getUserInfo() {
    // const res = await authAxios.get("/api/v1/users/myinfo/");
    const res = await authAxios.get("/api/v1/users/rest_auth/user/");
    await setUser(res.data);
  }

  useEffect(() => {
    getUserInfo();
  }, []);

  if (!conversations || !user) {
    return (
      <ProtectedRoute>
        <Loading />
      </ProtectedRoute>
    );
  }

  if (conversations.length === 0) {
    return (
      <ProtectedRoute>
        <div>채팅방이 아직 존재하지 않습니다..</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <ul
        role="list"
        className="divide-y divide-gray-100 px-5 lg:px-36 flex flex-col-reverse"
      >
        {conversations.map((c) => (
          <li key={c.id}>
            <Link
              href={`/chattings/${createConversationName(
                user,
                c.other_user?.username
              )}`}
              className="flex justify-between gap-x-6 py-5"
              key={c.other_user?.username}
            >
              <div className="flex min-w-0 gap-x-4">
                <Image
                  width={48}
                  height={48}
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
                      {formatTimestamp(c.last_message?.timestamp)?.date}
                    </div>
                    <div>
                      {formatTimestamp(c.last_message?.timestamp)?.hours}
                    </div>
                  </time>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </ProtectedRoute>
  );
}

export default Conversations;
