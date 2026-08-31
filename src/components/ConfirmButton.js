"use client";

// A submit button that asks for confirmation before the form posts.
export default function ConfirmButton({
  children,
  message = "Are you sure?",
  className = "a-btn a-btn--danger",
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
