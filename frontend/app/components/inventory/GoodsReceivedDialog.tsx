import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { CheckCircle2, XCircle, Package, Truck, FileText, Loader2, Download, Mail } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import type { BackendSupplierInvoice } from '../../services/api';
import { createGoodsReceivedNote, verifyGRNItem, verifyAllGRNItems, downloadPOAsPdf, sendPOEmail, loadGoodsReceivedNotes, type BackendGoodsReceivedNote } from '../../services/api';

interface GRNReceivedItem {
  productId: string;
  productName: string;
  quantityReceived: number;
  quantityAccepted: number;
  quantityRejected: number;
  rejectionReason: string;
  unitCost: number;
}

interface GoodsReceivedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrders: BackendSupplierInvoice[];
  onRefresh: () => void;
  onReceivedAndVerified?: (order: BackendSupplierInvoice, items: GRNReceivedItem[], details: { goodsReceivingNote?: string; deliveryNote?: string; receivingLocation?: string; receivingNotes?: string }) => void;
}

interface GRNFormItem {
  purchase_order_item: number;
  product_name: string;
  product_sku: string;
  quantity_ordered: number;
  quantity_received: number;
  quantity_accepted: number;
  quantity_rejected: number;
  rejection_reason: string;
  condition: string;
  unit_cost: number;
  batch_number: string;
  location: string;
}

export const GoodsReceivedDialog: React.FC<GoodsReceivedDialogProps> = ({ open, onOpenChange, purchaseOrders, onRefresh, onReceivedAndVerified }) => {
  const [step, setStep] = useState<'select-po' | 'receive-items' | 'grn-list'>('select-po');
  const [selectedPO, setSelectedPO] = useState<BackendSupplierInvoice | null>(null);
  const [grnItems, setGrnItems] = useState<GRNFormItem[]>([]);
  const [location, setLocation] = useState('Main Store');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [courier, setCourier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingGRNs, setExistingGRNs] = useState<BackendGoodsReceivedNote[]>([]);
  const [loadingGRNs, setLoadingGRNs] = useState(false);
  const [verifyingItemId, setVerifyingItemId] = useState<number | null>(null);
  const [verifyingAll, setVerifyingAll] = useState(false);

  const pendingPOs = purchaseOrders.filter(po =>
    po.status !== 'delivered' && po.status !== 'cancelled'
  );

  useEffect(() => {
    if (open && step === 'grn-list') {
      loadGRNs();
    }
  }, [open, step]);

  const loadGRNs = async () => {
    setLoadingGRNs(true);
    try {
      const grns = await loadGoodsReceivedNotes();
      setExistingGRNs(grns);
    } catch {
      toast.error('Failed to load GRNs');
    } finally {
      setLoadingGRNs(false);
    }
  };

  const handleSelectPO = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;
    setSelectedPO(po);

    const items: GRNFormItem[] = (po.orderItems || []).map(item => ({
      purchase_order_item: Number(item.productId) || 0,
      product_name: item.productName,
      product_sku: '',
      quantity_ordered: item.requestedQuantity,
      quantity_received: item.requestedQuantity - item.deliveredQuantity,
      quantity_accepted: item.requestedQuantity - item.deliveredQuantity,
      quantity_rejected: 0,
      rejection_reason: '',
      condition: 'good',
      unit_cost: item.unitCost,
      batch_number: '',
      location: 'Main Store',
    }));
    setGrnItems(items);
    setStep('receive-items');
  };

  const handleItemChange = (index: number, field: keyof GRNFormItem, value: string | number) => {
    setGrnItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'quantity_received') {
        const received = Number(value);
        const accepted = Math.min(updated[index].quantity_accepted, received);
        updated[index] = { ...updated[index], quantity_accepted: accepted, quantity_rejected: received - accepted };
      }
      if (field === 'quantity_accepted') {
        const accepted = Number(value);
        const received = updated[index].quantity_received;
        updated[index] = { ...updated[index], quantity_accepted: accepted, quantity_rejected: Math.max(0, received - accepted) };
      }
      return updated;
    });
  };

  const handleSubmitGRN = async () => {
    if (!selectedPO) return;
    setIsSubmitting(true);
    try {
      const supplierId = selectedPO.supplierId;
      const backendId = selectedPO.backendId;
      const poId = Number(backendId || selectedPO.id);

      const validItems = grnItems.filter(item => item.quantity_received > 0);
      if (validItems.length === 0) {
        toast.error('At least one item must have quantity received > 0');
        setIsSubmitting(false);
        return;
      }

      const receivedItems = validItems.map(item => ({
        productId: String(item.purchase_order_item),
        productName: item.product_name,
        quantityReceived: item.quantity_received,
        quantityAccepted: item.quantity_accepted,
        quantityRejected: item.quantity_rejected,
        rejectionReason: item.rejection_reason,
        unitCost: item.unit_cost,
      }));

      if (Number.isFinite(poId) && poId > 0 && supplierId) {
        try {
          await createGoodsReceivedNote({
            purchase_order: poId,
            supplier: supplierId,
            received_date: new Date().toISOString().split('T')[0],
            location,
            delivery_note_number: deliveryNote,
            courier_name: courier,
            items: validItems.map(item => ({
              purchase_order_item: item.purchase_order_item || 0,
              quantity_received: item.quantity_received,
              quantity_accepted: item.quantity_accepted,
              quantity_rejected: item.quantity_rejected,
              rejection_reason: item.rejection_reason,
              condition: item.condition,
              unit_cost: item.unit_cost,
              batch_number: item.batch_number,
              location: item.location,
            })),
          });
        } catch (backendError: any) {
          console.warn('Backend GRN creation failed, updating local state only:', backendError);
        }
      }

      onReceivedAndVerified?.(selectedPO, receivedItems, {
        goodsReceivingNote: deliveryNote,
        deliveryNote,
        receivingLocation: location,
      });

      toast.success('Goods received successfully!');
      onRefresh();
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to process goods receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyItem = async (grnId: number, itemId: number) => {
    setVerifyingItemId(itemId);
    try {
      await verifyGRNItem(grnId, itemId);
      toast.success('Item verified and stock updated');
      loadGRNs();
    } catch {
      toast.error('Failed to verify item');
    } finally {
      setVerifyingItemId(null);
    }
  };

  const handleVerifyAll = async (grnId: number) => {
    setVerifyingAll(true);
    try {
      await verifyAllGRNItems(grnId);
      toast.success('All items verified. Stock has been updated.');
      loadGRNs();
    } catch {
      toast.error('Failed to verify all items');
    } finally {
      setVerifyingAll(false);
    }
  };

  const handleReceiveAll = () => {
    setGrnItems(prev => prev.map(item => ({
      ...item,
      quantity_received: item.quantity_ordered,
      quantity_accepted: item.quantity_ordered,
      quantity_rejected: 0,
    })));
  };

  const handleReceiveAllAndSubmit = async (poId: string) => {
    handleSelectPO(poId);
    // Wait for state to update, then set all to ordered qty
    setTimeout(async () => {
      setGrnItems(prev => prev.map(item => ({
        ...item,
        quantity_received: item.quantity_ordered,
        quantity_accepted: item.quantity_ordered,
        quantity_rejected: 0,
      })));
      // Small delay for state to settle, then submit
      setTimeout(() => handleSubmitGRN(), 50);
    }, 50);
  };

  const resolvePOId = (po: BackendSupplierInvoice) => (po as any).backendId ? Number((po as any).backendId) : Number(po.id) || 0;

  const handleSendPO = async (po: BackendSupplierInvoice) => {
    try {
      const poId = resolvePOId(po);
      if (!poId) { toast.error('Cannot send PO: no backend ID'); return; }
      const result = await sendPOEmail(poId);
      toast.success(`PO sent to ${result.email}`);
    } catch {
      toast.error('Failed to send PO email. Check supplier email and mail settings.');
    }
  };

  const resetForm = () => {
    setSelectedPO(null);
    setGrnItems([]);
    setLocation('Main Store');
    setDeliveryNote('');
    setCourier('');
    setStep('select-po');
  };

  const conditionOptions = ['good', 'damaged', 'defective', 'expired', 'wrong_item', 'short_expiry'];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900">
            {step === 'select-po' && 'Select Purchase Order to Receive'}
            {step === 'receive-items' && `Receiving: ${selectedPO?.id || ''}`}
            {step === 'grn-list' && 'Goods Received Notes'}
          </DialogTitle>
        </DialogHeader>

        {step === 'select-po' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('grn-list')}>
                <FileText className="mr-2 h-4 w-4" /> View GRNs
              </Button>
            </div>
            {pendingPOs.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">No pending purchase orders to receive.</p>
            ) : (
              <div className="space-y-2">
                {pendingPOs.map(po => (
                  <div key={po.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-900">{po.id}</p>
                      <p className="text-sm text-gray-600">{po.supplierName} · {po.orderItems?.length || 0} items</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { const id = resolvePOId(po); if (id) downloadPOAsPdf(id); else toast.error('No backend ID for PDF'); }}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleSendPO(po)}>
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleReceiveAllAndSubmit(po.id)}>
                        <Package className="mr-1 h-4 w-4" /> Receive All
                      </Button>
                      <Button size="sm" onClick={() => handleSelectPO(po.id)}>
                        <Package className="mr-1 h-4 w-4" /> Receive
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'receive-items' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <Input value={location} onChange={e => setLocation(e.target.value)} className="bg-gray-100" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Note #</label>
                <Input value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Courier</label>
                <Input value={courier} onChange={e => setCourier(e.target.value)} placeholder="Optional" />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Ordered</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Accepted</TableHead>
                  <TableHead className="text-right">Rejected</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Batch #</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grnItems.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-xs text-gray-500">{item.product_sku}</p>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity_ordered}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={item.quantity_received}
                        onChange={e => handleItemChange(i, 'quantity_received', Number(e.target.value))}
                        className="w-20 text-right"
                        min={0}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={item.quantity_accepted}
                        onChange={e => handleItemChange(i, 'quantity_accepted', Number(e.target.value))}
                        className="w-20 text-right"
                        min={0}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-red-600 font-medium">{item.quantity_rejected}</span>
                    </TableCell>
                    <TableCell>
                      <Select value={item.condition} onValueChange={v => handleItemChange(i, 'condition', v)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {conditionOptions.map(c => (
                            <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.batch_number}
                        onChange={e => handleItemChange(i, 'batch_number', e.target.value)}
                        placeholder="Auto"
                        className="w-28"
                      />
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unit_cost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={handleReceiveAll}>
                <Package className="mr-1 h-4 w-4" /> Receive All
              </Button>
              <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('select-po')}>Back</Button>
              <Button onClick={handleSubmitGRN} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
                Create GRN & Post Stock
              </Button>
            </div>
          </div>
          </div>
        )}

        {step === 'grn-list' && (
          <div className="space-y-3">
            <Button variant="outline" onClick={() => setStep('select-po')}>Back to POs</Button>

            {loadingGRNs ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
            ) : existingGRNs.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">No goods received notes yet.</p>
            ) : (
              <div className="space-y-4">
                {existingGRNs.map(grn => (
                  <div key={grn.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900">{grn.grn_number}</span>
                        <span className="mx-2 text-gray-400">|</span>
                        <span className="text-gray-700">{grn.supplier_name}</span>
                        <Badge className="ml-2" variant={grn.status === 'verified' ? 'default' : grn.status === 'received' ? 'secondary' : 'outline'}>
                          {grn.status_display}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-sm text-gray-500">
                          {grn.verified_item_count}/{grn.item_count} verified
                        </span>
                        {grn.status !== 'verified' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => handleVerifyAll(grn.id)}
                              disabled={verifyingAll}
                            >
                              {verifyingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                              Verify All
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => downloadPOAsPdf(grn.purchase_order)}>
                              <Download className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {grn.items && grn.items.length > 0 && (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Received</TableHead>
                            <TableHead className="text-right">Accepted</TableHead>
                            <TableHead className="text-right">Rejected</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead>Batch</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {grn.items.map(item => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium text-gray-900">{item.product_name}</TableCell>
                              <TableCell className="text-right">{item.quantity_received}</TableCell>
                              <TableCell className="text-right text-green-600">{item.quantity_accepted}</TableCell>
                              <TableCell className="text-right text-red-600">{item.quantity_rejected}</TableCell>
                              <TableCell className="capitalize">{item.condition.replace('_', ' ')}</TableCell>
                              <TableCell className="text-xs">{item.batch_number || '-'}</TableCell>
                              <TableCell>
                                {item.is_verified ? (
                                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-600"
                                    onClick={() => handleVerifyItem(grn.id, item.id)}
                                    disabled={verifyingItemId === item.id}
                                  >
                                    {verifyingItemId === item.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-3 w-3" />
                                    )}
                                    Verify
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
