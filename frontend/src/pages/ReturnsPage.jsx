import { useState } from 'react';
import { getSale } from '../api/sales';
import { createReturn } from '../api/returns';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { useNotification } from '../context/NotificationContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function ReturnsPage() {
  const { success, error: notifyError } = useNotification();

  const [saleNumber,     setSaleNumber    ] = useState('');
  const [sale,           setSale          ] = useState(null);
  const [selectedItems,  setSelectedItems ] = useState({});
  const [reason,         setReason        ] = useState('');
  const [searching,      setSearching     ] = useState(false);
  const [processing,     setProcessing    ] = useState(false);

  // Step 1 — find the original sale
  const handleSearch = async () => {
    if (!saleNumber.trim()) return;
    setSearching(true);
    setSale(null);
    setSelectedItems({});
    try {
      const { data } = await getSale(saleNumber.trim());
      setSale(data);
    } catch {
      notifyError('Sale not found. Please check the sale number.');
    } finally {
      setSearching(false);
    }
  };

  // Toggle an item on/off for return
  const toggleItem = (itemId, maxQty) => {
    setSelectedItems((prev) => {
      if (prev[itemId]) {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      }
      return { ...prev, [itemId]: { quantity: 1, maxQty } };
    });
  };

  const updateReturnQty = (itemId, qty) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        quantity: Math.max(1, Math.min(qty, prev[itemId].maxQty)),
      },
    }));
  };

  // Work out total refund from selected items
  const refundTotal = sale?.items?.reduce((sum, item) => {
    const sel = selectedItems[item.id];
    if (!sel) return sum;
    return sum + sel.quantity * parseFloat(item.unit_price);
  }, 0) || 0;

  const selectedCount = Object.keys(selectedItems).length;

  // Step 3 — submit the return
  const handleProcess = async () => {
    if (!selectedCount || !sale) return;
    setProcessing(true);
    try {
      await createReturn({
        original_sale_id: sale.id,
        reason,
        items: Object.entries(selectedItems).map(([itemId, sel]) => ({
          sale_item_id:      parseInt(itemId),
          quantity_returned: sel.quantity,
        })),
      });
      success('Return processed and refund issued.');
      setSale(null);
      setSaleNumber('');
      setSelectedItems({});
      setReason('');
    } catch {
      notifyError('Return failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Process Return</h1>

      {/* STEP 1 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">1</div>
          <h2 className="font-semibold text-gray-800">Find the Original Sale</h2>
        </div>
        <div className="flex gap-3">
          <Input
            placeholder="Enter sale number e.g. SALE-20240520-0001"
            value={saleNumber}
            onChange={(e) => setSaleNumber(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} loading={searching} disabled={!saleNumber.trim()}>
            Search
          </Button>
        </div>

        {sale && (
          <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Sale Number</span>
              <span className="font-semibold">{sale.sale_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span>{formatDate(sale.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span>{sale.customer_name || 'Walk-in'}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-gray-700">Total Paid</span>
              <span className="text-green-700">{formatCurrency(sale.total_amount)}</span>
            </div>
          </div>
        )}
      </div>

      {/* STEP 2 */}
      {sale && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">2</div>
            <h2 className="font-semibold text-gray-800">Select Items to Return</h2>
          </div>
          <div className="space-y-2">
            {sale.items?.map((item) => {
              const sel = selectedItems[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id, item.quantity)}
                  className={`
                    flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all
                    ${sel
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <input type="checkbox" checked={!!sel} readOnly className="w-4 h-4 accent-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{item.product_name}</p>
                    <p className="text-xs text-gray-400">
                      Qty sold: {item.quantity} · {formatCurrency(item.unit_price)} each
                    </p>
                  </div>
                  {sel && (
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-xs text-gray-500">Return qty:</span>
                      <input
                        type="number"
                        min="1"
                        max={item.quantity}
                        value={sel.quantity}
                        onChange={(e) => updateReturnQty(item.id, parseInt(e.target.value) || 1)}
                        className="w-14 border border-blue-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {sale && selectedCount > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">3</div>
            <h2 className="font-semibold text-gray-800">Confirm Return</h2>
          </div>

          <div className="flex flex-col gap-1 mb-4">
            <label className="text-sm font-medium text-gray-700">Reason for Return</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Defective item, wrong product, customer changed mind..."
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-orange-700">Total Refund Amount</span>
              <span className="text-2xl font-bold text-orange-600">{formatCurrency(refundTotal)}</span>
            </div>
            <p className="text-xs text-orange-400 mt-1">{selectedCount} item type{selectedCount > 1 ? 's' : ''} selected for return</p>
          </div>

          <Button
            variant="danger"
            size="lg"
            className="w-full"
            onClick={handleProcess}
            loading={processing}
          >
            Process Return & Issue Refund
          </Button>
        </div>
      )}
    </div>
  );
}