import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Search, RotateCcw, Package, RefreshCw, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/helpers';
import type { SupplierOrderInvoice } from '../../types/supplierOrder';
import type { CompletedSale } from './POSPageEnhanced';

interface ReturnRecord {
  id: string;
  returnNumber: string;
  type: 'customer' | 'supplier';
  sourceId: string;
  sourceRef: string;
  customerOrSupplier: string;
  reason: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  amount: number;
  date: string;
  items: number;
}

interface ReturnsPageProps {
  completedSales?: CompletedSale[];
  supplierInvoices?: SupplierOrderInvoice[];
  onNotifyAll?: (title: string, message: string) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function ReturnsPage({ completedSales = [], supplierInvoices = [], onNotifyAll }: ReturnsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [returnType, setReturnType] = useState<'customer' | 'supplier'>('customer');

  const [returns, setReturns] = useState<ReturnRecord[]>(() => {
    const saved = window.localStorage.getItem('pos-returns');
    return saved ? JSON.parse(saved) as ReturnRecord[] : [];
  });

  useEffect(() => {
    window.localStorage.setItem('pos-returns', JSON.stringify(returns));
  }, [returns]);

  const filteredReturns = returns.filter(r => {
    const matchesSearch = r.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerOrSupplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-orange-500/20 text-orange-600">Pending</Badge>;
      case 'approved': return <Badge className="bg-blue-500/20 text-blue-600">Approved</Badge>;
      case 'completed': return <Badge className="bg-green-500/20 text-green-600">Completed</Badge>;
      case 'rejected': return <Badge className="bg-red-500/20 text-red-600">Rejected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const notifyAll = (title: string, message: string) => {
    if (onNotifyAll) {
      onNotifyAll(title, message);
    } else {
      toast.info(`${title}: ${message}`);
    }
  };

  const handleCreateReturn = (formData: { reason: string; amount: number; description: string; sourceSale?: string; sourcePO?: string }) => {
    const record: ReturnRecord = {
      id: Date.now().toString(),
      returnNumber: `${returnType === 'customer' ? 'RET' : 'SRET'}-${Date.now().toString().slice(-8)}`,
      type: returnType,
      sourceId: formData.sourceSale || formData.sourcePO || '',
      sourceRef: formData.sourceSale || formData.sourcePO || '',
      customerOrSupplier: formData.sourceSale
        ? completedSales.find(s => s.id === formData.sourceSale)?.customer || 'Customer'
        : supplierInvoices.find(i => i.id === formData.sourcePO)?.supplierName || 'Supplier',
      reason: formData.reason,
      status: 'pending',
      amount: formData.amount,
      date: today(),
      items: 1
    };

    setReturns(prev => [record, ...prev]);
    setIsReturnDialogOpen(false);

    const label = returnType === 'customer' ? 'Customer return' : 'Supplier return';
    notifyAll(
      `New ${label} filed`,
      `${record.returnNumber} — ${record.customerOrSupplier} — ${formatCurrency(record.amount)} — ${record.reason}`
    );
    toast.success(`${label} recorded. All users notified.`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Returns Management</h1>
          <p className="text-gray-500">Customer returns & supplier returns</p>
        </div>
        <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Return
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Create Return</DialogTitle>
            </DialogHeader>
            <NewReturnForm
              returnType={returnType}
              onReturnTypeChange={setReturnType}
              completedSales={completedSales}
              supplierInvoices={supplierInvoices}
              onSubmit={handleCreateReturn}
              onCancel={() => setIsReturnDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white border-gray-200 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input placeholder="Search by return number or customer/supplier..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-gray-100 border-gray-200" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36 bg-gray-100 border-gray-200"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 bg-gray-100 border-gray-200"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">All Returns ({filteredReturns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead>Return #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer / Supplier</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReturns.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center text-gray-500 py-8">No returns recorded.</TableCell></TableRow>
              ) : filteredReturns.map(r => (
                <TableRow key={r.id} className="border-gray-200">
                  <TableCell className="text-blue-600 font-medium">{r.returnNumber}</TableCell>
                  <TableCell>
                    <Badge className={r.type === 'customer' ? 'bg-purple-500/20 text-purple-700' : 'bg-teal-500/20 text-teal-700'}>
                      {r.type === 'customer' ? 'Customer' : 'Supplier'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-900">{r.customerOrSupplier}</TableCell>
                  <TableCell className="text-gray-600 max-w-[200px] truncate">{r.reason}</TableCell>
                  <TableCell className="text-red-600">{formatCurrency(r.amount)}</TableCell>
                  <TableCell className="text-gray-600">{r.items}</TableCell>
                  <TableCell className="text-gray-600">{r.date}</TableCell>
                  <TableCell>{getStatusBadge(r.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {r.status === 'pending' && (
                        <>
                          <Button size="sm" variant="ghost" className="text-green-600" onClick={() => {
                            setReturns(prev => prev.map(x => x.id === r.id ? { ...x, status: 'approved' } : x));
                            notifyAll('Return approved', `${r.returnNumber} has been approved.`);
                          }}>Approve</Button>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => {
                            setReturns(prev => prev.map(x => x.id === r.id ? { ...x, status: 'rejected' } : x));
                            notifyAll('Return rejected', `${r.returnNumber} has been rejected.`);
                          }}>Reject</Button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => {
                          setReturns(prev => prev.map(x => x.id === r.id ? { ...x, status: 'completed' } : x));
                          notifyAll('Return completed', `${r.returnNumber} refund has been processed.`);
                        }}>Complete</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function NewReturnForm({
  returnType, onReturnTypeChange, completedSales, supplierInvoices, onSubmit, onCancel
}: {
  returnType: 'customer' | 'supplier';
  onReturnTypeChange: (t: 'customer' | 'supplier') => void;
  completedSales: CompletedSale[];
  supplierInvoices: SupplierOrderInvoice[];
  onSubmit: (data: { reason: string; amount: number; description: string; sourceSale?: string; sourcePO?: string }) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('defective');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [sourceSale, setSourceSale] = useState('');
  const [sourcePO, setSourcePO] = useState('');

  const handleSubmit = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid refund amount.'); return; }
    if (!description.trim()) { toast.error('Enter a description.'); return; }
    if (returnType === 'customer' && !sourceSale) { toast.error('Select the original sale.'); return; }
    if (returnType === 'supplier' && !sourcePO) { toast.error('Select the purchase order.'); return; }
    onSubmit({ reason: `${reason}: ${description}`, amount: amt, description, sourceSale, sourcePO });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Return Type</label>
        <div className="flex gap-2">
          <Button type="button" variant={returnType === 'customer' ? 'default' : 'outline'}
            className={returnType === 'customer' ? 'bg-blue-600' : ''} onClick={() => onReturnTypeChange('customer')}>
            <RotateCcw className="w-4 h-4 mr-2" />Customer Return
          </Button>
          <Button type="button" variant={returnType === 'supplier' ? 'default' : 'outline'}
            className={returnType === 'supplier' ? 'bg-blue-600' : ''} onClick={() => onReturnTypeChange('supplier')}>
            <Package className="w-4 h-4 mr-2" />Supplier Return
          </Button>
        </div>
      </div>

      {returnType === 'customer' ? (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Original Sale</label>
          <Select value={sourceSale} onValueChange={setSourceSale}>
            <SelectTrigger className="bg-gray-100 border-gray-200"><SelectValue placeholder="Select sale" /></SelectTrigger>
            <SelectContent>
              {completedSales.map(sale => (
                <SelectItem key={sale.id} value={sale.id}>{sale.id} — {sale.customer} — {formatCurrency(sale.amount)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Purchase Order</label>
          <Select value={sourcePO} onValueChange={setSourcePO}>
            <SelectTrigger className="bg-gray-100 border-gray-200"><SelectValue placeholder="Select PO" /></SelectTrigger>
            <SelectContent>
              {supplierInvoices.map(inv => (
                <SelectItem key={inv.id} value={inv.id}>{inv.id} — {inv.supplierName} — {formatCurrency(inv.amount)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Reason</label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger className="bg-gray-100 border-gray-200"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="defective">Defective Product</SelectItem>
            <SelectItem value="wrong_item">Wrong Item</SelectItem>
            <SelectItem value="damaged">Damaged</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="changed_mind">Changed Mind</SelectItem>
            <SelectItem value="poor_quality">Poor Quality</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} className="bg-gray-100 border-gray-200" placeholder="Describe the return reason..." rows={2} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Refund Amount (KSh)</label>
        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="bg-gray-100 border-gray-200" placeholder="0.00" />
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Submit Return</Button>
      </div>
    </div>
  );
}
