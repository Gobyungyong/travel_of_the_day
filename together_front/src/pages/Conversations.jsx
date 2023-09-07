import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AuthContext } from "../contexts/AuthContext";
import Loading from "../components/uiux/Loading";

function Conversations() {
  const { authAxios } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [user, setUser] = useState();

  async function getConversationList() {
    const res = await authAxios("api/v1/chattings/conversations/");
    setConversations(res.data);
    console.log("res", res);
  }

  async function getUserInfo() {
    const res = await authAxios.get("api/v1/users/myinfo/");
    await setUser(res.data);
  }

  useEffect(() => {
    getUserInfo();
  }, []);

  useEffect(() => {
    getConversationList();
  }, [user]);

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

  if (!conversations || !user) {
    return <Loading />;
  }

  return (
    <div>
      {conversations.map((c) => (
        <Link
          to={`/chattings/${createConversationName(c.other_user?.username)}`}
          key={c.other_user?.username}
        >
          {c.other_user?.username}
          <div className="text-gray-700">
            {formatMessageTimestamp(c.last_message?.timestamp).date}
          </div>
          <div>{formatMessageTimestamp(c.last_message?.timestamp).hours}</div>
          <div>마지막 메세지:{c.last_message?.content}</div>
        </Link>
      ))}
    </div>
  );
}

export default Conversations;
