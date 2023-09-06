import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AuthContext } from "../contexts/AuthContext";

function Together() {
  const [boards, setBoards] = useState();

  const { authAxios } = useContext(AuthContext);

  async function getAllBoards() {
    const response = await authAxios.get("api/v1/boards/");
    setBoards(response.data);
  }

  useEffect(() => {
    getAllBoards();
  }, []);

  if (!boards) {
    return <div>loading...</div>;
  }

  return (
    <>
      {boards.length > 0 ? (
        boards.map((board) => (
          <div key={board.id}>
            <Link to={`/board/${board.id}`}>{board.subject}</Link>
          </div>
        ))
      ) : (
        <div>아직 게시글이 없습니다.</div>
      )}
    </>
  );
}

export default Together;
