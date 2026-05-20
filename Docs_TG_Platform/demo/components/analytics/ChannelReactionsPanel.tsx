"use client";

const REACTIONS = [
  { emoji: "🔥", count: 412 },
  { emoji: "❤", count: 134 },
  { emoji: "👍", count: 222 },
  { emoji: "🤔", count: 34 },
];

export default function ChannelReactionsPanel() {
  return (
    <div className="channel-reactions-panel">
      <div className="reaction-strip" aria-label="Популярные реакции">
        {REACTIONS.map((item) => (
          <span key={item.emoji}>
            {item.emoji} {item.count}
          </span>
        ))}
      </div>
    </div>
  );
}
