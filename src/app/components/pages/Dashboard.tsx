import React from 'react';
import { KPICards } from '../KPICards';
import { Charts } from '../Charts';
import { DataTables } from '../DataTables';
import { QuickActions } from '../QuickActions';
import type { CompletedSale, DayBalance, POSProduct } from './POSPageEnhanced';

interface DashboardProps {
  products: POSProduct[];
  completedSales: CompletedSale[];
  dayBalance: DayBalance;
  cashSalesToday: number;
}

export function Dashboard({ products, completedSales, dayBalance, cashSalesToday }: DashboardProps) {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DASHBOARD OVERVIEW</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* KPI Cards */}
      <KPICards
        products={products}
        completedSales={completedSales}
        dayBalance={dayBalance}
        cashSalesToday={cashSalesToday}
      />

      {/* Charts Section */}
      <Charts />

      {/* Data Tables */}
      <DataTables products={products} completedSales={completedSales} />

      {/* Quick Actions and Staff Leaderboard */}
      <QuickActions />
    </div>
  );
}
