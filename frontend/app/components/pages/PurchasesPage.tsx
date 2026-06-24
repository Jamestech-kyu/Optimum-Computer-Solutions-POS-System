import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Search, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { SupplierOrderInvoice } from '../../types/supplierOrder';
import { formatCurrency } from '../utils/helpers';

const today = () => new Date().toISOString().slice(0, 10);

interface PurchasesPageProps {
  supplierInvoices: SupplierOrderInvoice[];
  onReceiveGoods?: (invoice: SupplierOrderInvoice) => void;
  onSupplierOrderCreated?: (invoice: Omit<SupplierOrderInvoice, 'id'>) => void;
}

export function PurchasesPage({ supplierInvoices, onReceiveGoods, onSupplierOrderCreated }: PurchasesPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    supplierId: '',
    supplierName: '',
    date: today(),
    amount: '',
    paymentMethod: 'credit',
    items: [] as { name: string; qty: number; price: number }[]
  });
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [viewingPurchase, setViewingPurchase] = useState<typeof pagePurchases[number] | null>(null);
  const livePurchases = supplierInvoices.map(invoice => ({
    id: invoice.id.replace('SUP-INV', 'PUR'),
    supplier: invoice.supplierName,
    date: invoice.date,
    amount: invoice.amount,
    status: invoice.status,
    items: invoice.items,
    deliveryNote: invoice.deliveryNote,
    goodsReceivingNote: invoice.goodsReceivingNote,
    requestedItems: invoice.orderItems?.reduce((sum, item) => sum + item.requestedQuantity, 0) || invoice.quantityRequested || 0,
    deliveredItems: invoice.orderItems?.reduce((sum, item) => sum + item.deliveredQuantity, 0) || invoice.quantityDelivered || 0,
    pendingItems: invoice.orderItems?.reduce((sum, item) => sum + item.pendingQuantity, 0) || invoice.quantityPending || 0,
    orderItems: invoice.orderItems || []
  }));
  const pagePurchases = livePurchases;
  const pageSuppliers = Array.from(new Map(supplierInvoices.map(invoice => [invoice.supplierId, { id: invoice.supplierId, name: invoice.supplierName }])).values());

  const hasReceivableItems = (purchase: typeof pagePurchases[number]) => purchase.pendingItems > 0 || purchase.status !== 'delivered';

  const filteredPurchases = pagePurchases.filter(purchase => {
    const matchesSearch = purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const addLineItem = () => {
    const name = newItemName.trim();
    const qty = Number(newItemQty);
    const price = Number(newItemPrice);
    if (!name || !qty || qty <= 0 || !price || price <= 0) {
      toast.error('Enter a valid item name, quantity, and price.');
      return;
    }
    setNewPurchase(prev => ({
      ...prev,
      items: [...prev.items, { name, qty, price }],
      amount: String(Number(prev.amount) + qty * price)
    }));
    setNewItemName('');
    setNewItemQty('');
    setNewItemPrice('');
  };

  const handleCreatePurchase = (status: SupplierOrderInvoice['status'] = 'draft') => {
    const supplier = pageSuppliers.find(s => s.id.toString() === newPurchase.supplierId);
    if (!supplier) { toast.error('Select a supplier.'); return; }
    const amount = Number(newPurchase.amount);
    if (status !== 'draft' && (!amount || amount <= 0)) { toast.error('Enter a valid purchase amount.'); return; }

    if (onSupplierOrderCreated) {
      onSupplierOrderCreated({
        supplierId: supplier.id,
        supplierName: supplier.name,
        contact: '',
        date: newPurchase.date || today(),
        amount: amount || 0,
        status,
        items: newPurchase.items.length || 1,
        paymentMethod: newPurchase.paymentMethod,
        orderItems: newPurchase.items.length > 0 ? newPurchase.items.map((item, idx) => ({
          productId: String(idx),
          productName: item.name,
          requestedQuantity: item.qty,
          deliveredQuantity: 0,
          pendingQuantity: item.qty,
          unitCost: item.price
        })) : undefined
      });
    }
    toast.success('Purchase order created');
    setIsAddDialogOpen(false);
    setNewPurchase({ supplierId: '', supplierName: '', date: today(), amount: '', paymentMethod: 'credit', items: [] });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'requested':
        return <Badge className="bg-blue-500/20 text-blue-600">Requested</Badge>;
      case 'pending':
        return <Badge className="bg-orange-500/20 text-orange-600">Pending</Badge>;
      case 'delivered':
        return <Badge className="bg-blue-500/20 text-blue-600">Delivered</Badge>;
      case 'draft':
        return <Badge className="bg-gray-500/20 text-gray-500">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Management</h1>
          <p className="text-gray-500">Track and manage supplier purchases</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Purchase
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Create New Purchase Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Supplier</label>
                  <Select value={newPurchase.supplierId} onValueChange={v => setNewPurchase(prev => ({ ...prev, supplierId: v }))}>
                    <SelectTrigger className="bg-gray-100 border-gray-200 text-gray-900">
                      <SelectValue placeholder="Select Supplier" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-100 border-gray-200">
                      {pageSuppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Date</label>
                  <Input type="date" value={newPurchase.date} onChange={e => setNewPurchase(prev => ({ ...prev, date: e.target.value }))} className="bg-gray-100 border-gray-200 text-gray-900" />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-600 text-sm mb-2">Purchase Items</label>
                <div className="space-y-2 max-h-32 overflow-y-auto mb-2">
                  {newPurchase.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center text-sm text-gray-700">
                      <span className="flex-1">{item.name}</span>
                      <span className="w-20 text-center">{item.qty}</span>
                      <span className="w-24 text-right">{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 items-center">
                    <Input placeholder="Item name" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="bg-gray-100 border-gray-200 text-gray-900 flex-1" />
                    <Input placeholder="Qty" type="number" value={newItemQty} onChange={e => setNewItemQty(e.target.value)} className="bg-gray-100 border-gray-200 text-gray-900 w-20" />
                    <Input placeholder="Price" type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="bg-gray-100 border-gray-200 text-gray-900 w-24" />
                    <Button size="sm" variant="outline" onClick={addLineItem}>+</Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Payment Method</label>
                  <Select value={newPurchase.paymentMethod} onValueChange={v => setNewPurchase(prev => ({ ...prev, paymentMethod: v }))}>
                    <SelectTrigger className="bg-gray-100 border-gray-200 text-gray-900">
                      <SelectValue placeholder="Select Payment Method" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-100 border-gray-200">
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Total Amount</label>
                  <Input placeholder="0.00" type="number" value={newPurchase.amount} onChange={e => setNewPurchase(prev => ({ ...prev, amount: e.target.value }))} className="bg-gray-100 border-gray-200 text-gray-900" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handleCreatePurchase('pending')}>Create Purchase</Button>
                <Button variant="outline" onClick={() => handleCreatePurchase('draft')}>Save as Draft</Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Purchases</p>
                <p className="text-2xl font-semibold text-gray-900">{pagePurchases.length}</p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">This Month</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(pagePurchases.reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Orders</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {pagePurchases.reduce((sum, purchase) => sum + purchase.pendingItems, 0)}
                </p>
              </div>
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Suppliers</p>
                <p className="text-2xl font-semibold text-gray-900">{pageSuppliers.length}</p>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border-gray-200 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Search by purchase ID or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-100 border-gray-200 text-gray-900"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-gray-100 border-gray-200 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-100 border-gray-200">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Purchase Orders ({filteredPurchases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-600">Purchase ID</TableHead>
                <TableHead className="text-gray-600">Supplier</TableHead>
                <TableHead className="text-gray-600">Date</TableHead>
                <TableHead className="text-gray-600">Amount</TableHead>
                <TableHead className="text-gray-600">Requested</TableHead>
                <TableHead className="text-gray-600">Delivered</TableHead>
                <TableHead className="text-gray-600">Pending</TableHead>
                <TableHead className="text-gray-600">GRN</TableHead>
                <TableHead className="text-gray-600">Delivery Note</TableHead>
                <TableHead className="text-gray-600">Status</TableHead>
                <TableHead className="text-gray-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map(purchase => (
                <TableRow key={purchase.id} className="border-gray-200">
                  <TableCell className="text-blue-600 font-medium">{purchase.id}</TableCell>
                  <TableCell className="text-gray-900">{purchase.supplier}</TableCell>
                  <TableCell className="text-gray-600">{purchase.date}</TableCell>
                  <TableCell className="text-green-600">{formatCurrency(purchase.amount)}</TableCell>
                  <TableCell className="text-gray-600">{purchase.requestedItems}</TableCell>
                  <TableCell className="text-green-600">{purchase.deliveredItems}</TableCell>
                  <TableCell className={purchase.pendingItems > 0 ? 'text-orange-600' : 'text-gray-600'}>{purchase.pendingItems}</TableCell>
                  <TableCell className="text-gray-600">{purchase.goodsReceivingNote || '-'}</TableCell>
                  <TableCell className="text-gray-600">{purchase.deliveryNote || '-'}</TableCell>
                  <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-300" onClick={() => setViewingPurchase(purchase)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-300" onClick={() => {
                        const originalInvoice = supplierInvoices.find(inv => inv.id.replace('SUP-INV', 'PUR') === purchase.id);
                        if (originalInvoice) onReceiveGoods?.(originalInvoice);
                        else toast.info('Receive goods not available');
                      }}>
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Purchase Detail Dialog */}
      <Dialog open={!!viewingPurchase} onOpenChange={o => { if (!o) setViewingPurchase(null); }}>
        <DialogContent className="bg-white border-gray-200 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{viewingPurchase?.id}</DialogTitle>
          </DialogHeader>
          {viewingPurchase && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Supplier</span><span className="text-gray-900">{viewingPurchase.supplier}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="text-gray-900">{viewingPurchase.date}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="text-green-600">{formatCurrency(viewingPurchase.amount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span>{getStatusBadge(viewingPurchase.status)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Requested</span><span className="text-gray-900">{viewingPurchase.requestedItems}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Delivered</span><span className="text-gray-900">{viewingPurchase.deliveredItems}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pending</span><span className="text-orange-600">{viewingPurchase.pendingItems}</span></div>
              {viewingPurchase.orderItems && viewingPurchase.orderItems.length > 0 && (
                <div>
                  <p className="text-gray-500 mb-1">Items</p>
                  {viewingPurchase.orderItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700 pl-2">
                      <span>{item.productName}</span>
                      <span>{item.requestedQuantity} x {formatCurrency(item.unitCost)}</span>
                    </div>
                  ))}
                </div>
              )}
              <Button className="w-full mt-2" variant="outline" onClick={() => setViewingPurchase(null)}>Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
