import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { Dashboard } from './components/pages/Dashboard';
import { POSPage, initialProducts, type CompletedSale, type DayBalance } from './components/pages/POSPageEnhanced';
import { InvoicesPage } from './components/pages/InvoicesPage';
import { CustomersPage } from './components/pages/CustomersPage';
import { ProductsPageEnhanced } from './components/pages/ProductsPageEnhanced';
import { PurchasesPage } from './components/pages/PurchasesPage';
import { SuppliersPage } from './components/pages/SuppliersPage';
import { InventoryPage } from './components/pages/InventoryPage';
import { ExpensesPage } from './components/pages/ExpensesPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { UsersPage } from './components/pages/UsersPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { LoginPage } from './components/auth/LoginPage';
import { UserRole } from './types/auth';

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const createInitialDayBalance = (): DayBalance => ({
  date: getTodayKey(),
  openingBalance: 0,
  closingBalance: null,
  status: 'closed'
});

export default function App() {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Set to false for login screen
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState('');
  const [products, setProducts] = useState(() => {
    const savedProducts = window.localStorage.getItem('pos-products');
    return savedProducts ? JSON.parse(savedProducts) as typeof initialProducts : initialProducts;
  });
  const [completedSales, setCompletedSales] = useState<CompletedSale[]>(() => {
    const savedSales = window.localStorage.getItem('pos-sales');
    return savedSales
      ? (JSON.parse(savedSales) as CompletedSale[]).map(sale => ({
          ...sale,
          cashAmount: sale.cashAmount ?? (sale.method.toLowerCase().startsWith('cash') ? sale.amount : 0),
          timestamp: new Date(sale.timestamp)
        }))
      : [];
  });
  const [dayBalance, setDayBalance] = useState<DayBalance>(() => {
    const savedBalance = window.localStorage.getItem('pos-day-balance');
    const balance = savedBalance ? JSON.parse(savedBalance) as DayBalance : createInitialDayBalance();
    return balance.date === getTodayKey() ? balance : createInitialDayBalance();
  });

  const cashSalesToday = completedSales
    .filter(sale => sale.timestamp.toISOString().slice(0, 10) === dayBalance.date)
    .reduce((sum, sale) => sum + sale.cashAmount, 0);

  useEffect(() => {
    window.localStorage.setItem('pos-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    window.localStorage.setItem('pos-sales', JSON.stringify(completedSales));
  }, [completedSales]);

  useEffect(() => {
    window.localStorage.setItem('pos-day-balance', JSON.stringify(dayBalance));
  }, [dayBalance]);

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
  };

  const handleLogin = (role: UserRole) => {
    setIsAuthenticated(true);
    setUserRole(role);
    // Set a friendly name based on role
    const roleNames = {
      admin: 'Administrator',
      cashier: 'Cashier',
      accountant: 'Accountant'
    };
    setUserName(roleNames[role]);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName('');
    setActiveItem('dashboard');
  };

  const handleTransactionComplete = (sale: CompletedSale) => {
    setCompletedSales(previousSales => [sale, ...previousSales]);
    setProducts(previousProducts => previousProducts.map(product => {
      const soldUnits = sale.items
        .filter(item => item.productId === product.id)
        .reduce((sum, item) => sum + (item.stockUnits * item.quantity), 0);

      if (soldUnits === 0) return product;
      return {
        ...product,
        stock: Math.max(0, product.stock - soldUnits)
      };
    }));
  };

  const handleOpenDay = (openingBalance: number) => {
    setDayBalance({
      date: getTodayKey(),
      openingBalance,
      closingBalance: null,
      status: 'open'
    });
  };

  const handleCloseDay = (closingBalance: number) => {
    setDayBalance(previousBalance => ({
      ...previousBalance,
      closingBalance,
      status: 'closed'
    }));
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return <Dashboard products={products} completedSales={completedSales} dayBalance={dayBalance} cashSalesToday={cashSalesToday} />;
      case 'pos':
        return (
          <POSPage
            products={products}
            dayBalance={dayBalance}
            cashSalesToday={cashSalesToday}
            onOpenDay={handleOpenDay}
            onCloseDay={handleCloseDay}
            onTransactionComplete={handleTransactionComplete}
          />
        );
      case 'invoices':
        return <InvoicesPage />;
      case 'customers':
        return <CustomersPage />;
      case 'products':
        return <ProductsPageEnhanced />;
      case 'purchases':
        return <PurchasesPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'users':
        return <UsersPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard products={products} completedSales={completedSales} dayBalance={dayBalance} cashSalesToday={cashSalesToday} />;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header with Time and Notifications */}
      <TopHeader />
      
      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          activeItem={activeItem} 
          onItemClick={handleItemClick}
          onLogout={handleLogout}
          userRole={userRole!}
          userName={userName}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
