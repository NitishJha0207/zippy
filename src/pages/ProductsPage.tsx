import { useState } from 'react';
import { Package, Plus, Search, Edit2, Trash2, Printer } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useProducts } from '../hooks/useProducts';
import { ProductModal } from '../components/products/ProductModal';
import type { Product } from '../types/database.types';

export function ProductsPage() {
  const { products, loading, deleteProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(undefined);
  };

  const handlePrintLabel = (product: Product) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Label - ${product.name}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            .label {
              width: 300px;
              border: 2px solid #000;
              padding: 15px;
              text-align: center;
            }
            .product-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .barcode-container {
              margin: 15px 0;
            }
            .product-info {
              font-size: 14px;
              margin-top: 10px;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        </head>
        <body>
          <div class="label">
            <div class="product-name">${product.name}</div>
            <div class="barcode-container">
              <svg id="barcode"></svg>
            </div>
            <div class="product-info">
              <div>Price: ₹${product.price.toFixed(2)}</div>
              ${product.sku ? `<div>SKU: ${product.sku}</div>` : ''}
            </div>
          </div>
          <script>
            JsBarcode("#barcode", "${product.barcode}", {
              format: "CODE128",
              width: 2,
              height: 60,
              displayValue: true,
              fontSize: 14
            });
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 100);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-1">Manage your product catalog</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Product
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search products by name, barcode, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Get started by adding your first product'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 mx-auto">
                <Plus className="w-5 h-5" />
                Add Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Barcode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{product.name}</span>
                          {product.sku && (
                            <span className="text-xs text-gray-500">SKU: {product.sku}</span>
                          )}
                          {product.hsn_code && (
                            <span className="text-xs text-gray-500">HSN: {product.hsn_code}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.barcode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ₹{product.price.toFixed(2)}
                        <span className="text-xs text-gray-500"> /{product.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.stock_quantity !== null ? (
                          <span className={product.low_stock_alert && product.stock_quantity <= product.low_stock_alert ? 'text-red-600 font-medium' : ''}>
                            {product.stock_quantity}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {product.category || '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintLabel(product)}
                            className="flex items-center gap-1"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="flex items-center gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={handleCloseModal}
        />
      )}
    </Layout>
  );
}
