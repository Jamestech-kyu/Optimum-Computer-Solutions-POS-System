// Sales and Revenue Data
export const salesData = [
  { name: 'Jan', revenue: 12000, transactions: 450, customers: 230, sales: 2400 },
  { name: 'Feb', revenue: 15000, transactions: 520, customers: 280, sales: 1398 },
  { name: 'Mar', revenue: 18000, transactions: 600, customers: 320, sales: 9800 },
  { name: 'Apr', revenue: 22000, transactions: 750, customers: 380, sales: 3908 },
  { name: 'May', revenue: 25000, transactions: 820, customers: 420, sales: 4800 },
  { name: 'Jun', revenue: 28000, transactions: 900, customers: 450, sales: 3800 }
];

export const weeklyData = [
  { name: 'Mon', sales: 2400 },
  { name: 'Tue', sales: 1398 },
  { name: 'Wed', sales: 9800 },
  { name: 'Thu', sales: 3908 },
  { name: 'Fri', sales: 4800 },
  { name: 'Sat', sales: 3800 },
  { name: 'Sun', sales: 4300 }
];

export const paymentData = [
  { name: 'Cash', value: 45, color: '#3B82F6' },
  { name: 'Card', value: 35, color: '#10B981' },
  { name: 'Digital', value: 20, color: '#F59E0B' }
];

// Product Data
export const products = [
  { id: 1, name: 'Coffee Premium', price: 4.50, stock: 25, category: 'Beverages', image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=100&h=100&fit=crop', status: 'active', cost: 3.50, reorderLevel: 50, location: 'Storage A1', selling: 4.50 },
  { id: 2, name: 'Croissant', price: 3.25, stock: 15, category: 'Bakery', image: 'https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?w=100&h=100&fit=crop', status: 'active', cost: 2.00, reorderLevel: 30, location: 'Kitchen B1', selling: 3.25 },
  { id: 3, name: 'Green Tea', price: 3.00, stock: 30, category: 'Beverages', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=100&h=100&fit=crop', status: 'active', cost: 2.25, reorderLevel: 20, location: 'Storage A2', selling: 3.00 },
  { id: 4, name: 'Sandwich Club', price: 8.50, stock: 12, category: 'Food', image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=100&h=100&fit=crop', status: 'active', cost: 6.00, reorderLevel: 15, location: 'Kitchen A1', selling: 8.50 },
  { id: 5, name: 'Muffin Blueberry', price: 2.75, stock: 5, category: 'Bakery', image: 'https://images.unsplash.com/photo-1507066274042-8a683d1e8a5c?w=100&h=100&fit=crop', status: 'low_stock', cost: 1.50, reorderLevel: 25, location: 'Kitchen B2', selling: 2.75 },
  { id: 6, name: 'Latte', price: 4.25, stock: 0, category: 'Beverages', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=100&h=100&fit=crop', status: 'out_of_stock', cost: 2.80, reorderLevel: 20, location: 'Storage A3', selling: 4.25 },
  { id: 7, name: 'Paper Cups', price: 0.00, stock: 5, category: 'Supplies', image: '', status: 'low_stock', cost: 0.05, reorderLevel: 100, location: 'Storage C1', selling: 0.00 },
  { id: 8, name: 'Milk Cartons', price: 0.50, stock: 8, category: 'Dairy', image: '', status: 'low_stock', cost: 1.80, reorderLevel: 25, location: 'Fridge A1', selling: 0.50 }
];

export const productSales = [
  { name: 'Coffee Premium', sales: 850, revenue: 3825 },
  { name: 'Sandwich Club', sales: 420, revenue: 3570 },
  { name: 'Croissant', sales: 680, revenue: 2210 },
  { name: 'Latte', sales: 520, revenue: 2210 },
  { name: 'Green Tea', sales: 380, revenue: 1140 }
];

// Customer Data
export const customers = [
  { id: 1, name: 'Walk-in Customer' },
  { id: 2, name: 'James Nyandere', email: 'james@optimum.com', phone: '+254711206444', purchaseCount: 25, loyaltyPoints: 450, totalSpent: 1250.75, lastVisit: '2024-01-15' },
  { id: 3, name: 'Nelly Ntabo', email: 'nelly@optimum.com', phone: '+254742640832', purchaseCount: 18, loyaltyPoints: 320, totalSpent: 875.50, lastVisit: '2024-01-14' },
  { id: 4, name: 'Silyvia Johnson', email: 'silyvia@optimum.com', phone: '+254111945360', purchaseCount: 42, loyaltyPoints: 680, totalSpent: 2150.25, lastVisit: '2024-01-13' },
  { id: 5, name: 'Elvis Brown', email: 'elvis@optimum.com', phone: '+254113974804', purchaseCount: 8, loyaltyPoints: 120, totalSpent: 425.00, lastVisit: '2024-01-12' },
  { id: 6, name: 'Sherlyn Wilson', email: 'sherlyn@optimum.com', phone: '+254701321073', purchaseCount: 35, loyaltyPoints: 580, totalSpent: 1875.80, lastVisit: '2024-01-10' }
];

// Recent Sales Data
export const recentSales = [
  { invoice: '#INV-001', customer: 'John Doe', total: 'KSh 85.50', method: 'Card' },
  { invoice: '#INV-002', customer: 'Jane Smith', total: 'KSh 42.30', method: 'Cash' },
  { invoice: '#INV-003', customer: 'Bob Johnson', total: 'KSh 127.90', method: 'Digital' },
  { invoice: '#INV-004', customer: 'Alice Brown', total: 'KSh 68.75', method: 'Card' },
  { invoice: '#INV-005', customer: 'Charlie Wilson', total: 'KSh 95.20', method: 'Cash' }
];

// Staff Data
export const staffData = [
  { name: 'Sarah Johnson', sales: 'KSh 3,450', transactions: 28, rank: 1 },
  { name: 'Mike Chen', sales: 'KSh 2,890', transactions: 23, rank: 2 },
  { name: 'Emily Davis', sales: 'KSh 2,650', transactions: 21, rank: 3 },
  { name: 'Alex Rodriguez', sales: 'KSh 2,340', transactions: 19, rank: 4 },
  { name: 'Lisa Thompson', sales: 'KSh 2,120', transactions: 17, rank: 5 }
];

// Low Stock Items
export const lowStockItems = [
  { item: 'Coffee Beans Premium', quantity: 5, reorderLevel: 20 },
  { item: 'Sugar Packets', quantity: 12, reorderLevel: 50 },
  { item: 'Paper Cups Large', quantity: 8, reorderLevel: 100 },
  { item: 'Milk Cartons', quantity: 3, reorderLevel: 15 },
  { item: 'Tea Bags Assorted', quantity: 7, reorderLevel: 25 }
];

// Categories
export const categories = ['All', 'Beverages', 'Bakery', 'Food', 'Supplies', 'Dairy'];

// Suppliers Data
export const suppliers = [
  { id: 1, name: 'Coffee Suppliers Co.', contact: 'John Smith', email: 'john@coffeesuppliers.com', phone: '+1 555-0101', balance: 2500.00, lastPurchase: '2024-01-15', totalPurchases: 15 },
  { id: 2, name: 'Fresh Bakery Ltd.', contact: 'Sarah Johnson', email: 'sarah@freshbakery.com', phone: '+1 555-0102', balance: -150.00, lastPurchase: '2024-01-14', totalPurchases: 8 },
  { id: 3, name: 'Beverage Distributors', contact: 'Mike Chen', email: 'mike@beveragedist.com', phone: '+1 555-0103', balance: 750.50, lastPurchase: '2024-01-13', totalPurchases: 22 },
  { id: 4, name: 'Local Farm Supplies', contact: 'Emily Davis', email: 'emily@farmsupp.com', phone: '+1 555-0104', balance: 0.00, lastPurchase: '2024-01-12', totalPurchases: 5 }
];

// Purchases Data
export const purchases = [
  { id: 'PUR-001', supplier: 'Coffee Suppliers Co.', date: '2024-01-15', amount: 1250.00, status: 'completed', items: 5 },
  { id: 'PUR-002', supplier: 'Fresh Bakery Ltd.', date: '2024-01-14', amount: 875.50, status: 'pending', items: 8 },
  { id: 'PUR-003', supplier: 'Beverage Distributors', date: '2024-01-13', amount: 2150.25, status: 'completed', items: 12 },
  { id: 'PUR-004', supplier: 'Local Farm Supplies', date: '2024-01-12', amount: 425.00, status: 'completed', items: 3 },
  { id: 'PUR-005', supplier: 'Packaging Solutions', date: '2024-01-10', amount: 680.75, status: 'draft', items: 6 }
];

// Invoices Data
export const invoices = [
  { id: 'INV-001', customer: 'John Doe', date: '2024-01-15', amount: 125.50, status: 'paid', items: 3, paymentMethod: 'Card' },
  { id: 'INV-002', customer: 'Jane Smith', date: '2024-01-15', amount: 89.25, status: 'pending', items: 2, paymentMethod: 'Cash' },
  { id: 'INV-003', customer: 'Bob Johnson', date: '2024-01-14', amount: 245.75, status: 'paid', items: 5, paymentMethod: 'Digital' },
  { id: 'INV-004', customer: 'Alice Brown', date: '2024-01-14', amount: 67.80, status: 'overdue', items: 2, paymentMethod: 'Card' },
  { id: 'INV-005', customer: 'Charlie Wilson', date: '2024-01-13', amount: 156.90, status: 'paid', items: 4, paymentMethod: 'Cash' }
];

// Expenses Data
export const expenses = [
  { id: 1, category: 'Rent', description: 'Monthly store rent', amount: 2500.00, date: '2024-01-01', paymentMethod: 'Bank Transfer', receipt: true },
  { id: 2, category: 'Utilities', description: 'Electricity bill', amount: 185.50, date: '2024-01-15', paymentMethod: 'Cash', receipt: true },
  { id: 3, category: 'Staff Salary', description: 'Monthly salaries', amount: 4200.00, date: '2024-01-01', paymentMethod: 'Bank Transfer', receipt: false },
  { id: 4, category: 'Equipment', description: 'Coffee machine maintenance', amount: 150.00, date: '2024-01-14', paymentMethod: 'Card', receipt: true },
  { id: 5, category: 'Marketing', description: 'Social media ads', amount: 250.00, date: '2024-01-10', paymentMethod: 'Card', receipt: false }
];

export const expenseCategories = ['Rent', 'Utilities', 'Staff Salary', 'Equipment', 'Marketing', 'Supplies', 'Other'];

// Stock Movements
export const stockMovements = [
  { id: 1, item: 'Coffee Premium', type: 'in', quantity: 20, date: '2024-01-15', reason: 'Purchase Order #PUR-001' },
  { id: 2, item: 'Croissant', type: 'out', quantity: -5, date: '2024-01-15', reason: 'Daily Sales' },
  { id: 3, item: 'Paper Cups', type: 'out', quantity: -25, date: '2024-01-14', reason: 'Daily Sales' },
  { id: 4, item: 'Green Tea', type: 'in', quantity: 15, date: '2024-01-14', reason: 'Stock Adjustment' }
];

// Profit Data
export const profitData = [
  { name: 'Jan', revenue: 12000, expenses: 8000, profit: 4000 },
  { name: 'Feb', revenue: 15000, expenses: 9500, profit: 5500 },
  { name: 'Mar', revenue: 18000, expenses: 11000, profit: 7000 },
  { name: 'Apr', revenue: 22000, expenses: 13500, profit: 8500 },
  { name: 'May', revenue: 25000, expenses: 15000, profit: 10000 },
  { name: 'Jun', revenue: 28000, expenses: 16500, profit: 11500 }
];

// Users Data
export const users = [
  { id: 1, name: 'Admin User', email: 'admin@pos.com', role: 'Administrator', lastLogin: '2024-01-15 09:30', status: 'active', permissions: ['all'] },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@pos.com', role: 'Manager', lastLogin: '2024-01-15 08:45', status: 'active', permissions: ['sales', 'inventory', 'customers'] },
  { id: 3, name: 'Mike Chen', email: 'mike@pos.com', role: 'Cashier', lastLogin: '2024-01-14 16:20', status: 'active', permissions: ['sales', 'customers'] },
  { id: 4, name: 'Emily Davis', email: 'emily@pos.com', role: 'Cashier', lastLogin: '2024-01-14 14:10', status: 'active', permissions: ['sales', 'customers'] },
  { id: 5, name: 'John Inactive', email: 'john@pos.com', role: 'Cashier', lastLogin: '2024-01-01 10:00', status: 'inactive', permissions: ['sales'] }
];

export const roles = ['Administrator', 'Manager', 'Cashier', 'Inventory Manager'];
export const permissions = ['sales', 'inventory', 'customers', 'suppliers', 'reports', 'settings', 'users'];