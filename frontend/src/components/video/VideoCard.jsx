import { Link } from "react-router-dom";

const formatViews = (views) => {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views;
};

const formatDate = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${mins} min${mins > 1 ? "s" : ""} ago`;
};

const formatDuration = (seconds) => {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const VideoCard = ({ video }) => {
  const { _id, title, thumbnail, owner, views, createdAt, duration } = video;

  return (
    <Link to={`/video/${_id}`} className="flex flex-col gap-2 group">
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-[#272727] rounded-xl overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#555">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
          </div>
        )}
        {duration && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
            {formatDuration(duration)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex gap-3 px-0.5">
        {/* Avatar */}
        <Link
          to={`/channel/${owner?.username}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 mt-0.5"
        >
          {owner?.avatar ? (
            <img
              src={owner.avatar}
              alt={owner.username}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#272727] flex items-center justify-center text-xs font-semibold text-white uppercase">
              {owner?.username?.slice(0, 2) || "YT"}
            </div>
          )}
        </Link>

        {/* Text */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <h3 className="text-white text-sm font-medium leading-snug line-clamp-2">
            {title}
          </h3>
          <Link
            to={`/channel/${owner?.username}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[#aaa] text-xs hover:text-white transition"
          >
            {owner?.username}
          </Link>
          <p className="text-[#aaa] text-xs">
            {formatViews(views || 0)} views · {formatDate(createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
