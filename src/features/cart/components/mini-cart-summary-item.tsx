import { CartSummaryItem } from "@/server/cart/repository/get-cart-summary";

export const MiniCartSummaryItem = (item: CartSummaryItem) => {
  const unitPrice = Number(item.price);
  const lineTotal = unitPrice * item.quantity;

  return (
    <div className="flex items-center gap-3">
      {item.product.image ? (
        <img
          src={item.product.image}
          alt={item.product.title}
          className="h-16 w-16 rounded object-cover"
        />
      ) : (
        <div className="h-16 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
      )}

      <div className="flex-1">
        <p className="font-medium">{item.product.title}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {item.quantity} × ${unitPrice.toFixed(2)}
        </p>
      </div>

      <p className="font-medium">${lineTotal.toFixed(2)}</p>
    </div>
  );
};
