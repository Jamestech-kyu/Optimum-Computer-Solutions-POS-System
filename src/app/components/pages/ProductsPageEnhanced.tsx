import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Plus, Search, Edit, Trash2, TrendingUp, BarChart3 } from 'lucide-react';

export type UnitOfMeasurement = 'pcs' | 'kg' | 'liter' | 'meter' | 'dozen' | 'box' | 'pack' | 'carton';
export type PricingTier = 'retail' | 'wholesale' | 'corporate' | 'loyal';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  buyingPrice: number;
  prices: {
    retail: number;
    wholesale: number;
    corporate: number;
    loyal: number;
  };
  profitMargin: number;
  uom: UnitOfMeasurement;
  stock: number;
  reorderLevel: number;
  image: string;
  tax: number;
}

const sampleProducts: Product[] = [
  // Beverages
  {
    id: '1',
    name: 'Coffee Premium Arabica',
    sku: 'BVRY-COFFE-001',
    category: 'Beverages',
    buyingPrice: 3.50,
    prices: { retail: 9.99, wholesale: 7.99, corporate: 7.00, loyal: 8.50 },
    profitMargin: 65,
    uom: 'pcs',
    stock: 45,
    reorderLevel: 20,
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=100&h=100&fit=crop',
    tax: 5
  },
  {
    id: '2',
    name: 'Orange Juice Fresh 1L',
    sku: 'BVRY-JUICE-001',
    category: 'Beverages',
    buyingPrice: 2.00,
    prices: { retail: 5.99, wholesale: 4.80, corporate: 4.50, loyal: 5.25 },
    profitMargin: 66,
    uom: 'liter',
    stock: 62,
    reorderLevel: 30,
    image: 'https://images.unsplash.com/photo-1600788148184-e2c99d4159f5?w=100&h=100&fit=crop',
    tax: 5
  },
  {
    id: '3',
    name: 'Whole Milk 1L',
    sku: 'BVRY-MILK-001',
    category: 'Beverages',
    buyingPrice: 1.80,
    prices: { retail: 4.99, wholesale: 3.99, corporate: 3.75, loyal: 4.40 },
    profitMargin: 64,
    uom: 'liter',
    stock: 58,
    reorderLevel: 25,
    image: 'https://images.unsplash.com/photo-1608270861620-7c80fc286000?w=100&h=100&fit=crop',
    tax: 0
  },
  {
    id: '4',
    name: 'Bottled Water 500ml',
    sku: 'BVRY-WATER-001',
    category: 'Beverages',
    buyingPrice: 0.35,
    prices: { retail: 1.50, wholesale: 1.15, corporate: 1.00, loyal: 1.30 },
    profitMargin: 76,
    uom: 'pcs',
    stock: 120,
    reorderLevel: 50,
    image: 'https://images.unsplash.com/photo-1552106245-1e5a5ea8e6ff?w=100&h=100&fit=crop',
    tax: 0
  },
  {
    id: '5',
    name: 'Coca Cola 330ml',
    sku: 'BVRY-COKE-001',
    category: 'Beverages',
    buyingPrice: 0.80,
    prices: { retail: 2.50, wholesale: 2.00, corporate: 1.80, loyal: 2.20 },
    profitMargin: 67,
    uom: 'pcs',
    stock: 95,
    reorderLevel: 40,
    image: 'https://images.unsplash.com/photo-1554866585-65fb8c2c18e2?w=100&h=100&fit=crop',
    tax: 10
  },
  // Bakery
  {
    id: '6',
    name: 'Croissant Fresh',
    sku: 'BKRY-CROSS-001',
    category: 'Bakery',
    buyingPrice: 1.20,
    prices: { retail: 3.50, wholesale: 2.80, corporate: 2.50, loyal: 3.15 },
    profitMargin: 65,
    uom: 'pcs',
    stock: 28,
    reorderLevel: 10,
    image: 'https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?w=100&h=100&fit=crop',
    tax: 10
  },
  {
    id: '7',
    name: 'Whole Wheat Bread',
    sku: 'BKRY-BREAD-001',
    category: 'Bakery',
    buyingPrice: 1.50,
    prices: { retail: 4.50, wholesale: 3.60, corporate: 3.25, loyal: 4.05 },
    profitMargin: 66,
    uom: 'pcs',
    stock: 32,
    reorderLevel: 15,
    image: 'https://images.unsplash.com/photo-1554737694-b2d2c6944b15?w=100&h=100&fit=crop',
    tax: 5
  },
  {
    id: '8',
    name: 'Chocolate Donut',
    sku: 'BKRY-DONUT-001',
    category: 'Bakery',
    buyingPrice: 0.90,
    prices: { retail: 2.75, wholesale: 2.20, corporate: 2.00, loyal: 2.45 },
    profitMargin: 67,
    uom: 'pcs',
    stock: 40,
    reorderLevel: 15,
    image: 'https://images.unsplash.com/photo-1585070526059-41e39e0c5b64?w=100&h=100&fit=crop',
    tax: 10
  },
  // Fruits & Vegetables
  {
    id: '9',
    name: 'Bananas',
    sku: 'FRUT-BNAN-001',
    category: 'Fruits & Vegetables',
    buyingPrice: 0.50,
    prices: { retail: 1.99, wholesale: 1.50, corporate: 1.35, loyal: 1.75 },
    profitMargin: 74,
    uom: 'kg',
    stock: 75,
    reorderLevel: 30,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100&h=100&fit=crop',
    tax: 0
  },
  {
    id: '10',
    name: 'Fresh Apples',
    sku: 'FRUT-APPL-001',
    category: 'Fruits & Vegetables',
    buyingPrice: 1.20,
    prices: { retail: 3.99, wholesale: 3.20, corporate: 2.90, loyal: 3.60 },
    profitMargin: 70,
    uom: 'kg',
    stock: 58,
    reorderLevel: 25,
    image: 'https://images.unsplash.com/photo-1560806674-9e4eb207f9d4?w=100&h=100&fit=crop',
    tax: 0
  },
  {
    id: '11',
    name: 'Tomatoes (Red)',
    sku: 'VGTB-TOMA-001',
    category: 'Fruits & Vegetables',
    buyingPrice: 0.80,
    prices: { retail: 2.99, wholesale: 2.40, corporate: 2.15, loyal: 2.70 },
    profitMargin: 71,
    uom: 'kg',
    stock: 48,
    reorderLevel: 20,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=100&h=100&fit=crop',
    tax: 0
  },
  {
    id: '12',
    name: 'Carrots Fresh',
    sku: 'VGTB-CARR-001',
    category: 'Fruits & Vegetables',
    buyingPrice: 0.60,
    prices: { retail: 2.49, wholesale: 2.00, corporate: 1.80, loyal: 2.25 },
    profitMargin: 75,
    uom: 'kg',
    stock: 65,
    reorderLevel: 25,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 0
  },
  {
    id: '13',
    name: 'Broccoli Florets',
    sku: 'VGTB-BROC-001',
    category: 'Fruits & Vegetables',
    buyingPrice: 1.80,
    prices: { retail: 5.99, wholesale: 4.80, corporate: 4.35, loyal: 5.40 },
    profitMargin: 70,
    uom: 'kg',
    stock: 35,
    reorderLevel: 15,
    image: 'https://images.unsplash.com/photo-1599599810231-0dc8f6b6e11d?w=100&h=100&fit=crop',
    tax: 0
  },
  // Meat & Fish
  {
    id: '14',
    name: 'Chicken Breast Fillet',
    sku: 'MEAT-CHKN-001',
    category: 'Meat & Fish',
    buyingPrice: 6.50,
    prices: { retail: 16.99, wholesale: 13.60, corporate: 12.25, loyal: 15.30 },
    profitMargin: 62,
    uom: 'kg',
    stock: 28,
    reorderLevel: 12,
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=100&h=100&fit=crop',
    tax: 5
  },
  {
    id: '15',
    name: 'Ground Beef 1kg',
    sku: 'MEAT-BEEF-001',
    category: 'Meat & Fish',
    buyingPrice: 8.00,
    prices: { retail: 21.99, wholesale: 17.60, corporate: 15.85, loyal: 19.80 },
    profitMargin: 63,
    uom: 'pcs',
    stock: 22,
    reorderLevel: 10,
    image: 'https://images.unsplash.com/photo-1596156988269-f60d0aaa829c?w=100&h=100&fit=crop',
    tax: 5
  },
  {
    id: '16',
    name: 'Salmon Fillet',
    sku: 'FISH-SALM-001',
    category: 'Meat & Fish',
    buyingPrice: 10.50,
    prices: { retail: 28.99, wholesale: 23.20, corporate: 20.90, loyal: 26.10 },
    profitMargin: 64,
    uom: 'kg',
    stock: 15,
    reorderLevel: 8,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 5
  },
  // Dairy & Eggs
  {
    id: '17',
    name: 'Eggs (12 pack)',
    sku: 'DARI-EGGS-001',
    category: 'Dairy & Eggs',
    buyingPrice: 2.50,
    prices: { retail: 6.99, wholesale: 5.60, corporate: 5.05, loyal: 6.30 },
    profitMargin: 64,
    uom: 'dozen',
    stock: 54,
    reorderLevel: 20,
    image: 'https://images.unsplash.com/photo-1611866264904-76a6d1f8eb92?w=100&h=100&fit=crop',
    tax: 0
  },
  {
    id: '18',
    name: 'Cheddar Cheese',
    sku: 'DARI-CHED-001',
    category: 'Dairy & Eggs',
    buyingPrice: 4.50,
    prices: { retail: 12.99, wholesale: 10.40, corporate: 9.35, loyal: 11.70 },
    profitMargin: 65,
    uom: 'kg',
    stock: 32,
    reorderLevel: 12,
    image: 'https://images.unsplash.com/photo-1589985643862-18a0174fb7f8?w=100&h=100&fit=crop',
    tax: 5
  },
  {
    id: '19',
    name: 'Greek Yogurt',
    sku: 'DARI-YURT-001',
    category: 'Dairy & Eggs',
    buyingPrice: 2.00,
    prices: { retail: 5.99, wholesale: 4.80, corporate: 4.35, loyal: 5.40 },
    profitMargin: 67,
    uom: 'pcs',
    stock: 48,
    reorderLevel: 18,
    image: 'https://images.unsplash.com/photo-1488477181946-6dd79ee07e53?w=100&h=100&fit=crop',
    tax: 5
  },
  {
    id: '20',
    name: 'Butter (500g)',
    sku: 'DARI-BUTR-001',
    category: 'Dairy & Eggs',
    buyingPrice: 3.50,
    prices: { retail: 9.99, wholesale: 8.00, corporate: 7.20, loyal: 9.00 },
    profitMargin: 65,
    uom: 'pcs',
    stock: 42,
    reorderLevel: 15,
    image: 'https://images.unsplash.com/photo-1577810505900-1f76f1a30faa?w=100&h=100&fit=crop',
    tax: 5
  },
  // Frozen Foods
  {
    id: '21',
    name: 'Frozen Pizza',
    sku: 'FRZN-PZZA-001',
    category: 'Frozen Foods',
    buyingPrice: 3.50,
    prices: { retail: 9.99, wholesale: 8.00, corporate: 7.20, loyal: 9.00 },
    profitMargin: 65,
    uom: 'pcs',
    stock: 38,
    reorderLevel: 15,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 10
  },
  {
    id: '22',
    name: 'Frozen Vegetables Mix',
    sku: 'FRZN-VGTX-001',
    category: 'Frozen Foods',
    buyingPrice: 2.50,
    prices: { retail: 6.99, wholesale: 5.60, corporate: 5.05, loyal: 6.30 },
    profitMargin: 64,
    uom: 'kg',
    stock: 52,
    reorderLevel: 20,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 5
  },
  // Snacks & Candy
  {
    id: '23',
    name: 'Potato Chips',
    sku: 'SNCK-CHIP-001',
    category: 'Snacks & Candy',
    buyingPrice: 1.50,
    prices: { retail: 4.49, wholesale: 3.60, corporate: 3.25, loyal: 4.05 },
    profitMargin: 66,
    uom: 'pcs',
    stock: 72,
    reorderLevel: 30,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 10
  },
  {
    id: '24',
    name: 'Chocolate Bar',
    sku: 'SNCK-CHOC-001',
    category: 'Snacks & Candy',
    buyingPrice: 0.75,
    prices: { retail: 2.49, wholesale: 2.00, corporate: 1.80, loyal: 2.25 },
    profitMargin: 69,
    uom: 'pcs',
    stock: 85,
    reorderLevel: 35,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 10
  },
  {
    id: '25',
    name: 'Granola Bar',
    sku: 'SNCK-GRAN-001',
    category: 'Snacks & Candy',
    buyingPrice: 1.00,
    prices: { retail: 2.99, wholesale: 2.40, corporate: 2.15, loyal: 2.70 },
    profitMargin: 66,
    uom: 'pcs',
    stock: 65,
    reorderLevel: 25,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 10
  },
  // Pantry Staples
  {
    id: '26',
    name: 'Pasta White',
    sku: 'PNTR-PSTA-001',
    category: 'Pantry Staples',
    buyingPrice: 1.20,
    prices: { retail: 2.99, wholesale: 2.40, corporate: 2.15, loyal: 2.70 },
    profitMargin: 60,
    uom: 'pcs',
    stock: 88,
    reorderLevel: 35,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 5
  },
  {
    id: '27',
    name: 'Rice (1kg)',
    sku: 'PNTR-RICE-001',
    category: 'Pantry Staples',
    buyingPrice: 1.80,
    prices: { retail: 4.49, wholesale: 3.60, corporate: 3.25, loyal: 4.05 },
    profitMargin: 60,
    uom: 'pcs',
    stock: 72,
    reorderLevel: 30,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 5
  },
  {
    id: '28',
    name: 'Olive Oil',
    sku: 'PNTR-OLVE-001',
    category: 'Pantry Staples',
    buyingPrice: 5.50,
    prices: { retail: 14.99, wholesale: 12.00, corporate: 10.80, loyal: 13.50 },
    profitMargin: 63,
    uom: 'liter',
    stock: 28,
    reorderLevel: 10,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 5
  },
  {
    id: '29',
    name: 'Canned Tomatoes',
    sku: 'PNTR-TOMA-001',
    category: 'Pantry Staples',
    buyingPrice: 1.00,
    prices: { retail: 2.49, wholesale: 2.00, corporate: 1.80, loyal: 2.25 },
    profitMargin: 60,
    uom: 'pcs',
    stock: 95,
    reorderLevel: 40,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 5
  },
  {
    id: '30',
    name: 'Peanut Butter',
    sku: 'PNTR-PBUT-001',
    category: 'Pantry Staples',
    buyingPrice: 2.50,
    prices: { retail: 6.99, wholesale: 5.60, corporate: 5.05, loyal: 6.30 },
    profitMargin: 64,
    uom: 'pcs',
    stock: 48,
    reorderLevel: 18,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 5
  },
  // Health & Beauty
  {
    id: '31',
    name: 'Shampoo',
    sku: 'HLTH-SHMP-001',
    category: 'Health & Beauty',
    buyingPrice: 3.00,
    prices: { retail: 8.99, wholesale: 7.20, corporate: 6.50, loyal: 8.10 },
    profitMargin: 66,
    uom: 'pcs',
    stock: 35,
    reorderLevel: 12,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 10
  },
  {
    id: '32',
    name: 'Toothpaste',
    sku: 'HLTH-TOTH-001',
    category: 'Health & Beauty',
    buyingPrice: 1.50,
    prices: { retail: 4.49, wholesale: 3.60, corporate: 3.25, loyal: 4.05 },
    profitMargin: 66,
    uom: 'pcs',
    stock: 52,
    reorderLevel: 20,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 10
  },
  {
    id: '33',
    name: 'Soap Bar',
    sku: 'HLTH-SOAP-001',
    category: 'Health & Beauty',
    buyingPrice: 0.80,
    prices: { retail: 2.49, wholesale: 2.00, corporate: 1.80, loyal: 2.25 },
    profitMargin: 67,
    uom: 'pcs',
    stock: 78,
    reorderLevel: 30,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 10
  },
  // Household Items
  {
    id: '34',
    name: 'Laundry Detergent',
    sku: 'HSHD-LAUN-001',
    category: 'Household Items',
    buyingPrice: 3.50,
    prices: { retail: 9.99, wholesale: 8.00, corporate: 7.20, loyal: 9.00 },
    profitMargin: 65,
    uom: 'pcs',
    stock: 42,
    reorderLevel: 16,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 10
  },
  {
    id: '35',
    name: 'Dish Soap',
    sku: 'HSHD-DISH-001',
    category: 'Household Items',
    buyingPrice: 1.20,
    prices: { retail: 3.49, wholesale: 2.80, corporate: 2.50, loyal: 3.15 },
    profitMargin: 65,
    uom: 'pcs',
    stock: 65,
    reorderLevel: 25,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 10
  },
  {
    id: '36',
    name: 'Paper Towels',
    sku: 'HSHD-PAPR-001',
    category: 'Household Items',
    buyingPrice: 2.00,
    prices: { retail: 5.49, wholesale: 4.40, corporate: 3.95, loyal: 4.95 },
    profitMargin: 63,
    uom: 'pcs',
    stock: 88,
    reorderLevel: 35,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 10
  },
  {
    id: '37',
    name: 'Aluminum Foil',
    sku: 'HSHD-FOIL-001',
    category: 'Household Items',
    buyingPrice: 1.80,
    prices: { retail: 4.99, wholesale: 4.00, corporate: 3.60, loyal: 4.50 },
    profitMargin: 64,
    uom: 'pcs',
    stock: 58,
    reorderLevel: 22,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5e9a3?w=100&h=100&fit=crop',
    tax: 10
  }
];

const uomOptions: UnitOfMeasurement[] = ['pcs', 'kg', 'liter', 'meter', 'dozen', 'box', 'pack', 'carton'];

export function ProductsPageEnhanced() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({});
    setEditingProduct(null);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      resetForm();
    }
    setIsAddDialogOpen(true);
  };

  const calculateProfitMargin = (buyingPrice: number, sellingPrice: number) => {
    return ((sellingPrice - buyingPrice) / buyingPrice * 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = ['name', 'sku', 'category', 'buyingPrice', 'uom'];
    if (!requiredFields.every(field => formData[field as keyof Product])) {
      alert('Please fill all required fields');
      return;
    }

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData } as Product : p));
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name || '',
        sku: formData.sku || '',
        category: formData.category || '',
        buyingPrice: formData.buyingPrice || 0,
        prices: formData.prices || { retail: 0, wholesale: 0, corporate: 0, loyal: 0 },
        profitMargin: formData.profitMargin || 0,
        uom: formData.uom || 'pcs',
        stock: formData.stock || 0,
        reorderLevel: formData.reorderLevel || 0,
        image: formData.image || '',
        tax: formData.tax || 10
      };
      setProducts([...products, newProduct]);
    }
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const getTotalValue = (product: Product) => product.buyingPrice * product.stock;
  const totalInventoryValue = products.reduce((sum, p) => sum + getTotalValue(p), 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-2">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">{products.length}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-2">Total Stock Value</p>
            <p className="text-3xl font-bold text-gray-900">KSh {totalInventoryValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-2">Low Stock Items</p>
            <p className="text-3xl font-bold text-orange-600">{products.filter(p => p.stock < p.reorderLevel).length}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-2">Avg Profit Margin</p>
            <p className="text-3xl font-bold text-green-600">
              {(products.reduce((sum, p) => sum + p.profitMargin, 0) / products.length).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-300"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-200 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Product Name *</label>
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white border-gray-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">SKU *</label>
                    <Input
                      value={formData.sku || ''}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="bg-white border-gray-300"
                      placeholder="e.g., BVRY-001"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Category *</label>
                    <Input
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="bg-white border-gray-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Unit of Measurement *</label>
                    <Select value={formData.uom || 'pcs'} onValueChange={(val) => setFormData({ ...formData, uom: val as UnitOfMeasurement })}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {uomOptions.map(uom => (
                          <SelectItem key={uom} value={uom}>{uom.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-medium text-gray-900 mb-3">Pricing & Cost</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Buying Price *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">KSh </span>
                        <Input
                          type="number"
                          value={formData.buyingPrice || ''}
                          onChange={(e) => setFormData({ ...formData, buyingPrice: parseFloat(e.target.value) })}
                          className="pl-7 bg-white border-gray-300"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Tax %</label>
                      <Input
                        type="number"
                        value={formData.tax || 10}
                        onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) })}
                        className="bg-white border-gray-300"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Tiered Pricing */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-medium text-gray-900 mb-3">Tiered Pricing</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Retail Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">KSh </span>
                        <Input
                          type="number"
                          value={formData.prices?.retail || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            prices: { ...formData.prices, retail: parseFloat(e.target.value) }
                          })}
                          className="pl-7 bg-white border-gray-300"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Wholesale Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">KSh </span>
                        <Input
                          type="number"
                          value={formData.prices?.wholesale || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            prices: { ...formData.prices, wholesale: parseFloat(e.target.value) }
                          })}
                          className="pl-7 bg-white border-gray-300"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Corporate Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">KSh </span>
                        <Input
                          type="number"
                          value={formData.prices?.corporate || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            prices: { ...formData.prices, corporate: parseFloat(e.target.value) }
                          })}
                          className="pl-7 bg-white border-gray-300"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Loyal Customer Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">KSh </span>
                        <Input
                          type="number"
                          value={formData.prices?.loyal || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            prices: { ...formData.prices, loyal: parseFloat(e.target.value) }
                          })}
                          className="pl-7 bg-white border-gray-300"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-medium text-gray-900 mb-3">Stock Management</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Current Stock</label>
                      <Input
                        type="number"
                        value={formData.stock || 0}
                        onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) })}
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Reorder Level</label>
                      <Input
                        type="number"
                        value={formData.reorderLevel || 0}
                        onChange={(e) => setFormData({ ...formData, reorderLevel: parseFloat(e.target.value) })}
                        className="bg-white border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Profit Margin Display */}
                {formData.buyingPrice && formData.prices?.retail && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Profit Margin (Retail)</p>
                    <p className="text-2xl font-bold text-green-600">
                      {calculateProfitMargin(formData.buyingPrice, formData.prices.retail).toFixed(1)}%
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsAddDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>UOM</TableHead>
                  <TableHead>Buy Price</TableHead>
                  <TableHead>Retail Price</TableHead>
                  <TableHead>Margin %</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">{product.sku}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-center">{product.uom.toUpperCase()}</TableCell>
                    <TableCell>KSh {product.buyingPrice.toFixed(2)}</TableCell>
                    <TableCell>KSh {product.prices.retail.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={`${
                        product.profitMargin > 50 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {product.profitMargin.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.stock < product.reorderLevel ? 'destructive' : 'secondary'}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
