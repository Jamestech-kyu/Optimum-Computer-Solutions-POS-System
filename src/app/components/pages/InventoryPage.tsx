import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, AlertTriangle, TrendingDown, TrendingUp, Package, Plus } from 'lucide-react';

const inventory = [
  { id: 1, name: 'Coffee Premium', current: 25, reorderLevel: 50, location: 'Storage A1', category: 'Beverages', cost: 3.50, selling: 4.50 },
  { id: 2, name: 'Croissant', current: 15, reorderLevel: 30, location: 'Kitchen B1', category: 'Bakery', cost: 2.00, selling: 3.25 },
  { id: 3, name: 'Green Tea', current: 45, reorderLevel: 20, location: 'Storage A2', category: 'Beverages', cost: 2.25, selling: 3.00 },
  { id: 4, name: 'Paper Cups', current: 5, reorderLevel: 100, location: 'Storage C1', category: 'Supplies', cost: 0.05, selling: 0.00 },
  { id: 5, name: 'Milk Cartons', current: 8, reorderLevel: 25, location: 'Fridge A1', category: 'Dairy', cost: 1.80, selling: 0.50 }
];

const stockMovements = [
  { id: 1, item: 'Coffee Premium', type: 'in', quantity: 20, date: '2024-01-15', reason: 'Purchase Order #PUR-001' },
  { id: 2, item: 'Croissant', type: 'out', quantity: -5, date: '2024-01-15', reason: 'Daily Sales' },
  { id: 3, item: 'Paper Cups', type: 'out', quantity: -25, date: '2024-01-14', reason: 'Daily Sales' },
  { id: 4, item: 'Green Tea', type: 'in', quantity: 15, date: '2024-01-14', reason: 'Stock Adjustment' }
];

export function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventory.filter(item => item.current <= item.reorderLevel);
  const categories = ['all', ...Array.from(new Set(inventory.map(item => item.category)))];

  const getStockStatus = (current: number, reorderLevel: number) => {
    if (current === 0) return <Badge className="bg-red-500/20 text-red-600">Out of Stock</Badge>;
    if (current <= reorderLevel) return <Badge className="bg-orange-500/20 text-orange-600">Low Stock</Badge>;
    return <Badge className="bg-green-500/20 text-green-600">In Stock</Badge>;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-500">Monitor stock levels and inventory movements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Stock In
          </Button>
          <Button variant="outline">
            <TrendingDown className="w-4 h-4 mr-2" />
            Stock Out
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Items</p>
                <p className="text-2xl font-semibold text-gray-900">{inventory.length}</p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Low Stock Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">{lowStockItems.length}</p>
              </div>
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Stock Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  KSh {inventory.reduce((sum, item) => sum + (item.current * item.cost), 0).toFixed(0)}
                </p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Categories</p>
                <p className="text-2xl font-semibold text-gray-900">{categories.length - 1}</p>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stock" className="space-y-6">
        <TabsList className="bg-white border-gray-200">
          <TabsTrigger value="stock" className="data-[state=active]:bg-blue-600">Stock Overview</TabsTrigger>
          <TabsTrigger value="movements" className="data-[state=active]:bg-blue-600">Stock Movements</TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-600">Low Stock Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          {/* Filters */}
          <Card className="bg-white border-gray-200 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <Input
                    placeholder="Search inventory items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-100 border-gray-200 text-gray-900"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40 bg-gray-100 border-gray-200 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-100 border-gray-200">
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Inventory Items ({filteredInventory.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-600">Product</TableHead>
                    <TableHead className="text-gray-600">Category</TableHead>
                    <TableHead className="text-gray-600">Current Stock</TableHead>
                    <TableHead className="text-gray-600">Reorder Level</TableHead>
                    <TableHead className="text-gray-600">Location</TableHead>
                    <TableHead className="text-gray-600">Cost</TableHead>
                    <TableHead className="text-gray-600">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map(item => (
                    <TableRow key={item.id} className="border-gray-200">
                      <TableCell className="text-gray-900 font-medium">{item.name}</TableCell>
                      <TableCell className="text-gray-600">{item.category}</TableCell>
                      <TableCell className="text-gray-900">{item.current}</TableCell>
                      <TableCell className="text-gray-600">{item.reorderLevel}</TableCell>
                      <TableCell className="text-gray-600">{item.location}</TableCell>
                      <TableCell className="text-green-600">KSh {item.cost.toFixed(2)}</TableCell>
                      <TableCell>{getStockStatus(item.current, item.reorderLevel)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Recent Stock Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-600">Item</TableHead>
                    <TableHead className="text-gray-600">Type</TableHead>
                    <TableHead className="text-gray-600">Quantity</TableHead>
                    <TableHead className="text-gray-600">Date</TableHead>
                    <TableHead className="text-gray-600">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMovements.map(movement => (
                    <TableRow key={movement.id} className="border-gray-200">
                      <TableCell className="text-gray-900 font-medium">{movement.item}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {movement.type === 'in' ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-gray-600">
                            {movement.type === 'in' ? 'Stock In' : 'Stock Out'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </TableCell>
                      <TableCell className="text-gray-600">{movement.date}</TableCell>
                      <TableCell className="text-gray-600">{movement.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Low Stock Alerts ({lowStockItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No low stock alerts at the moment!</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-600">Product</TableHead>
                      <TableHead className="text-gray-600">Current Stock</TableHead>
                      <TableHead className="text-gray-600">Reorder Level</TableHead>
                      <TableHead className="text-gray-600">Location</TableHead>
                      <TableHead className="text-gray-600">Action Needed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockItems.map(item => (
                      <TableRow key={item.id} className="border-gray-200">
                        <TableCell className="text-gray-900 font-medium">{item.name}</TableCell>
                        <TableCell className="text-orange-600">{item.current}</TableCell>
                        <TableCell className="text-gray-600">{item.reorderLevel}</TableCell>
                        <TableCell className="text-gray-600">{item.location}</TableCell>
                        <TableCell>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            Reorder Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}