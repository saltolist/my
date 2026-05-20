"use client";

const REACTIONS = [
  { id: "fire", emoji: "🔥", count: 412 },
  { id: "heart", emoji: "❤", count: 134 },
  { id: "thumbs-up", emoji: "👍", count: 222 },
  { id: "thinking", emoji: "🤔", count: 34 },
  { id: "clap", emoji: "👏", count: 189 },
  { id: "laugh", emoji: "😂", count: 156 },
  { id: "wow", emoji: "😮", count: 98 },
  { id: "sad", emoji: "😢", count: 41 },
  { id: "party", emoji: "🎉", count: 76 },
  { id: "eyes", emoji: "👀", count: 63 },
  { id: "100", emoji: "💯", count: 55 },
  { id: "rocket", emoji: "🚀", count: 47 },
  { id: "star", emoji: "⭐", count: 39 },
  { id: "ok", emoji: "👌", count: 28 },
  { id: "pray", emoji: "🙏", count: 19 },
  { id: "muscle", emoji: "💪", count: 14 },
  { id: "heart-eyes", emoji: "😍", count: 11 },
];

export default function ChannelReactionsPanel() {
  return (
    <div className="channel-reactions-panel">
      <div className="reaction-strip" aria-label="Популярные реакции">
        {REACTIONS.map((item) => (
          <span key={item.id}>
            {item.emoji} {item.count}
          </span>
        ))}
      </div>
    </div>
  );
}
