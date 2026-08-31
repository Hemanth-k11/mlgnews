import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders the article body. react-markdown ignores raw HTML by default,
// so stored content can't inject scripts.
export default function Markdown({ children }) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children || ""}</ReactMarkdown>
    </div>
  );
}
