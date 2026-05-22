import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Printer, X } from 'lucide-react';
import { formatCurrency } from './utils/helpers';

interface ReceiptItem {
  name: string;
  quantity: number;
  uom?: string;
  price: number;
  tax: number;
  total: number;
}

interface ReceiptProps {
  transactionId: string;
  timestamp: Date;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashier: string;
  onClose: () => void;
}

export function Receipt({
  transactionId,
  timestamp,
  items,
  subtotal,
  discount,
  discountAmount,
  tax,
  total,
  paymentMethod,
  cashier,
  onClose
}: ReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white border-gray-200 print:shadow-none print:border-0 print:max-w-2xl print:mx-0">
      <CardHeader className="pb-3 print:pb-2">
        <div className="flex justify-between items-start mb-4 print:mb-2">
          <CardTitle className="text-lg print:text-xl">Receipt</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="print:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 print:space-y-3">
        {/* Header Info */}
        <div className="text-center border-b border-gray-200 pb-3 print:pb-2">
          <div className="text-sm font-mono">
            <p className="text-gray-600">Transaction ID</p>
            <p className="font-bold text-base">{transactionId}</p>
          </div>
        </div>

        {/* Date and Time */}
        <div className="text-center text-xs text-gray-600 border-b border-gray-200 pb-3 print:pb-2">
          <p className="font-mono">{formatTime(timestamp)}</p>
          <p className="text-gray-500 mt-1">Cashier: {cashier}</p>
        </div>

        {/* Items */}
        <div className="space-y-2 border-b border-gray-200 pb-3 print:pb-2">
          <div className="text-xs font-bold text-gray-700 grid grid-cols-5 gap-1 mb-2">
            <div className="col-span-2">Item</div>
            <div className="text-right">Qty</div>
            <div className="text-right">Price</div>
            <div className="text-right">Total</div>
          </div>
          {items.map((item, index) => (
            <div key={index} className="text-xs text-gray-600">
              <div className="grid grid-cols-5 gap-1 mb-1">
                <div className="col-span-2 font-medium truncate">{item.name}</div>
                <div className="text-right">
                  {item.quantity}{item.uom ? ` ${item.uom}` : ''}
                </div>
                <div className="text-right">{formatCurrency(item.price)}</div>
                <div className="text-right font-semibold">{formatCurrency(item.total)}</div>
              </div>
              {item.tax > 0 && (
                <div className="text-gray-500 text-xs ml-2">
                  Tax: {formatCurrency(item.price * item.quantity * item.tax / 100)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-2 text-sm print:text-base">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span className="font-mono">{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-orange-600">
              <span>Discount ({discount}%):</span>
              <span className="font-mono">-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Tax:</span>
            <span className="font-mono">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold bg-blue-50 p-2 rounded">
            <span>Total:</span>
            <span className="font-mono">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="text-center text-xs text-gray-600 border-t border-gray-200 pt-3 print:pt-2">
          <p className="font-semibold">Payment Method</p>
          <p className="text-gray-700">{paymentMethod}</p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-3 print:pt-2">
          <p className="mb-1">Thank you for your purchase!</p>
          <p className="text-gray-400">Please keep this receipt for your records</p>
        </div>

        {/* Print Button */}
        <Button
          onClick={handlePrint}
          className="w-full bg-blue-600 hover:bg-blue-700 print:hidden"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Receipt
        </Button>
      </CardContent>
    </Card>
  );
}
