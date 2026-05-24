export const Page = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      {children}
    </div>
  );
};
