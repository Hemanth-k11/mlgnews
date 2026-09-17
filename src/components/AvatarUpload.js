export default function AvatarUpload({ action, avatarUrl, name }) {
  return (
    <div className="avatar-row">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="avatar-lg" />
      ) : (
        <span className="avatar-lg" aria-hidden="true" />
      )}
      <form action={action} className="mini-upload">
        <input type="file" name="file" accept="image/*" required />
        <button className="a-btn" type="submit">
          Change photo
        </button>
      </form>
    </div>
  );
}
