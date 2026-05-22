import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Search, ShoppingCart, Plus, Minus, Trash2, Printer, CircleDollarSign, CreditCard } from 'lucide-react';
import { CashDrawer } from '../CashDrawer';
import { TransactionNotification } from '../TransactionNotification';
import { MultiPaymentHandler } from '../MultiPaymentHandler';
import { Receipt } from '../Receipt';
import type { PaymentTransaction } from '../MultiPaymentHandler';
import { formatCurrency } from '../utils/helpers';

export type PricingTier = 'retail' | 'wholesale' | 'corporate' | 'loyal';

interface ProductSubItem {
  id: string;
  name: string;
  uom: string;
  quantityLabel: string;
  priceMultiplier: number;
  stockUnits: number;
}

export const initialProducts = [
  {
    id: '1',
    name: 'Coffee Premium',
    sku: 'BVRY-COFFE-001',
    category: 'Beverages',
    uom: 'cup',
    prices: { retail: 250, wholesale: 210, corporate: 190, loyal: 225 },
    stock: 25,
    tax: 10,
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=100&h=100&fit=crop'
  },
  {
    id: '2',
    name: 'Croissant',
    sku: 'BKRY-CROSS-001',
    category: 'Bakery',
    uom: 'piece',
    prices: { retail: 180, wholesale: 145, corporate: 130, loyal: 160 },
    stock: 15,
    tax: 10,
    image: 'https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?w=100&h=100&fit=crop'
  },
  {
    id: '3',
    name: 'Green Tea',
    sku: 'BVRY-TEA-001',
    category: 'Beverages',
    uom: 'cup',
    prices: { retail: 150, wholesale: 120, corporate: 110, loyal: 135 },
    stock: 30,
    tax: 10,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=100&h=100&fit=crop'
  },
  {
    id: '4',
    name: 'Sandwich Club',
    sku: 'FOOD-SAND-001',
    category: 'Food',
    uom: 'plate',
    prices: { retail: 450, wholesale: 380, corporate: 350, loyal: 410 },
    stock: 12,
    tax: 10,
    image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=100&h=100&fit=crop'
  },
  {
    id: '5',
    name: 'Muffin Blueberry',
    sku: 'BKRY-MUFF-001',
    category: 'Bakery',
    uom: 'piece',
    prices: { retail: 160, wholesale: 130, corporate: 120, loyal: 145 },
    stock: 20,
    tax: 10,
    image: 'https://images.unsplash.com/photo-1507066274042-8a683d1e8a5c?w=100&h=100&fit=crop'
  },
  {
    id: '6',
    name: 'Latte',
    sku: 'BVRY-LATT-001',
    category: 'Beverages',
    uom: 'cup',
    prices: { retail: 280, wholesale: 235, corporate: 215, loyal: 255 },
    stock: 18,
    tax: 10,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=100&h=100&fit=crop'
  },
  {
    id: '7',
    name: 'Orange Juice',
    sku: 'BVRY-OJUI-001',
    category: 'Beverages',
    uom: 'glass',
    prices: { retail: 220, wholesale: 180, corporate: 165, loyal: 200 },
    stock: 22,
    tax: 10,
    image: 'https://unsplash.com/photos/orange-juice-in-clear-drinking-glass-kkrXVKK-jhg'
  },
  {
    id: '8',
    name: 'Caesar Salad',
    sku: 'FOOD-SALAD-001',
    category: 'Food',
    uom: 'bowl',
    prices: { retail: 420, wholesale: 350, corporate: 320, loyal: 385 },
    stock: 14,
    tax: 10,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=100&h=100&fit=crop'
  },
  {
    id: '9',
    name: 'Pizza Slice',
    sku: 'FOOD-PIZZA-001',
    category: 'Food',
    uom: 'slice',
    prices: { retail: 250, wholesale: 210, corporate: 190, loyal: 225 },
    stock: 30,
    tax: 10,
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=100&h=100&fit=crop'
  },
  {
    id: '10',
    name: 'Cookie Chocolate',
    sku: 'BKRY-COOK-001',
    category: 'Bakery',
    uom: 'piece',
    prices: { retail: 80, wholesale: 60, corporate: 55, loyal: 70 },
    stock: 50,
    tax: 10,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=100&h=100&fit=crop'
  },
  {
    id: '11',
    name: 'Bottled Water',
    sku: 'BVRY-WATER-001',
    category: 'Beverages',
    uom: 'bottle',
    prices: { retail: 80, wholesale: 60, corporate: 55, loyal: 70 },
    stock: 100,
    tax: 10,
    image: 'https://images.unsplash.com/photo-1567319662202-3bac3c7f37ab?w=100&h=100&fit=crop'
  },
  {
    id: '12',
    name: 'Smoothie Berry',
    sku: 'BVRY-SMOO-001',
    category: 'Beverages',
    uom: 'cup',
    prices: { retail: 350, wholesale: 300, corporate: 280, loyal: 320 },
    stock: 16,
    tax: 10,
    image: 'https://images.unsplash.com/photo-1590080876614-bc8cc1b6ceb5?w=100&h=100&fit=crop'
  },
  {
    id: '13',
    name: 'Bagel Cream Cheese',
    sku: 'BKRY-BAGEL-001',
    category: 'Bakery',
    uom: 'piece',
    prices: { retail: 220, wholesale: 180, corporate: 165, loyal: 200 },
    stock: 12,
    tax: 10,
    image: 'https://images.unsplash.com/photo-1585411819144-e7a16f5f38ff?w=100&h=100&fit=crop'
  },
  {
    id: '14',
    name: 'Soft Drink Cola',
    sku: 'BVRY-COLA-001',
    category: 'Beverages',
    uom: 'can',
    prices: { retail: 100, wholesale: 80, corporate: 75, loyal: 90 },
    stock: 45,
    tax: 10,
    image: 'https://images.unsplash.com/photo-1554866585-d42c64eb5d69?w=100&h=100&fit=crop'
  },
  {
    id: '15',
    name: 'Pasta Carbonara',
    sku: 'FOOD-PASTA-001',
    category: 'Food',
    uom: 'plate',
    prices: { retail: 650, wholesale: 560, corporate: 520, loyal: 600 },
    stock: 8,
    tax: 10,
    image: 'https://images.unsplash.com/photo-1595295333707-9d2e6a1c9c1d?w=100&h=100&fit=crop'
  },
  {
    id: '16',
    name: 'Donut Glazed',
    sku: 'BKRY-DONUT-001',
    category: 'Bakery',
    uom: 'piece',
    prices: { retail: 120, wholesale: 95, corporate: 85, loyal: 105 },
    stock: 35,
    tax: 10,
    image: 'https://images.unsplash.com/photo-1585080205849-e8e99bc83dba?w=100&h=100&fit=crop'
  }
];

export type POSProduct = (typeof initialProducts)[number];

const customers = [
  { id: '1', name: 'Walk-in Customer', type: 'retail' },
  { id: '2', name: 'John Doe', type: 'loyal' },
  { id: '3', name: 'Jane Smith', type: 'retail' },
  { id: '4', name: 'Wholesale Buyer', type: 'wholesale' },
  { id: '5', name: 'Corporate Account', type: 'corporate' }
];

interface CartItem {
  id: string;
  productId: string;
  name: string;
  uom: string;
  stockUnits: number;
  price: number;
  quantity: number;
  tax: number;
  pricingTier: PricingTier;
}

export interface CompletedSaleItem {
  productId: string;
  name: string;
  quantity: number;
  stockUnits: number;
  price: number;
  total: number;
}

export interface CompletedSale {
  id: string;
  customer: string;
  amount: number;
  cashAmount: number;
  method: string;
  timestamp: Date;
  items: CompletedSaleItem[];
}

export interface DayBalance {
  date: string;
  openingBalance: number;
  closingBalance: number | null;
  status: 'open' | 'closed';
}

interface POSPageProps {
  products: POSProduct[];
  dayBalance: DayBalance;
  onTransactionComplete: (sale: CompletedSale) => void;
  onOpenDay: (openingBalance: number) => void;
  onCloseDay: (closingBalance: number) => void;
  cashSalesToday: number;
}

export function POSPage({
  products,
  dayBalance,
  onTransactionComplete,
  onOpenDay,
  onCloseDay,
  cashSalesToday
}: POSPageProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState('1');
  const [discount, setDiscount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showMultiPayment, setShowMultiPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState({ 
    id: '', 
    amount: 0, 
    method: '',
    timestamp: new Date(),
    items: [] as any[],
    subtotal: 0,
    discountAmount: 0,
    tax: 0
  });
  const [cashTendered, setCashTendered] = useState('');

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);
  const customerType = (selectedCustomerData?.type || 'retail') as PricingTier;

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.uom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getProductSubItems(product).some(subItem =>
      subItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subItem.uom.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  function getProductSubItems(product: POSProduct): ProductSubItem[] {
    if (product.category === 'Beverages') {
      return [
        { id: 'regular', name: `Regular ${product.uom}`, uom: product.uom, quantityLabel: `1 ${product.uom}`, priceMultiplier: 1, stockUnits: 1 },
        { id: 'large', name: `Large ${product.uom}`, uom: product.uom, quantityLabel: `1 large ${product.uom}`, priceMultiplier: 1.35, stockUnits: 1 },
        { id: 'takeaway', name: 'Takeaway pack', uom: 'pack', quantityLabel: '1 pack', priceMultiplier: 1.15, stockUnits: 1 }
      ];
    }

    if (product.category === 'Bakery') {
      return [
        { id: 'single', name: `Single ${product.uom}`, uom: product.uom, quantityLabel: `1 ${product.uom}`, priceMultiplier: 1, stockUnits: 1 },
        { id: 'half-dozen', name: 'Half dozen', uom: 'pack', quantityLabel: '6 pieces', priceMultiplier: 5.5, stockUnits: 6 },
        { id: 'dozen', name: 'Dozen pack', uom: 'pack', quantityLabel: '12 pieces', priceMultiplier: 10.5, stockUnits: 12 }
      ];
    }

    return [
      { id: 'single', name: `Single ${product.uom}`, uom: product.uom, quantityLabel: `1 ${product.uom}`, priceMultiplier: 1, stockUnits: 1 },
      { id: 'family', name: 'Family portion', uom: 'portion', quantityLabel: '1 family portion', priceMultiplier: 2.8, stockUnits: 2 },
      { id: 'combo', name: 'Combo serving', uom: 'combo', quantityLabel: '1 combo', priceMultiplier: 1.6, stockUnits: 1 }
    ];
  }

  const addToCart = (product: POSProduct, subItem = getProductSubItems(product)[0]) => {
    const price = product.prices[customerType] * subItem.priceMultiplier;
    const cartId = `${product.id}-${subItem.id}`;
    const existingItem = cart.find(item => item.id === cartId);
    const currentReserved = cart
      .filter(item => item.productId === product.id)
      .reduce((sum, item) => sum + (item.stockUnits * item.quantity), 0);

    if (currentReserved + subItem.stockUnits > product.stock) {
      alert(`Only ${product.stock - currentReserved} ${product.uom} left in stock`);
      return;
    }

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === cartId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: cartId,
        productId: product.id,
        name: `${product.name} - ${subItem.name}`,
        uom: subItem.quantityLabel,
        stockUnits: subItem.stockUnits,
        price,
        quantity: 1,
        tax: product.tax,
        pricingTier: customerType
      }]);
    }
  };

  const selectProduct = (product: POSProduct, subItem: ProductSubItem) => {
    addToCart(product, subItem);
    setSearchTerm('');
    setIsProductDropdownOpen(false);
    setExpandedProductId(null);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      const targetItem = cart.find(item => item.id === id);
      const product = targetItem ? products.find(item => item.id === targetItem.productId) : undefined;
      if (targetItem && product) {
        const otherReserved = cart
          .filter(item => item.productId === targetItem.productId && item.id !== id)
          .reduce((sum, item) => sum + (item.stockUnits * item.quantity), 0);
        if (otherReserved + (targetItem.stockUnits * quantity) > product.stock) {
          alert(`Only ${product.stock - otherReserved} ${product.uom} left in stock`);
          return;
        }
      }
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * (discount / 100);
  const beforeTax = subtotal - discountAmount;
  const totalTax = cart.reduce((sum, item) => {
    const itemSubtotal = (item.price * item.quantity * item.tax) / 100;
    return sum + itemSubtotal;
  }, 0);
  const total = beforeTax + totalTax;
  const change = Math.max(0, parseFloat(cashTendered || '0') - total);

  const handleCompletePayment = (payments: PaymentTransaction[]) => {
    const transactionId = `TXN-${Date.now()}`;
    const paymentMethodLabel = payments.map(p => {
      const methodName = p.method.replace('_', ' ');
      return `${methodName}: ${formatCurrency(p.amount)}`;
    }).join(', ');
    const cashAmount = payments
      .filter(payment => payment.method === 'cash')
      .reduce((sum, payment) => sum + payment.amount, 0);

    const receiptItems = cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      uom: item.uom,
      price: item.price,
      tax: item.tax,
      total: item.price * item.quantity
    }));

    const saleItems = cart.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      stockUnits: item.stockUnits,
      price: item.price,
      total: item.price * item.quantity
    }));

    setLastTransaction({
      id: transactionId,
      amount: total,
      method: paymentMethodLabel,
      timestamp: new Date(),
      items: receiptItems,
      subtotal: subtotal,
      discountAmount: discountAmount,
      tax: totalTax
    });

    onTransactionComplete({
      id: transactionId,
      customer: selectedCustomerData?.name || 'Walk-in Customer',
      amount: total,
      cashAmount,
      method: paymentMethodLabel,
      timestamp: new Date(),
      items: saleItems
    });

    setIsNotificationOpen(true);
    setShowReceipt(true);
    setCart([]);
    setShowMultiPayment(false);
    setCashTendered('');
    setDiscount(0);
  };

  const handleCashPayment = () => {
    if (!cashTendered || parseFloat(cashTendered) < total) {
      alert('Insufficient cash');
      return;
    }

    const payments: PaymentTransaction[] = [{
      method: 'cash',
      amount: parseFloat(cashTendered),
      timestamp: new Date()
    }];

    handleCompletePayment(payments);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products Section */}
      <div className="lg:col-span-2">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Point of Sale</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Search and select a product..."
              value={searchTerm}
              onFocus={() => setIsProductDropdownOpen(true)}
              onClick={() => setIsProductDropdownOpen(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsProductDropdownOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredProducts.length > 0) {
                  e.preventDefault();
                  setExpandedProductId(filteredProducts[0].id);
                }
                if (e.key === 'Escape') {
                  setIsProductDropdownOpen(false);
                }
              }}
              className="pl-10 bg-white border-gray-200"
            />
            {isProductDropdownOpen && (
              <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                <div className="max-h-80 overflow-y-auto py-1">
                  {filteredProducts.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">No products found</div>
                  ) : (
                    filteredProducts.map(product => {
                      const subItems = getProductSubItems(product);
                      const isExpanded = expandedProductId === product.id;
                      return (
                        <div key={product.id} className="border-b border-gray-100 last:border-b-0">
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-gray-900">{product.name}</span>
                              <span className="block truncate text-xs text-gray-500">{product.sku} - {subItems.length} subitems</span>
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              <Badge variant="outline">{product.category}</Badge>
                              <span className="text-xs font-medium text-blue-600">{isExpanded ? 'Hide' : 'Choose'}</span>
                            </span>
                          </button>
                          {isExpanded && (
                            <div className="bg-gray-50 px-4 py-2">
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                {subItems.map(subItem => {
                                  const price = product.prices[customerType] * subItem.priceMultiplier;
                                  return (
                                    <button
                                      key={subItem.id}
                                      type="button"
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => selectProduct(product, subItem)}
                                      className="rounded-md border border-gray-200 bg-white px-3 py-2 text-left hover:border-blue-400 hover:bg-blue-50 focus:border-blue-500 focus:outline-none"
                                    >
                                      <span className="block text-sm font-medium text-gray-900">{subItem.name}</span>
                                      <span className="block text-xs text-gray-500">{subItem.quantityLabel}</span>
                                      <span className="mt-1 block text-sm font-semibold text-green-600">{formatCurrency(price)}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map(product => {
            const price = product.prices[customerType];
            return (
              <Card
                key={product.id}
                className="bg-white border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-24 object-cover rounded-lg mb-3"
                  />
                  <div className="space-y-2">
                    <h3 className="text-gray-900 font-medium text-sm">{product.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary" className={`
                        ${customerType === 'loyal' ? 'bg-purple-100 text-purple-800' : ''}
                        ${customerType === 'wholesale' ? 'bg-blue-100 text-blue-800' : ''}
                        ${customerType === 'corporate' ? 'bg-green-100 text-green-800' : ''}
                        ${customerType === 'retail' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {customerType.charAt(0).toUpperCase() + customerType.slice(1)}
                      </Badge>
                      <span className="text-green-600 font-bold">{formatCurrency(price)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Stock: {product.stock}</span>
                      <Badge variant="outline" className="capitalize">{product.uom}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Cart Section */}
      <div className="lg:col-span-1">
        <Card className="bg-white border-gray-200 sticky top-4">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Cart {cart.length > 0 && `(${cart.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Selection */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Customer</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="bg-gray-100 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} • {c.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cart Items */}
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm">No items in cart</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-gray-50 p-2 rounded flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm font-medium truncate">{item.name}</p>
                      <p className="text-gray-500 text-xs">{formatCurrency(item.price)} / {item.uom}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-6 h-6 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-gray-900 text-sm w-5 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-6 h-6 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-6 h-6 p-0 ml-1"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Discount */}
            {cart.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Discount (%)</label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Math.min(100, parseFloat(e.target.value) || 0))}
                  className="bg-gray-100 border-gray-200"
                  min="0"
                  max="100"
                />
              </div>
            )}

            {/* Totals */}
            {cart.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Discount ({discount}%):</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax:</span>
                  <span>{formatCurrency(totalTax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 bg-blue-50 p-2 rounded">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>

                {/* Cash Input */}
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Cash Tendered</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">KSh</span>
                    <Input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                    className="pl-12 bg-white border-gray-300"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                {change > 0 && (
                  <div className="bg-green-50 border border-green-200 p-2 rounded">
                    <p className="text-xs text-green-700">Change Due</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(change)}</p>
                  </div>
                )}

                {/* Payment Buttons */}
                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={cart.length === 0 || !cashTendered}
                    onClick={handleCashPayment}
                  >
                    <CircleDollarSign className="w-4 h-4 mr-2" />
                    Pay with Cash
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={cart.length === 0}
                    onClick={() => setShowMultiPayment(true)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Multi-Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Cash Drawer */}
            {cart.length === 0 && (
              <div className="pt-4 border-t border-gray-200">
                <CashDrawer
                  isOpen={isDrawerOpen}
                  onOpenChange={setIsDrawerOpen}
                  cashier="John Cashier"
                  dayBalance={dayBalance}
                  cashSalesToday={cashSalesToday}
                  onOpenDay={onOpenDay}
                  onCloseDay={onCloseDay}
                />
              </div>
            )}
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

        {/* Multi Payment Dialog */}
        <Dialog open={showMultiPayment} onOpenChange={setShowMultiPayment}>
          <DialogContent className="bg-white border-gray-200 max-w-md">
            <DialogHeader>
              <DialogTitle>Multi-Payment Checkout</DialogTitle>
            </DialogHeader>
            <MultiPaymentHandler
              totalAmount={total}
              onComplete={handleCompletePayment}
              onCancel={() => setShowMultiPayment(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Receipt Dialog */}
        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent className="bg-white border-gray-200 max-w-lg max-h-[90vh] overflow-y-auto">
            <Receipt
              transactionId={lastTransaction.id}
              timestamp={lastTransaction.timestamp}
              items={lastTransaction.items}
              subtotal={lastTransaction.subtotal}
              discount={discount}
              discountAmount={lastTransaction.discountAmount}
              tax={lastTransaction.tax}
              total={lastTransaction.amount}
              paymentMethod={lastTransaction.method}
              cashier="John Cashier"
              onClose={() => setShowReceipt(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
