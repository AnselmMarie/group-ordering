interface HeaderProps {
  groupOrder: React.ReactNode;
  miniCart: React.ReactNode;
}

export const Header = ({ groupOrder, miniCart }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-sm font-bold text-white dark:bg-white dark:text-zinc-900">
          G
        </div>
        <span className="text-lg font-semibold tracking-tight">GroupOrder</span>
      </div>

      <div className="flex items-center gap-2">
        {groupOrder}
        {miniCart}
      </div>
    </header>
  );
};
