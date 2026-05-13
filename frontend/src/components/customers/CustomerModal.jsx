import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

export default function CustomerModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postal_code: '',
    loyalty_tier: 'bronze',
    credit_limit: 0,
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setErrors({});
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        postal_code: '',
        loyalty_tier: 'bronze',
        credit_limit: 0,
        notes: '',
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'credit_limit' ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name.trim())
      newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim())
      newErrors.last_name = 'Last name is required';
    if (!formData.phone.trim())
      newErrors.phone = 'Phone number is required';
    if (!/^\d+$/.test(formData.phone))
      newErrors.phone = 'Phone must be numeric';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              error={errors.first_name}
              required
            />
            <Input
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              error={errors.last_name}
              required
            />
          </div>

          {/* Contact Row */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="254700000000"
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="customer@example.com"
            />
          </div>

          {/* Address Row */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
            />
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City name"
            />
          </div>

          {/* Location & Tier Row */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Postal Code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              placeholder="Postal code"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loyalty Tier
              </label>
              <select
                name="loyalty_tier"
                value={formData.loyalty_tier}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>
          </div>

          {/* Credit Limit & Notes Row */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Credit Limit (Ksh)"
              name="credit_limit"
              type="number"
              value={formData.credit_limit}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
            />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Add any additional notes about this customer..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
              loading={isLoading}
            >
              {initialData ? 'Update Customer' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
