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
      // className="border-2 h-[500px] border-indigo-400 rounded-md focus:outline-none focus:border-indigo-700 focus:border-2 overflow-hidden"
      value={value}
      // modules={modules}
      formats={formats}
      theme={null}
      placeholder="내용을 입력하세요."
      onChange={(content, delta, source, editor) => {
        onChange(content);
      }}
      readOnly={true}
    />
  );
};

export default QuillEditor;
