interface ProductsErrorProps {
  message: string;
}

export const ProductsError = ({ message }: ProductsErrorProps) => {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center"
    >
      <p className="text-lg font-medium">We couldn&apos;t load the menu</p>
      <p className="text-muted-foreground max-w-md">{message}</p>
    </div>
  );
};
