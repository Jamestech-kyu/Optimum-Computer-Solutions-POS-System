import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Button from '../components/common/Button';
import CustomerTable from '../components/customers/CustomerTable';
import CustomerModal from '../components/customers/CustomerModal';
import CustomerSearchForm from '../components/customers/CustomerSearchForm';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getCustomer,
} from '../api/customers';
import { useNotification } from '../context/NotificationContext';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchParams, setSearchParams] = useState({});
  const { showNotification } = useNotification();

  // Fetch customers
  const fetchCustomers = async (params = {}) => {
    setIsLoading(true);
    try {
      const response = await getCustomers(params);
      // Handle pagination if present
      const data = response.results || response;
      setCustomers(Array.isArray(data) ? data : []);
      setFilteredCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      showNotification(
        'Failed to fetch customers: ' + (error.response?.data?.detail || error.message),
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle search
  const handleSearch = async (params) => {
    setSearchParams(params);
    setIsLoading(true);
    try {
      if (params.q || params.tier || params.min_spent || params.max_spent) {
        // Use advanced search endpoint
        const response = await searchCustomers(
          params.q || '',
          {
            tier: params.tier,
            min_spent: params.min_spent,
            max_spent: params.max_spent,
          }
        );
        setFilteredCustomers(Array.isArray(response) ? response : []);
      } else {
        // Reset to all customers
        setFilteredCustomers(customers);
      }
    } catch (error) {
      showNotification(
        'Search failed: ' + (error.response?.data?.detail || error.message),
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle add customer
  const handleAddCustomer = async (formData) => {
    setIsLoading(true);
    try {
      await createCustomer(formData);
      showNotification('Customer added successfully', 'success');
      setIsModalOpen(false);
      setSelectedCustomer(null);
      fetchCustomers(searchParams);
    } catch (error) {
      showNotification(
        'Failed to add customer: ' + (error.response?.data?.detail || error.message),
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle update customer
  const handleUpdateCustomer = async (formData) => {
    setIsLoading(true);
    try {
      await updateCustomer(selectedCustomer.id, formData);
      showNotification('Customer updated successfully', 'success');
      setIsModalOpen(false);
      setSelectedCustomer(null);
      fetchCustomers(searchParams);
    } catch (error) {
      showNotification(
        'Failed to update customer: ' + (error.response?.data?.detail || error.message),
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setIsLoading(true);
      try {
        await deleteCustomer(id);
        showNotification('Customer deleted successfully', 'success');
        fetchCustomers(searchParams);
      } catch (error) {
        showNotification(
          'Failed to delete customer: ' + (error.response?.data?.detail || error.message),
          'error'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle edit customer
  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  // Handle view customer details
  const handleViewCustomer = async (id) => {
    try {
      const customer = await getCustomer(id);
      setSelectedCustomer(customer);
      setIsModalOpen(true);
    } catch (error) {
      showNotification(
        'Failed to fetch customer details: ' + (error.response?.data?.detail || error.message),
        'error'
      );
    }
  };

  // Handle modal submit
  const handleModalSubmit = (formData) => {
    if (selectedCustomer) {
      handleUpdateCustomer(formData);
    } else {
      handleAddCustomer(formData);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">
            Manage your customer database and loyalty program
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedCustomer(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add Customer
        </Button>
      </div>

      {/* Search and Filters */}
      <CustomerSearchForm onSearch={handleSearch} isLoading={isLoading} />

      {/* Customers Table */}
      <CustomerTable
        customers={filteredCustomers}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
        onView={handleViewCustomer}
        isLoading={isLoading}
      />

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        isLoading={isLoading}
        initialData={selectedCustomer}
      />
    </div>
  );
}
