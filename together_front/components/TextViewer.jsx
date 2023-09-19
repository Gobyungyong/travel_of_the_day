import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

import Loading from "./uiux/Loading";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <Loading />,
});

const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "link",
];

const QuillEditor = ({ value, onChange }) => {
  return (
    <ReactQuill
      value={value}
      formats={formats}
      theme={null}
      placeholder={value || "내용이 없습니다."}
      onChange={(content, delta, source, editor) => {
        onChange(content);
      }}
      readOnly={true}
    />
  );
};

export default QuillEditor;
