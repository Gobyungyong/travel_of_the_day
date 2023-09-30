// 프로필 사진 업로드(미리보기)
export function onUpload(e, setImageSrc) {
  const file = e.target.files[0];
  const fileExt = file.name.split(".").pop();

  // 파일 확장자 유효성 검사, input 태그 accept="image/*" 속성은 강제성 x
  if (!["jpeg", "png", "jpg", "JPG", "PNG", "JPEG"].includes(fileExt)) {
    alert("jpg, png, jpg 파일만 업로드가 가능합니다.");
    return;
  }

  const reader = new FileReader();
  reader.readAsDataURL(file);

  return new Promise((resolve) => {
    reader.onload = () => {
      setImageSrc(reader.result || null); // 파일의 컨텐츠
      resolve();
    };
  });
}

// 아이디 중복검사
export async function checkIdAvailability(
  getValues,
  authAxios,
  setIsIdAvailable,
  clearErrors
) {
  const username = getValues("username");
  try {
    const response = await authAxios.post("/api/v1/users/check_username/", {
      username,
    });

    if (response.status === 200) {
      setIsIdAvailable(1);
      clearErrors("username");
    } else {
      setIsIdAvailable(-1);
    }
  } catch (error) {
    console.error("중복확인 실패:", error);
  }
}

// 닉네임 중복검사
export async function checkNicknameAvailability(
  getValues,
  authAxios,
  setIsNicknameAvailable,
  clearErrors
) {
  const nickname = getValues("nickname");
  try {
    const response = await authAxios.post("/api/v1/users/check_nickname/", {
      nickname,
    });

    if (response.status === 200) {
      setIsNicknameAvailable(2);
      clearErrors("nickname");
    } else {
      setIsNicknameAvailable(-2);
    }
  } catch (error) {
    console.error("중복확인 실패:", error);
  }
}

// 시간 포맷팅
export function formatTimestamp(timestamp) {
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

// together 게시글 detail GET요청
export async function getBoardDetail(setBoard, authAxios, boardId) {
  const res = await authAxios.get(`/api/v1/boards/${boardId}/`);
  setBoard(res.data);
}

// together 게시글 작성 POST요청
export async function onNewBoardValid(data, authAxios, router, setError) {
  const content = data.content;
  const subject = data.subject;
  if (content === "<p><br></p>") {
    setError("content", { message: "내용을 입력해주세요." });
    return;
  }

  const response = await authAxios.post("/api/v1/boards/new/", {
    content,
    subject,
  });
  await router.push(`/board/${response.data.id}`, undefined, {
    replace: true,
  });
}

// together 게시글 수정 PUT요청
export async function onModifiedBoardValid(
  data,
  boardId,
  authAxios,
  router,
  setError
) {
  const content = data.content;
  const subject = data.subject;
  if (content === "<p><br></p>") {
    setError("content", { message: "내용을 입력해주세요." });
    return;
  }

  const response = await authAxios.put(`/api/v1/boards/${boardId}/`, {
    content,
    subject,
  });
  await router.replace(`/board/${response.data.id}`);
}

// 댓글+대댓글 값 구하기
export function commentsCount(board) {
  let count = board.comments_count;
  board.comment_set.forEach((comment) => {
    count += comment.recomments_count;
  });
  return count;
}

export function removeHtmlTags(str) {
  if (str && typeof str === "string") {
    return str.replace(/<[^>]*>/g, "");
  } else {
    return "";
  }
}

export function createConversationName(user, username) {
  const namesAlph = [user?.username, username].sort();
  return btoa(`${namesAlph[0]}__${namesAlph[1]}`);
}
