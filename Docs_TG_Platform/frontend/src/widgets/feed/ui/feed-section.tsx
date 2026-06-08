type FeedSectionProps = {
  title: string;
  children: React.ReactNode;
  emptyText: string;
  count: number;
};

export function FeedSection({ title, children, emptyText, count }: FeedSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-muted-foreground">
        {title}
        {count > 0 ? <span className="ml-2 font-normal">({count})</span> : null}
      </h2>
      {count === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        children
      )}
    </section>
  );
}
