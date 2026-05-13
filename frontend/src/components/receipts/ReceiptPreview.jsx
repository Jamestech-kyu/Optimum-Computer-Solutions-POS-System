import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Button from '../common/Button';

export default function ReceiptPreview({ sale, onNewSale }) {

  const handlePrint = () => window.print();

  return (
    <div>
      {/* The receipt itself — styled to look like a till receipt */}
      <div
        id="receipt-content"
        className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 font-mono text-sm max-w-xs mx-auto"
      >
        {/* Shop header */}
        <div className="text-center mb-5">
          <p className="font-bold text-xl">🏪 SalesERP</p>
          <p className="text-gray-400 text-xs mt-1">Sales Receipt</p>
          <p className="text-gray-400 text-xs">{formatDate(sale.created_at)}</p>
        </div>

        {/* Sale reference */}
        <div className="border-t border-dashed border-gray-300 pt-3 mb-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Receipt No:</span>
            <span className="font-bold">{sale.receipt?.receipt_number || '—'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Sale No:</span>
            <span>{sale.sale_number}</span>
          </div>
          {sale.customer_name && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Customer:</span>
              <span>{sale.customer_name}</span>
            </div>
          )}
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Cashier:</span>
            <span>{sale.cashier_name}</span>
          </div>
        </div>

        {/* Line items */}
        <div className="border-t border-dashed border-gray-300 pt-3 mb-3">
          {sale.items?.map((item, i) => (
            <div key={i} className="mb-2.5">
              <p className="text-xs font-semibold text-gray-800">{item.product_name}</p>
              <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                <span>{item.quantity} × {formatCurrency(item.unit_price)}</span>
                <span className="font-medium text-gray-700">{formatCurrency(item.line_total)}</span>
              </div>
              {item.discount_pct > 0 && (
                <p className="text-xs text-green-600">{item.discount_pct}% item discount applied</p>
              )}
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-dashed border-gray-300 pt-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatCurrency(sale.subtotal)}</span>
          </div>
          {parseFloat(sale.discount_amount) > 0 && (
            <div className="flex justify-between text-xs text-green-600">
              <span>Discount</span>
              <span>− {formatCurrency(sale.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">VAT</span>
            <span>{formatCurrency(sale.tax_amount)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-300 pt-2 mt-1">
            <span>TOTAL</span>
            <span>{formatCurrency(sale.total_amount)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Cash Paid</span>
            <span>{formatCurrency(sale.amount_paid)}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-green-700">
            <span>Change</span>
            <span>{formatCurrency(sale.change_given)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-dashed border-gray-300 pt-4 mt-3 text-center">
          <p className="text-xs text-gray-400">Thank you for your purchase!</p>
          <p className="text-xs text-gray-300 mt-0.5">Please retain this receipt</p>
        </div>
      </div>

      {/* Action buttons below the receipt */}
      <div className="flex gap-3 mt-6">
        <Button variant="secondary" className="flex-1" onClick={handlePrint}>
          🖨️ Print Receipt
        </Button>
        <Button variant="primary" className="flex-1" onClick={onNewSale}>
          ➕ New Sale
        </Button>
      </div>
    </div>
  );
}