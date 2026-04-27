import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatDate, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import { FiPlus, FiEdit2, FiTrash2, FiTag } from 'react-icons/fi';

const emptyForm = {
  code: '', description: '', discountType: 'percentage',
  discountValue: '', minOrderAmount: '', maxDiscount: '',
  usageLimit: '', expiresAt: '', isActive: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const res = await api.get('/coupons'); setCoupons(res.data.data); }
    catch { toast.error('Failed to load coupons'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModal(true); };
  const openEdit = (c) => {
    setForm({
      ...c,
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().split('T')[0] : '',
    });
    setEditId(c._id); setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, discountValue: Number(form.discountValue), minOrderAmount: Number(form.minOrderAmount) || 0 };
      if (editId) { await api.put(`/coupons/${editId}`, payload); toast.success('Coupon updated!'); }
      else { await api.post('/coupons', payload); toast.success('Coupon created!'); }
      setModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    await api.delete(`/coupons/${id}`); toast.success('Deleted'); fetch();
  };

  if (loading) return <Spinner center />;

  const isExpired = (date) => new Date(date) < new Date();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Coupons ({coupons.length})</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus /> Add Coupon</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.length === 0 && <p className="text-gray-400 text-sm">No coupons yet. Create your first coupon!</p>}
        {coupons.map(coupon => (
          <div key={coupon._id} className={`card p-4 border-l-4 ${coupon.isActive && !isExpired(coupon.expiresAt) ? 'border-l-green-500' : 'border-l-gray-300 opacity-70'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <FiTag className="text-blue-600" />
                <span className="font-bold text-lg tracking-wide text-blue-700">{coupon.code}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(coupon)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 className="text-sm" /></button>
                <button onClick={() => handleDelete(coupon._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 className="text-sm" /></button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">{coupon.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-400">Discount</p>
                <p className="font-semibold text-green-600">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue)}
                  {coupon.discountType === 'percentage' && coupon.maxDiscount ? ` (max ${formatCurrency(coupon.maxDiscount)})` : ''}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-400">Min Order</p>
                <p className="font-semibold">{formatCurrency(coupon.minOrderAmount)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-400">Used / Limit</p>
                <p className="font-semibold">{coupon.usedCount} / {coupon.usageLimit || '∞'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-400">Expires</p>
                <p className={`font-semibold ${isExpired(coupon.expiresAt) ? 'text-red-500' : ''}`}>{formatDate(coupon.expiresAt)}</p>
              </div>
            </div>
            {isExpired(coupon.expiresAt) && <p className="text-xs text-red-500 mt-2 font-medium">⚠ Expired</p>}
          </div>
        ))}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Coupon' : 'Create Coupon'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Coupon Code *</label>
              <input required className="input-field uppercase" placeholder="e.g. SAVE20" value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <input className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Type *</label>
              <select required className="input-field" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (৳)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Value *</label>
              <input required type="number" min="0" className="input-field" value={form.discountValue}
                onChange={e => setForm({ ...form, discountValue: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Order (৳)</label>
              <input type="number" min="0" className="input-field" value={form.minOrderAmount}
                onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Discount (৳)</label>
              <input type="number" min="0" className="input-field" placeholder="Optional" value={form.maxDiscount}
                onChange={e => setForm({ ...form, maxDiscount: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Usage Limit</label>
              <input type="number" min="1" className="input-field" placeholder="Leave blank = unlimited" value={form.usageLimit}
                onChange={e => setForm({ ...form, usageLimit: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date *</label>
              <input required type="date" className="input-field" value={form.expiresAt}
                onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Coupon'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
