export const Body = ({
  children,
  centered,
}: React.PropsWithChildren & { centered?: boolean }) => {
  const centeredClass = centered
    ? "flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center"
    : "";

  return (
    <main
      className={`mx-auto w-full max-w-6xl flex-1 px-6 py-10 ${centeredClass}`}
    >
      {children}
    </main>
  );
};
