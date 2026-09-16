import { toggleLikeAction } from "@/lib/actions";

export default function LikeButton({ articleId, slug, likeCount, liked }) {
  return (
    <form action={toggleLikeAction} className="like-form">
      <input type="hidden" name="articleId" value={articleId} />
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className={`like-btn${liked ? " like-btn--active" : ""}`}
        aria-pressed={liked}
        title={liked ? "Unlike" : "Like"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M12 21s-6.7-4.35-9.33-8.2C1.02 10.5 1.6 7.1 4.4 5.6c2.2-1.18 4.8-.5 6.1 1.4l1.5 2.1 1.5-2.1c1.3-1.9 3.9-2.58 6.1-1.4 2.8 1.5 3.38 4.9 1.73 7.2C18.7 16.65 12 21 12 21z" />
        </svg>
        <span>{likeCount}</span>
      </button>
    </form>
  );
}
