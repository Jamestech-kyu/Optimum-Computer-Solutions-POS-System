import { useState } from 'react';
import CustomerSearch from '../components/customers/CustomerSearch';
import ProductSearch from '../components/products/ProductSearch';
import Cart from '../components/sales/Cart';
import PaymentModal from '../components/sales/PaymentModal';

export default function SalesPage() {
  const [paymentOpen, setPaymentOpen] = useState(false);

  return (
    // Two-panel layout — fills the screen below the navbar
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">

      {/* LEFT PANEL — Customer and product search */}
      <div className="flex-1 flex flex-col gap-5 p-6 overflow-y-auto bg-gray-50">

        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Customer (optional)
          </p>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <CustomerSearch />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Add Products
          </p>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <ProductSearch />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-600">
          <span className="font-semibold">💡 Tip:</span> Type a product name or SKU to search.
          Click a result to add it to the cart. Use the + and − buttons to adjust quantities.
        </div>
      </div>

      {/* RIGHT PANEL — Cart */}
      <div className="w-96 flex flex-col border-l border-gray-200 bg-white shadow-xl">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-800 text-lg">Current Sale</h2>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col px-5 py-4">
          <Cart onCheckout={() => setPaymentOpen(true)} />
        </div>
      </div>

      {/* Payment modal — appears when cashier clicks Proceed to Payment */}
      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
      />
    </div>
  );
}