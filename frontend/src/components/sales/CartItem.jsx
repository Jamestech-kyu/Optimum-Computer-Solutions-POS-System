import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CartItem({ item }) {
  const { removeItem, updateQuantity, updateItemDiscount } = useCart();
  const { product, quantity, discount_pct } = item;

  // Calculate this line's total after its own discount
  const lineTotal = product.unit_price * quantity * (1 - discount_pct / 100);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">

      {/* Product details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 text-sm leading-snug truncate">
          {product.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatCurrency(product.unit_price)} each
        </p>

        {/* Per-item discount */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-xs text-gray-400">Disc:</span>
          <input
            type="number"
            min="0"
            max="100"
            value={discount_pct}
            onChange={(e) =>
              updateItemDiscount(product.id, parseFloat(e.target.value) || 0)
            }
            className="w-14 text-xs border border-gray-200 rounded-md px-1.5 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <span className="text-xs text-gray-400">%</span>
          {discount_pct > 0 && (
            <span className="text-xs text-green-600 font-medium">
              −{formatCurrency(product.unit_price * quantity * (discount_pct / 100))}
            </span>
          )}
        </div>
      </div>

      {/* Quantity buttons */}
      <div className="flex items-center gap-1 mt-1">
        <button
          onClick={() => updateQuantity(product.id, quantity - 1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors text-sm font-medium"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-semibold text-gray-800">
          {quantity}
        </span>
        <button
          onClick={() => updateQuantity(product.id, quantity + 1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-colors text-sm font-medium"
        >
          +
        </button>
      </div>

      {/* Line total and remove button */}
      <div className="text-right mt-1">
        <p className="font-bold text-gray-800 text-sm">
          {formatCurrency(lineTotal)}
        </p>
        <button
          onClick={() => removeItem(product.id)}
          className="text-xs text-red-400 hover:text-red-600 mt-1 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}