import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Plus, Search, Edit, Eye, Phone, Mail, MapPin } from 'lucide-react';

const customers = [
  { id: 1, name: 'Nelly skyler', email: 'nelly@gmail.com', phone: '+254798550825', purchaseCount: 25, loyaltyPoints: 450, totalSpent: 1250.75, lastVisit: '2026-01-15' },
  { id: 2, name: 'Elvis Smith', email: 'elvis@gmail.com', phone: '+254745920999', purchaseCount: 18, loyaltyPoints: 320, totalSpent: 875.50, lastVisit: '2026-01-14' },
  { id: 3, name: 'Benard Johnson', email: 'benard@gmail.com', phone: '+254713864921', purchaseCount: 42, loyaltyPoints: 680, totalSpent: 2150.25, lastVisit: '2026-01-13' },
  { id: 4, name: 'James Brown', email: 'james@gmail.com', phone: '+254111945360', purchaseCount: 8, loyaltyPoints: 120, totalSpent: 425.00, lastVisit: '2026-01-12' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@gmail.com', phone: '+254736790566', purchaseCount: 35, loyaltyPoints: 580, totalSpent: 1875.80, lastVisit: '2026-01-10' }
];

export function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<typeof customers[0] | null>(null);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerTier = (points: number) => {
    if (points >= 500) return <Badge className="bg-yellow-500/20 text-yellow-600">Gold</Badge>;
    if (points >= 200) return <Badge className="bg-gray-400/20 text-gray-600">Silver</Badge>;
    return <Badge className="bg-orange-500/20 text-orange-600">Bronze</Badge>;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
          <p className="text-gray-500">Manage customer information and loyalty programs</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Full Name" className="bg-gray-100 border-gray-200 text-gray-900" />
              <Input placeholder="Email Address" type="email" className="bg-gray-100 border-gray-200 text-gray-900" />
              <Input placeholder="Phone Number" className="bg-gray-100 border-gray-200 text-gray-900" />
              <Textarea placeholder="Address (Optional)" className="bg-gray-100 border-gray-200 text-gray-900" />
              <Textarea placeholder="Notes (Optional)" className="bg-gray-100 border-gray-200 text-gray-900" />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => setIsAddDialogOpen(false)}>Add Customer</Button>
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
                <p className="text-gray-500 text-sm">Total Customers</p>
                <p className="text-2xl font-semibold text-gray-900">{customers.length}</p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Gold Members</p>
                <p className="text-2xl font-semibold text-gray-900">{customers.filter(c => c.loyaltyPoints >= 500).length}</p>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Badge className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Average Spent</p>
                <p className="text-2xl font-semibold text-gray-900">
                  KSh {(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length).toFixed(0)}
                </p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Loyalty Points</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {customers.reduce((sum, c) => sum + c.loyaltyPoints, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Phone className="w-6 h-6 text-purple-600" />
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
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-100 border-gray-200 text-gray-900"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-600">Name</TableHead>
                <TableHead className="text-gray-600">Contact</TableHead>
                <TableHead className="text-gray-600">Purchases</TableHead>
                <TableHead className="text-gray-600">Loyalty Points</TableHead>
                <TableHead className="text-gray-600">Total Spent</TableHead>
                <TableHead className="text-gray-600">Tier</TableHead>
                <TableHead className="text-gray-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map(customer => (
                <TableRow key={customer.id} className="border-gray-200">
                  <TableCell className="text-gray-900 font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <div className="text-gray-600 text-sm">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{customer.purchaseCount}</TableCell>
                  <TableCell className="text-yellow-600">{customer.loyaltyPoints}</TableCell>
                  <TableCell className="text-green-600">KSh {customer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell>{getCustomerTier(customer.loyaltyPoints)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-blue-600 hover:text-blue-300"
                        onClick={() => setSelectedCustomer(customer)}
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

      {/* Customer Detail Dialog */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="bg-white border-gray-200 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Customer Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900 font-semibold">{selectedCustomer.name}</h3>
                {getCustomerTier(selectedCustomer.loyaltyPoints)}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  {selectedCustomer.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  {selectedCustomer.phone}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-gray-500 text-xs">Total Purchases</p>
                  <p className="text-gray-900 font-semibold">{selectedCustomer.purchaseCount}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Total Spent</p>
                  <p className="text-green-600 font-semibold">KSh {selectedCustomer.totalSpent.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Loyalty Points</p>
                  <p className="text-yellow-600 font-semibold">{selectedCustomer.loyaltyPoints}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Last Visit</p>
                  <p className="text-gray-900 font-semibold">{selectedCustomer.lastVisit}</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}