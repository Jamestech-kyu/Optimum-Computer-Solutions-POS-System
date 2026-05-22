import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Plus, ShoppingCart, Package, Users, Trophy } from 'lucide-react';

const staffData = [
  { name: 'Sarah Johnson', sales: 'KSh 30,450', transactions: 28, rank: 1 },
  { name: 'Elvis Chen', sales: 'KSh 40,890', transactions: 23, rank: 2 },
  { name: 'Emily Davis', sales: 'KSh 25,650', transactions: 21, rank: 3 },
  { name: 'James Rodriguez', sales: 'KSh 20,340', transactions: 19, rank: 4 },
  { name: 'Nelly Thompson', sales: 'KSh 21,120', transactions: 17, rank: 5 }
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Quick Action Buttons */}
      <Card className="bg-white border-gray-200 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
            <ShoppingCart className="w-4 h-4 mr-2" />
            New Sale
          </Button>
          <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white">
            <Package className="w-4 h-4 mr-2" />
            Add Product
          </Button>
          <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white">
            <Users className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
          <Button className="w-full justify-start bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Quick Invoice
          </Button>
        </CardContent>
      </Card>

      {/* Staff Leaderboard */}
      <Card className="bg-white border-gray-200 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Today's Top Sellers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staffData.map((staff, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    staff.rank === 1
                      ? 'bg-yellow-500 text-black'
                      : staff.rank === 2
                      ? 'bg-gray-300 text-black'
                      : staff.rank === 3
                      ? 'bg-orange-500 text-gray-900'
                      : 'bg-gray-400 text-white'
                  }`}>
                    {staff.rank}
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">{staff.name}</p>
                    <p className="text-gray-500 text-sm">{staff.transactions} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-600 font-semibold">{staff.sales}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}