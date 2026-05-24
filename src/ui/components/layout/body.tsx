export const Body = ({ children }: React.PropsWithChildren) => {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      {children}
    </main>
  );
};
