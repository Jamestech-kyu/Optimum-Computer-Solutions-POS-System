import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Building, FileText, CreditCard, Globe, Bell, Database, Shield, Settings, Percent } from 'lucide-react';
import { TaxConfig } from '../TaxConfig';

export function SettingsPage() {
  const [businessInfo, setBusinessInfo] = useState({
    name: 'Coffee Shop POS',
    email: 'admin@coffeeshop.com',
    phone: '+1 234-567-8900',
    address: '123 Main Street, City, State 12345',
    taxId: 'TAX123456789'
  });

  const [systemSettings, setSystemSettings] = useState({
    currency: 'KES',
    language: 'English',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    autoBackup: true,
    emailNotifications: true,
    lowStockAlerts: true
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
        <p className="text-gray-500">Configure your POS system preferences and business information</p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="bg-white border-gray-200">
          <TabsTrigger value="business" className="data-[state=active]:bg-blue-600">Business Info</TabsTrigger>
          <TabsTrigger value="invoice" className="data-[state=active]:bg-blue-600">Invoice Settings</TabsTrigger>
          <TabsTrigger value="payment" className="data-[state=active]:bg-blue-600">Payment Methods</TabsTrigger>
          <TabsTrigger value="pos" className="data-[state=active]:bg-blue-600">POS Config</TabsTrigger>
          <TabsTrigger value="tax" className="data-[state=active]:bg-blue-600">Taxes</TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-blue-600">System</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-blue-600">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Business Name</label>
                  <Input
                    value={businessInfo.name}
                    onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                    className="bg-gray-100 border-gray-200 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Email</label>
                  <Input
                    type="email"
                    value={businessInfo.email}
                    onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                    className="bg-gray-100 border-gray-200 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Phone</label>
                  <Input
                    value={businessInfo.phone}
                    onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                    className="bg-gray-100 border-gray-200 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Tax ID</label>
                  <Input
                    value={businessInfo.taxId}
                    onChange={(e) => setBusinessInfo({...businessInfo, taxId: e.target.value})}
                    className="bg-gray-100 border-gray-200 text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-2">Address</label>
                <Textarea
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                  className="bg-gray-100 border-gray-200 text-gray-900"
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoice Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Invoice Prefix</label>
                  <Input defaultValue="INV-" className="bg-gray-100 border-gray-200 text-gray-900" />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Starting Number</label>
                  <Input defaultValue="001" className="bg-gray-100 border-gray-200 text-gray-900" />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Tax Rate (%)</label>
                  <Input defaultValue="10" type="number" className="bg-gray-100 border-gray-200 text-gray-900" />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Payment Terms (Days)</label>
                  <Input defaultValue="30" type="number" className="bg-gray-100 border-gray-200 text-gray-900" />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-2">Invoice Footer Note</label>
                <Textarea
                  placeholder="Thank you for your business!"
                  className="bg-gray-100 border-gray-200 text-gray-900"
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Invoice Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { name: 'Cash', enabled: true, description: 'Accept cash payments' },
                { name: 'Credit/Debit Cards', enabled: true, description: 'Accept card payments via terminal' },
                { name: 'Digital Wallets', enabled: true, description: 'Accept mobile payments (Apple Pay, Google Pay)' },
                { name: 'Bank Transfer', enabled: false, description: 'Accept direct bank transfers' },
                { name: 'Cryptocurrency', enabled: false, description: 'Accept Bitcoin and other cryptocurrencies' }
              ].map((method, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                  <div>
                    <h4 className="text-gray-900 font-medium">{method.name}</h4>
                    <p className="text-gray-500 text-sm">{method.description}</p>
                  </div>
                  <Switch checked={method.enabled} />
                </div>
              ))}
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Payment Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pos">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                POS Configuration Levels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    level: 'Basic',
                    features: ['Single Payment', 'Basic Reporting', 'Single Store'],
                    cashiers: 5,
                    color: 'blue'
                  },
                  {
                    level: 'Standard',
                    features: ['Multi Payment', 'Inventory Tracking', 'Customer Management'],
                    cashiers: 15,
                    color: 'green'
                  },
                  {
                    level: 'Advanced',
                    features: ['All Standard Features', 'Advanced Analytics', 'Discount Management'],
                    cashiers: 50,
                    color: 'purple'
                  },
                  {
                    level: 'Enterprise',
                    features: ['Multiple Stores', 'Advanced Analytics', 'API Access', 'Custom Reports'],
                    cashiers: 'Unlimited',
                    color: 'red'
                  }
                ].map((plan, idx) => (
                  <div key={idx} className={`border-2 border-${plan.color}-200 bg-${plan.color}-50 p-4 rounded-lg`}>
                    <div className="flex justify-between items-start mb-3">
                      <h4 className={`text-lg font-bold text-${plan.color}-900`}>{plan.level}</h4>
                      <Badge className={`bg-${plan.color}-100 text-${plan.color}-800`}>
                        Up to {plan.cashiers} cashiers
                      </Badge>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className={`text-sm text-${plan.color}-900 flex items-center gap-2`}>
                          <div className={`w-2 h-2 rounded-full bg-${plan.color}-600`}></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  💡 Select your POS configuration level to unlock features that match your business needs.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Tax Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TaxConfig />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                System Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Currency</label>
                  <Select value={systemSettings.currency} onValueChange={(value) => 
                    setSystemSettings({...systemSettings, currency: value})}>
                    <SelectTrigger className="bg-gray-100 border-gray-200 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-100 border-gray-200">
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Language</label>
                  <Select value={systemSettings.language}>
                    <SelectTrigger className="bg-gray-100 border-gray-200 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-100 border-gray-200">
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Timezone</label>
                  <Select value={systemSettings.timezone}>
                    <SelectTrigger className="bg-gray-100 border-gray-200 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-100 border-gray-200">
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Date Format</label>
                  <Select value={systemSettings.dateFormat}>
                    <SelectTrigger className="bg-gray-100 border-gray-200 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-100 border-gray-200">
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="bg-gray-600" />

              <div className="space-y-4">
                <h4 className="text-gray-900 font-medium flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900">Email Notifications</p>
                      <p className="text-gray-500 text-sm">Receive email alerts for important events</p>
                    </div>
                    <Switch checked={systemSettings.emailNotifications} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900">Low Stock Alerts</p>
                      <p className="text-gray-500 text-sm">Get notified when items are running low</p>
                    </div>
                    <Switch checked={systemSettings.lowStockAlerts} />
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-600" />

              <div className="space-y-4">
                <h4 className="text-gray-900 font-medium flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Data Management
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Automatic Backup</p>
                    <p className="text-gray-500 text-sm">Automatically backup data daily</p>
                  </div>
                  <Switch checked={systemSettings.autoBackup} />
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save System Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-gray-900 font-medium">Password Policy</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Require password change every 90 days</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Minimum 8 characters</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Require special characters</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-600" />

              <div className="space-y-4">
                <h4 className="text-gray-900 font-medium">Session Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">Session Timeout (minutes)</label>
                    <Input defaultValue="30" type="number" className="bg-gray-100 border-gray-200 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">Max Login Attempts</label>
                    <Input defaultValue="5" type="number" className="bg-gray-100 border-gray-200 text-gray-900" />
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-600" />

              <div className="space-y-4">
                <h4 className="text-gray-900 font-medium">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Enable 2FA for all users</p>
                    <p className="text-gray-500 text-sm">Require two-factor authentication for enhanced security</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
