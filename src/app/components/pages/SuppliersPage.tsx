import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Plus, Search, Edit, Eye, Phone, Mail, MapPin, Building } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

const suppliers = [
  { id: 1, name: 'Coffee Suppliers Co.', contact: 'James Smith', email: 'james@coffeesuppliers.com', phone: '+254701321073', balance: 2500.00, lastPurchase: '2026-01-15', totalPurchases: 15 },
  { id: 2, name: 'Fresh Bakery Ltd.', contact: 'Sarah Johnson', email: 'sarah@freshbakery.com', phone: '+254111945360', balance: -150.00, lastPurchase: '2026-01-14', totalPurchases: 8 },
  { id: 3, name: 'Beverage Distributors', contact: 'Monique Chen', email: 'monique@beveragedist.com', phone: '+254113974804', balance: 750.50, lastPurchase: '2026-01-13', totalPurchases: 22 },
  { id: 4, name: 'Local Farm Supplies', contact: 'Elvis Davis', email: 'elvis@farmsupp.com', phone: '+254112345678', balance: 0.00, lastPurchase: '2026-01-12', totalPurchases: 5 }
];

export function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<typeof suppliers[0] | null>(null);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBalanceBadge = (balance: number) => {
    if (balance > 0) return <Badge className="bg-green-500/20 text-green-600">Credit: {formatCurrency(balance)}</Badge>;
    if (balance < 0) return <Badge className="bg-red-500/20 text-red-600">Debt: {formatCurrency(Math.abs(balance))}</Badge>;
    return <Badge variant="secondary">Settled</Badge>;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Supplier Management</h1>
          <p className="text-gray-500">Manage your vendor relationships and contacts</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Add New Supplier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Company Name" className="bg-gray-100 border-gray-200 text-gray-900" />
              <Input placeholder="Contact Person" className="bg-gray-100 border-gray-200 text-gray-900" />
              <Input placeholder="Email Address" type="email" className="bg-gray-100 border-gray-200 text-gray-900" />
              <Input placeholder="Phone Number" className="bg-gray-100 border-gray-200 text-gray-900" />
              <Textarea placeholder="Company Address" className="bg-gray-100 border-gray-200 text-gray-900" />
              <Textarea placeholder="Notes (Optional)" className="bg-gray-100 border-gray-200 text-gray-900" />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => setIsAddDialogOpen(false)}>Add Supplier</Button>
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
                <p className="text-gray-500 text-sm">Total Suppliers</p>
                <p className="text-2xl font-semibold text-gray-900">{suppliers.length}</p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Outstanding Balance</p>
                <p className="text-2xl font-semibold text-gray-900">
                  KSh {suppliers.reduce((sum, s) => sum + Math.max(0, s.balance), 0).toFixed(0)}
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
                <p className="text-gray-500 text-sm">Active This Month</p>
                <p className="text-2xl font-semibold text-gray-900">{suppliers.length}</p>
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
                <p className="text-gray-500 text-sm">Total Purchases</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {suppliers.reduce((sum, s) => sum + s.totalPurchases, 0)}
                </p>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-white border-gray-200 mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Search suppliers by name or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-100 border-gray-200 text-gray-900"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Suppliers ({filteredSuppliers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-600">Company</TableHead>
                <TableHead className="text-gray-600">Contact</TableHead>
                <TableHead className="text-gray-600">Balance</TableHead>
                <TableHead className="text-gray-600">Purchases</TableHead>
                <TableHead className="text-gray-600">Last Purchase</TableHead>
                <TableHead className="text-gray-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map(supplier => (
                <TableRow key={supplier.id} className="border-gray-200">
                  <TableCell className="text-gray-900 font-medium">{supplier.name}</TableCell>
                  <TableCell>
                    <div className="text-gray-600 text-sm">
                      <div>{supplier.contact}</div>
                      <div className="flex items-center gap-4 mt-1 text-xs">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {supplier.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {supplier.phone}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getBalanceBadge(supplier.balance)}</TableCell>
                  <TableCell className="text-gray-600">{supplier.totalPurchases}</TableCell>
                  <TableCell className="text-gray-600">{supplier.lastPurchase}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-blue-600 hover:text-blue-300"
                        onClick={() => setSelectedSupplier(supplier)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-300">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Supplier Detail Dialog */}
      {selectedSupplier && (
        <Dialog open={!!selectedSupplier} onOpenChange={() => setSelectedSupplier(null)}>
          <DialogContent className="bg-white border-gray-200 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Supplier Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-900 font-semibold text-lg">{selectedSupplier.name}</h3>
                <p className="text-gray-500">{selectedSupplier.contact}</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  {selectedSupplier.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  {selectedSupplier.phone}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-gray-500 text-xs">Total Purchases</p>
                  <p className="text-gray-900 font-semibold">{selectedSupplier.totalPurchases}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Current Balance</p>
                  <p className={`font-semibold ${selectedSupplier.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    KSh {Math.abs(selectedSupplier.balance).toFixed(2)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">Last Purchase</p>
                  <p className="text-gray-900 font-semibold">{selectedSupplier.lastPurchase}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => setSelectedSupplier(null)}>
                  View Purchases
                </Button>
                <Button variant="outline" onClick={() => setSelectedSupplier(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
