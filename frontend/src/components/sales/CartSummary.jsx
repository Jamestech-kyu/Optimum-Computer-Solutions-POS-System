import { useCart } from '../../context/CartContext';
import { useTaxConfig } from '../../hooks/useTaxConfig';
import { calculateTotals } from '../../utils/calculateTotals';
import { formatCurrency } from '../../utils/formatCurrency';
import Input from '../common/Input';

export default function CartSummary() {
  const { cart, setExtraDiscount, setNotes } = useCart();
  const taxRate = useTaxConfig();

  // Pass cart items in the shape calculateTotals expects
  const totals = calculateTotals(
    cart.items.map((i) => ({
      unit_price:   i.product.unit_price,
      quantity:     i.quantity,
      discount_pct: i.discount_pct,
    })),
    cart.extraDiscount,
    taxRate
  );

  return (
    <div className="space-y-4">

      {/* Order-level discount field */}
      <Input
        label="Order Discount (KES)"
        type="number"
        min="0"
        step="0.01"
        value={cart.extraDiscount || ''}
        onChange={(e) => setExtraDiscount(e.target.value)}
        placeholder="0.00"
        prefix="KES"
      />

      {/* Optional notes */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={cart.notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Special instructions, customer requests..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Totals breakdown */}
      <div className="border-t border-gray-200 pt-3 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>

        {totals.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-medium">
            <span>Discount</span>
            <span>− {formatCurrency(totals.discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm text-gray-600">
          <span>VAT ({(taxRate * 100).toFixed(0)}%)</span>
          <span>{formatCurrency(totals.taxAmount)}</span>
        </div>

        <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-3">
          <span>Total</span>
          <span className="text-blue-700 text-lg">{formatCurrency(totals.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}