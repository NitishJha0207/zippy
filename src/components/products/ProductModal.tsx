import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { useProducts } from '../../hooks/useProducts';
import type { Product } from '../../types/database.types';

interface ProductModalProps {
  product?: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { createProduct, updateProduct } = useProducts();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    barcode: '',
    sku: '',
    price: '',
    hsn_code: '',
    tax_rate: '18',
    unit: 'pcs',
    stock_quantity: '',
    low_stock_alert: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        barcode: product.barcode,
        sku: product.sku || '',
        price: product.price.toString(),
        hsn_code: product.hsn_code || '',
        tax_rate: product.tax_rate.toString(),
        unit: product.unit,
        stock_quantity: product.stock_quantity?.toString() || '',
        low_stock_alert: product.low_stock_alert?.toString() || '',
        category: product.category || ''
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const productData = {
      name: formData.name,
      description: formData.description || null,
      barcode: formData.barcode,
      sku: formData.sku || null,
      price: parseFloat(formData.price) || 0,
      hsn_code: formData.hsn_code || null,
      tax_rate: parseFloat(formData.tax_rate) || 0,
      unit: formData.unit,
      stock_quantity: formData.stock_quantity ? parseFloat(formData.stock_quantity) : null,
      low_stock_alert: formData.low_stock_alert ? parseFloat(formData.low_stock_alert) : null,
      category: formData.category || null
    };

    try {
      if (product) {
        await updateProduct(product.id, productData);
      } else {
        await createProduct(productData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} title={product ? 'Edit Product' : 'Add Product'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Barcode *
            </label>
            <Input
              type="text"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              placeholder="Enter barcode"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU
            </label>
            <Input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Enter SKU"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <Select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            >
              <option value="pcs">Pieces</option>
              <option value="kg">Kilogram</option>
              <option value="ltr">Liter</option>
              <option value="box">Box</option>
              <option value="dozen">Dozen</option>
              <option value="meter">Meter</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              HSN Code
            </label>
            <Input
              type="text"
              value={formData.hsn_code}
              onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
              placeholder="Enter HSN code"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST Rate (%)
            </label>
            <Select
              value={formData.tax_rate}
              onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
            >
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
              <option value="28">28%</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Low Stock Alert
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.low_stock_alert}
              onChange={(e) => setFormData({ ...formData, low_stock_alert: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Enter category"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
