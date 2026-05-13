import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useTaxConfig } from '../../hooks/useTaxConfig';
import { calculateTotals, calculateChange } from '../../utils/calculateTotals';
import { formatCurrency } from '../../utils/formatCurrency';
import { createSale } from '../../api/sales';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import ReceiptPreview from '../receipts/ReceiptPreview';

export default function PaymentModal({ isOpen, onClose }) {
  const { cart, clearCart } = useCart();
  const taxRate = useTaxConfig();
  const { success, error: notifyError } = useNotification();

  const [amountPaid,     setAmountPaid    ] = useState('');
  const [paymentMethod,  setPaymentMethod ] = useState('cash');
  const [loading,        setLoading       ] = useState(false);
  const [completedSale,  setCompletedSale ] = useState(null);

  // Recalculate every time the modal renders
  const totals = calculateTotals(
    cart.items.map((i) => ({
      unit_price:   i.product.unit_price,
      quantity:     i.quantity,
      discount_pct: i.discount_pct,
    })),
    cart.extraDiscount,
    taxRate
  );

  const paid      = parseFloat(amountPaid) || 0;
  const change    = calculateChange(totals.totalAmount, paid);
  const canSubmit = paid >= totals.totalAmount && cart.items.length > 0;

  const handleProcess = async () => {
    setLoading(true);
    try {
      const payload = {
        customer: cart.customer?.id || null,
        items: cart.items.map((i) => ({
          product:      i.product.id,
          quantity:     i.quantity,
          discount_pct: i.discount_pct,
        })),
        discount_amount: cart.extraDiscount,
        amount_paid:     paid,
        payment_method:  paymentMethod,
        notes:           cart.notes,
      };

      const { data } = await createSale(payload);
      setCompletedSale(data);
      success('Sale completed successfully!');

    } catch (err) {
      const message = err.response?.data?.detail
        || err.response?.data?.non_field_errors?.[0]
        || 'Sale failed. Please check the details and try again.';
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSale = () => {
    clearCart();
    setCompletedSale(null);
    setAmountPaid('');
    setPaymentMethod('cash');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={completedSale ? handleNewSale : onClose}
      title={completedSale ? '✅ Sale Complete' : '💳 Process Payment'}
      size="md"
    >
      {/* Show receipt after sale is done */}
      {completedSale ? (
        <ReceiptPreview
          sale={completedSale}
          onNewSale={handleNewSale}
        />
      ) : (

        <div className="space-y-5">

          {/* Big total display */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
            <p className="text-sm text-blue-500 mb-1 font-medium">Amount Due</p>
            <p className="text-4xl font-bold text-blue-700">
              {formatCurrency(totals.totalAmount)}
            </p>
            <p className="text-xs text-blue-400 mt-2">
              Subtotal {formatCurrency(totals.subtotal)}
              {totals.discountAmount > 0 && ` · Disc −${formatCurrency(totals.discountAmount)}`}
              {` · VAT ${formatCurrency(totals.taxAmount)}`}
            </p>
          </div>

          {/* Payment method selector */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'cash',   label: 'Cash',   icon: '💵' },
                { value: 'card',   label: 'Card',   icon: '💳' },
                { value: 'mobile', label: 'Mobile', icon: '📱' },
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  className={`
                    py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all
                    ${paymentMethod === method.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="block text-xl mb-1">{method.icon}</span>
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount tendered */}
          <Input
            label="Amount Tendered (KES)"
            type="number"
            min={totals.totalAmount}
            step="1"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            placeholder={totals.totalAmount.toFixed(2)}
            prefix="KES"
            autoFocus
          />

          {/* Change display */}
          {paid > 0 && (
            <div className={`
              rounded-xl p-4 text-center border
              ${change >= 0
                ? 'bg-green-50 border-green-100'
                : 'bg-red-50 border-red-100'
              }
            `}>
              <p className={`text-xs font-medium mb-1 ${change >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                {change >= 0 ? 'Change to give customer' : 'Amount still needed'}
              </p>
              <p className={`text-3xl font-bold ${change >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(change))}
              </p>
            </div>
          )}

          {/* Complete sale button */}
          <Button
            variant="success"
            size="lg"
            className="w-full"
            onClick={handleProcess}
            loading={loading}
            disabled={!canSubmit}
          >
            ✅ Complete Sale
          </Button>

          {!canSubmit && paid > 0 && (
            <p className="text-center text-xs text-red-500">
              Amount tendered is less than the total due
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
