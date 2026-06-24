import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Package, History, AlertTriangle } from 'lucide-react';
import type { StockMovement } from '../../types/supplierOrder';

interface StockDetailPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productSku: string;
  currentStock: number;
  reorderLevel: number;
  reserved: number;
  available: number;
  stockMovements: StockMovement[];
  batchInfo?: Array<{
    batch_number: string;
    quantity: number;
    expiry_date?: string;
    location: string;
    status: string;
  }>;
}

export const StockDetailPopover: React.FC<StockDetailPopoverProps> = ({
  open, onOpenChange, productName, productSku, currentStock, reorderLevel, reserved, available, stockMovements, batchInfo,
}) => {
  const productMovements = stockMovements.filter(m => m.item === productName || m.item === productSku).slice(-20);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            {productName}
            <span className="text-sm font-normal text-gray-500">({productSku})</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{currentStock}</p>
            <p className="text-xs text-blue-600">Current Stock</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-700">{reorderLevel}</p>
            <p className="text-xs text-yellow-600">Reorder Level</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-700">{reserved}</p>
            <p className="text-xs text-purple-600">Reserved</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{available}</p>
            <p className="text-xs text-green-600">Available</p>
          </div>
        </div>

        {batchInfo && batchInfo.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Package className="h-4 w-4" /> Batches
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch #</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batchInfo.map((batch, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{batch.batch_number}</TableCell>
                    <TableCell className="text-right">{batch.quantity}</TableCell>
                    <TableCell className="text-xs">{batch.expiry_date || '-'}</TableCell>
                    <TableCell className="text-xs">{batch.location}</TableCell>
                    <TableCell>
                      <Badge variant={batch.status === 'active' ? 'default' : 'secondary'}>
                        {batch.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <History className="h-4 w-4" /> Recent Movements
          </h4>
          {productMovements.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No movements recorded yet.</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {productMovements.map((m, i) => (
                <div key={m.id || i} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={m.type === 'in' ? 'default' : 'destructive'} className="w-10 text-xs">
                      {m.type}
                    </Badge>
                    <span className="text-gray-700">{m.quantity} units</span>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">{m.reason}</p>
                    <p className="text-gray-400 text-xs">{m.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {currentStock <= reorderLevel && (
          <div className="flex items-center gap-2 mt-3 p-2 bg-red-50 rounded text-red-700 text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            Stock is at or below reorder level. Consider reordering.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
