import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Search, Edit, Trash2, Upload, Download } from 'lucide-react';

const products = [
  { id: 1, name: 'Coffee Premium', category: 'Beverages', price: 4.50, stock: 25, status: 'active' },
  { id: 2, name: 'Croissant', category: 'Bakery', price: 3.25, stock: 15, status: 'active' },
  { id: 3, name: 'Green Tea', category: 'Beverages', price: 3.00, stock: 30, status: 'active' },
  { id: 4, name: 'Sandwich Club', category: 'Food', price: 8.50, stock: 12, status: 'active' },
  { id: 5, name: 'Muffin Blueberry', category: 'Bakery', price: 2.75, stock: 5, status: 'low_stock' },
  { id: 6, name: 'Latte', category: 'Beverages', price: 4.25, stock: 0, status: 'out_of_stock' }
];

const categories = ['All', 'Beverages', 'Bakery', 'Food'];

export function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock < 10) return <Badge variant="secondary" className="bg-orange-500/20 text-orange-600">Low Stock</Badge>;
    return <Badge variant="secondary" className="bg-green-500/20 text-green-600">In Stock</Badge>;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products & Inventory</h1>
          <p className="text-gray-500">Manage your store's product catalog</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-200">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Add New Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Product Name" className="bg-gray-100 border-gray-200 text-gray-900" />
                <Select>
                  <SelectTrigger className="bg-gray-100 border-gray-200 text-gray-900">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-100 border-gray-200">
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="bakery">Bakery</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Price" type="number" className="bg-gray-100 border-gray-200 text-gray-900" />
                <Input placeholder="Stock Quantity" type="number" className="bg-gray-100 border-gray-200 text-gray-900" />
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => setIsAddDialogOpen(false)}>Add Product</Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white border-gray-200 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-100 border-gray-200 text-gray-900"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40 bg-gray-100 border-gray-200 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-100 border-gray-200">
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-600">Product Name</TableHead>
                <TableHead className="text-gray-600">Category</TableHead>
                <TableHead className="text-gray-600">Price</TableHead>
                <TableHead className="text-gray-600">Stock</TableHead>
                <TableHead className="text-gray-600">Status</TableHead>
                <TableHead className="text-gray-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map(product => (
                <TableRow key={product.id} className="border-gray-200">
                  <TableCell className="text-gray-900 font-medium">{product.name}</TableCell>
                  <TableCell className="text-gray-600">{product.category}</TableCell>
                  <TableCell className="text-green-600">KSh {product.price}</TableCell>
                  <TableCell className="text-gray-600">{product.stock}</TableCell>
                  <TableCell>{getStatusBadge(product.status, product.stock)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-300">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </Button>
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