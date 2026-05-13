/**
 * Calculates cart totals from line items.
 *
 * @param {Array}  items         - Cart items with unit_price, quantity, discount_pct
 * @param {number} extraDiscount - Flat discount on the whole order in KES
 * @param {number} taxRate       - Tax as decimal e.g. 0.16 for 16%
 */
export function calculateTotals(items = [], extraDiscount = 0, taxRate = 0) {

  // Add up each line: price × quantity × (1 minus the item's discount)
  const subtotal = items.reduce((sum, item) => {
    const discountFactor = 1 - (item.discount_pct || 0) / 100;
    return sum + (item.unit_price * item.quantity * discountFactor);
  }, 0);

  // Apply the order-level discount, but never go below zero
  const afterDiscount = Math.max(0, subtotal - extraDiscount);

  // Calculate tax on the discounted amount
  const taxAmount = afterDiscount * taxRate;

  // Final total
  const totalAmount = afterDiscount + taxAmount;

  return {
    subtotal:       parseFloat(subtotal.toFixed(2)),
    discountAmount: parseFloat(extraDiscount.toFixed(2)),
    taxAmount:      parseFloat(taxAmount.toFixed(2)),
    totalAmount:    parseFloat(totalAmount.toFixed(2)),
  };
}

export function calculateChange(totalAmount, amountPaid) {
  return parseFloat((amountPaid - totalAmount).toFixed(2));
}