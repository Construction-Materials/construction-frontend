'use client';

import { useState } from 'react';
import { Material, Order } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, ShoppingCart, Package, Truck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MaterialSelect } from './shared/MaterialSelect';
import { StatusBadge } from './shared/StatusBadge';
import { EmptyState } from './shared/EmptyState';

interface OrdersManagerProps {
  constructionId: string;
  materials: Material[];
  orders: Order[];
  onAddOrder: (order: Omit<Order, 'id'>) => void;
  onUpdateOrder: (id: string, updates: Partial<Order>) => void;
}

export function OrdersManager({
  constructionId,
  materials,
  orders,
  onAddOrder,
  onUpdateOrder
}: OrdersManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    materialId: '',
    quantity: '',
    supplier: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrder({
      constructionId,
      materialId: formData.materialId,
      quantity: parseFloat(formData.quantity),
      status: 'pending',
      orderDate: new Date().toISOString().split('T')[0],
      supplier: formData.supplier || undefined,
      notes: formData.notes || undefined
    });
    setFormData({
      materialId: '',
      quantity: '',
      supplier: '',
      notes: ''
    });
    setDialogOpen(false);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'ordered':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return t.pending;
      case 'ordered':
        return t.ordered;
      case 'delivered':
        return t.delivered;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return ShoppingCart;
      case 'ordered':
        return Truck;
      case 'delivered':
        return CheckCircle2;
    }
  };

  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t.ordersTitle}</CardTitle>
            <CardDescription>
              {t.ordersDescription}
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-2" />
                {t.createOrder}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.createNewOrder}</DialogTitle>
                <DialogDescription>
                  {t.createOrderDesc}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <MaterialSelect
                  materials={materials}
                  value={formData.materialId}
                  onChange={(value) => setFormData({ ...formData, materialId: value })}
                  required
                />
                <div>
                  <Label htmlFor="order-quantity">{t.quantity} *</Label>
                  <Input
                    id="order-quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder={t.quantityToAdd}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="order-supplier">{t.supplier}</Label>
                  <Input
                    id="order-supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder={t.supplierName}
                  />
                </div>
                <div>
                  <Label htmlFor="order-notes">{t.notes}</Label>
                  <Textarea
                    id="order-notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t.additionalNotes}
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {t.createOrderBtn}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title={t.noOrders}
            description={t.noOrdersDesc}
            actionLabel={t.createOrder}
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.material}</TableHead>
                <TableHead className="text-right">{t.quantity}</TableHead>
                <TableHead>{t.supplier}</TableHead>
                <TableHead>{t.orderDate}</TableHead>
                <TableHead>{t.status}</TableHead>
                <TableHead className="text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const material = materials.find(m => m.material_id === order.materialId);
                if (!material) return null;
                
                const StatusIcon = getStatusIcon(order.status);
                
                return (
                  <TableRow key={order.id}>
                    <TableCell className="max-w-[200px]">
                      <div className="truncate" title={material.name}>{material.name}</div>
                      {order.notes && (
                        <div className="text-sm text-slate-500 truncate" title={order.notes}>{order.notes}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {order.quantity.toLocaleString(t.locale)} {material.unit}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={order.supplier || ''}>{order.supplier || '-'}</TableCell>
                    <TableCell>
                      {new Date(order.orderDate).toLocaleDateString(t.locale)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} type="order" />
                    </TableCell>
                    <TableCell className="text-right">
                      {order.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateOrder(order.id, { status: 'ordered' })}
                        >
                          {t.updateStatus}
                        </Button>
                      )}
                      {order.status === 'ordered' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateOrder(order.id, { 
                            status: 'delivered',
                            deliveryDate: new Date().toISOString().split('T')[0]
                          })}
                        >
                          {t.delivered}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}