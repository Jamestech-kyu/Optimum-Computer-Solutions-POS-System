import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import Button from '../common/Button';

export default function Cart({ onCheckout }) {
  const { cart, clearCart } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="text-6xl mb-4 opacity-50">🛒</div>
        <p className="text-gray-400 font-medium">Cart is empty</p>
        <p className="text-gray-300 text-sm mt-1">
          Search for a product above to add it
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700">
          {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in cart
        </p>
        <button
          onClick={clearCart}
          className="text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Scrollable item list */}
      <div className="flex-1 overflow-y-auto">
        {cart.items.map((item) => (
          <CartItem key={item.product.id} item={item} />
        ))}
      </div>

      {/* Summary and checkout button */}
      <div className="border-t border-gray-200 pt-4 mt-2 space-y-4">
        <CartSummary />
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={onCheckout}
        >
          💳 Proceed to Payment
        </Button>
      </div>
    </div>
  );
}