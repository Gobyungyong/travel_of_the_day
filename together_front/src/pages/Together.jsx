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

  async function SearchBoards(e) {
    e.preventDefault();
    const category = e.target.category.value;
    const keyword = e.target.keyword.value;
    const searchResults = await authAxios.get(
      `api/v1/boards/search/?category=${category}&keyword=${keyword}`
    );
    console.log("이벤트타겟", e.target.category.value);
    await setBoards(searchResults.data);
  }

  if (!boards) {
    return <div>게시글이 존재하지 않습니다.</div>;
  }

  return (
    <>
      <form onSubmit={SearchBoards}>
        <select name="category">
          <option value={"all"}>전체</option>
          <option value={"board"}>게시글</option>
          <option value={"comment"}>댓글</option>
          <option value={"boardcomment"}>게시글+댓글</option>
          <option value={"writer"}>작성자</option>
        </select>
        <input type="text" name="keyword" placeholder="검색어를 입력하세요" />
        <button>검색</button>
      </form>
      {boards.map((board) => (
        <div key={board.id}>
          <Link to={`/board/${board.id}`}>{board.subject}</Link>
        </div>
      ))}
    </>
  );
}

export default Together;
