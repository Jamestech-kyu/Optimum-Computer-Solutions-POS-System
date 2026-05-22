import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Search, ShoppingCart, CreditCard, Wallet, Smartphone, Printer, Save } from 'lucide-react';
import { CashDrawer } from '../CashDrawer';
import { TransactionNotification } from '../TransactionNotification';

// Define a type for your day balance structure
interface DayBalance {
  openingBalance: number;
  closingBalance?: number;
  status: 'OPEN' | 'CLOSED';
}

const products = [
  { id: 1, name: 'Coffee Premium', price: 4.50, stock: 25, category: 'Beverages', image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=100&h=100&fit=crop' },
  { id: 2, name: 'Croissant', price: 3.25, stock: 15, category: 'Bakery', image: 'https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?w=100&h=100&fit=crop' },
  { id: 3, name: 'Green Tea', price: 3.00, stock: 30, category: 'Beverages', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=100&h=100&fit=crop' },
  { id: 4, name: 'Sandwich Club', price: 8.50, stock: 12, category: 'Food', image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=100&h=100&fit=crop' },
  { id: 5, name: 'Muffin Blueberry', price: 2.75, stock: 20, category: 'Bakery', image: 'https://images.unsplash.com/photo-1507066274042-8a683d1e8a5c?w=100&h=100&fit=crop' },
  { id: 6, name: 'Latte', price: 4.25, stock: 18, category: 'Beverages', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=100&h=100&fit=crop' },
  { id: 7, name: 'Orange Juice', price: 3.50, stock: 22, category: 'Beverages', image: 'https://images.unsplash.com/photo-1600271886742-f049cd1f3033?w=100&h=100&fit=crop' },
  { id: 8, name: 'Caesar Salad', price: 7.99, stock: 14, category: 'Food', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=100&h=100&fit=crop' },
  { id: 9, name: 'Pizza Slice', price: 4.50, stock: 30, category: 'Food', image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=100&h=100&fit=crop' },
  { id: 10, name: 'Cookie Chocolate', price: 1.50, stock: 50, category: 'Bakery', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=100&h=100&fit=crop' },
  { id: 11, name: 'Bottled Water', price: 1.99, stock: 100, category: 'Beverages', image: 'https://images.unsplash.com/photo-1567319662202-3bac3c7f37ab?w=100&h=100&fit=crop' },
  { id: 12, name: 'Smoothie Berry', price: 5.99, stock: 16, category: 'Beverages', image: 'https://images.unsplash.com/photo-1590080876614-bc8cc1b6ceb5?w=100&h=100&fit=crop' },
  { id: 13, name: 'Bagel Cream Cheese', price: 3.99, stock: 12, category: 'Bakery', image: 'https://images.unsplash.com/photo-1585411819144-e7a16f5f38ff?w=100&h=100&fit=crop' },
  { id: 14, name: 'Soft Drink Cola', price: 2.50, stock: 45, category: 'Beverages', image: 'https://images.unsplash.com/photo-1554866585-d42c64eb5d69?w=100&h=100&fit=crop' },
  { id: 15, name: 'Pasta Carbonara', price: 9.99, stock: 8, category: 'Food', image: 'https://images.unsplash.com/photo-1595295333707-9d2e6a1c9c1d?w=100&h=100&fit=crop' },
  { id: 16, name: 'Donut Glazed', price: 2.25, stock: 35, category: 'Bakery', image: 'https://images.unsplash.com/photo-1585080205849-e8e99bc83dba?w=100&h=100&fit=crop' }
];

const customers = [
  { id: 1, name: 'Walk-in Customer' },
  { id: 2, name: 'James Nyandere' },
  { id: 3, name: 'Sherlyn Kalondu' },
  { id: 4, name: 'Silyvia Johnson' }
];

export function POSPage() {
  const [cart, setCart] = useState<Array<{id: number, name: string, price: number, quantity: number}>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState({ id: '', amount: 0, method: '' });

  // --- ADDED STATES TO RESOLVE COMPILATION ERRORS ---
  const [dayBalance, setDayBalance] = useState<DayBalance | undefined>({
    openingBalance: 5000, // Example setup amount
    status: 'OPEN'
  });
  const [cashSalesToday, setCashSalesToday] = useState<number>(0);
  // --------------------------------------------------

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: typeof products[0]) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * (discount / 100);
  const tax = (subtotal - discountAmount) * 0.1; // 10% tax
  const total = subtotal - discountAmount + tax;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products Section */}
      <div className="lg:col-span-2">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Point of Sale</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 text-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <Card key={product.id} className="bg-white border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => addToCart(product)}>
              <CardContent className="p-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-24 object-cover rounded-lg mb-3"
                />
                <h3 className="text-gray-900 font-medium mb-1">{product.name}</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-600 font-semibold">KSh {product.price}</span>
                  <Badge variant="secondary" className="text-xs">
                    {product.stock} in stock
                  </Badge>
                </div>
                <Badge variant="outline" className="text-xs text-gray-500">
                  {product.category}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="lg:col-span-1">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Current Sale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Selection */}
            <div>
              <label className="block text-gray-600 text-sm mb-2">Customer</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="bg-gray-100 border-gray-200 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-100 border-gray-200">
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cart Items */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No items in cart</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                    <div>
                      <p className="text-gray-900 text-sm">{item.name}</p>
                      <p className="text-gray-500 text-xs">KSh {item.price} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-6 h-6 p-0 text-xs"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="text-gray-900 text-sm w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-6 h-6 p-0 text-xs"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Discount */}
            <div>
              <label className="block text-gray-600 text-sm mb-2">Discount (%)</label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="bg-gray-100 border-gray-200 text-gray-900"
                min="0"
                max="100"
              />
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>KSh {subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Discount ({discount}%):</span>
                  <span>-KSh {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%):</span>
                <span>KSh {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-900 font-semibold text-lg">
                <span>Total:</span>
                <span>KSh {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-gray-600 text-sm mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaymentMethod('cash')}
                  className="flex flex-col items-center gap-1 h-12"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs">Cash</span>
                </Button>
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaymentMethod('card')}
                  className="flex flex-col items-center gap-1 h-12"
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs">Card</span>
                </Button>
                <Button
                  variant={paymentMethod === 'digital' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaymentMethod('digital')}
                  className="flex flex-col items-center gap-1 h-12"
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs">Digital</span>
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                disabled={cart.length === 0}
                onClick={() => {
                  const transactionId = `TXN-${Date.now()}`;
                  setLastTransaction({
                    id: transactionId,
                    amount: total,
                    method: paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'card' ? 'Card' : 'Digital'
                  });
                  
                  // Increment cash sales if paid via cash
                  if (paymentMethod === 'cash') {
                    setCashSalesToday(prev => prev + total);
                  }
                  
                  setIsNotificationOpen(true);
                  setCart([]);
                }}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print & Complete Sale
              </Button>
              <Button variant="outline" className="w-full" disabled={cart.length === 0}>
                <Save className="w-4 h-4 mr-2" />
                Save Sale
              </Button>
            </div>

            {/* Cash Drawer */}
            <div className="pt-4 border-t border-gray-200">
              <CashDrawer 
                isOpen={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                cashier="John kamau" 
                dayBalance={dayBalance} 
                cashSalesToday={cashSalesToday} 
                onOpenDay={function (openingBalance: number): void {
                  setDayBalance({
                    openingBalance,
                    status: 'OPEN'
                  });
                }} 
                onCloseDay={function (closingBalance: number): void {
                  setDayBalance(prev => prev ? { ...prev, closingBalance, status: 'CLOSED' } : undefined);
                }}              
              />
            </div>
          </CardContent>
        </Card>

        {/* Transaction Notification */}
        <TransactionNotification
          isOpen={isNotificationOpen}
          onOpenChange={setIsNotificationOpen}
          amount={lastTransaction.amount}
          paymentMethod={lastTransaction.method}
          transactionId={lastTransaction.id}
        />
      </div>
    </div>
  );
}