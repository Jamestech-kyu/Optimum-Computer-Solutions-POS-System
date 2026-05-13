import { useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, getCategories } from '../api/products';
import { formatCurrency } from '../utils/formatCurrency';
import { useNotification } from '../context/NotificationContext';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';

const EMPTY_FORM = {
  name:           '',
  sku:            '',
  unit_price:     '',
  stock_quantity: '',
  reorder_level:  '10',
  category:       '',
};

const COLUMNS = [
  { key: 'name',           label: 'Product' },
  { key: 'sku',            label: 'SKU' },
  { key: 'category_name',  label: 'Category',  render: (v) => v || '—' },
  { key: 'unit_price',     label: 'Price',     render: (v) => formatCurrency(v) },
  {
    key: 'stock_quantity',
    label: 'Stock',
    render: (v, row) => (
      <span className={row.is_low_stock ? 'text-yellow-600 font-semibold' : 'text-gray-700'}>
        {v} {row.is_low_stock && '⚠️'}
      </span>
    ),
  },
  {
    key: 'is_active',
    label: 'Status',
    render: (v) => <Badge variant={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Badge>,
  },
];

export default function ProductsPage() {
  const { success, error: notifyError } = useNotification();

  const [products,   setProducts  ] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading   ] = useState(true);
  const [search,     setSearch    ] = useState('');
  const [modalOpen,  setModalOpen ] = useState(false);
  const [editing,    setEditing   ] = useState(null);
  const [form,       setForm      ] = useState(EMPTY_FORM);
  const [saving,     setSaving    ] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        getProducts(search),
        getCategories(),
      ]);
      setProducts(pRes.data.results || pRes.data);
      setCategories(cRes.data.results || cRes.data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setForm({
      name:           product.name,
      sku:            product.sku,
      unit_price:     product.unit_price,
      stock_quantity: product.stock_quantity,
      reorder_level:  product.reorder_level,
      category:       product.category || '',
    });
    setEditing(product);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await updateProduct(editing.id, form);
        success('Product updated successfully.');
      } else {
        await createProduct(form);
        success('Product created successfully.');
      }
      setModalOpen(false);
      fetchProducts();
    } catch {
      notifyError('Could not save. Check all fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  const setField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">Click any row to edit</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          + Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <Table
        columns={COLUMNS}
        data={products}
        loading={loading}
        onRowClick={openEdit}
        emptyMessage="No products found. Click Add Product to get started."
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit — ${editing.name}` : 'Add New Product'}
      >
        <div className="space-y-4">
          <Input
            label="Product Name"
            value={form.name}
            onChange={setField('name')}
            placeholder="e.g. White Bread 400g"
          />
          <Input
            label="SKU (Stock Keeping Unit)"
            value={form.sku}
            onChange={setField('sku')}
            placeholder="e.g. BRD-001"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Unit Price (KES)"
              type="number"
              min="0"
              step="0.01"
              value={form.unit_price}
              onChange={setField('unit_price')}
              placeholder="0.00"
            />
            <Input
              label="Stock Quantity"
              type="number"
              min="0"
              value={form.stock_quantity}
              onChange={setField('stock_quantity')}
              placeholder="0"
            />
          </div>
          <Input
            label="Reorder Level (low stock warning)"
            type="number"
            min="0"
            value={form.reorder_level}
            onChange={setField('reorder_level')}
            placeholder="10"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              value={form.category}
              onChange={setField('category')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">— No Category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSave}
              loading={saving}
            >
              {editing ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}