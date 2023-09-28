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
