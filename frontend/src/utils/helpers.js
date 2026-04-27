export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '৳0';
  return `৳${Number(amount).toLocaleString('en-BD')}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-BD', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-BD', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const truncate = (str, n = 80) =>
  str && str.length > n ? str.slice(0, n) + '…' : str;

export const getOrderStatusColor = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

export const getOrderStatusStep = (status) => {
  const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  return steps.indexOf(status);
};

export const debounce = (fn, delay = 400) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const getProductImage = (product) =>
  product?.images?.[0]?.url || 'https://placehold.co/400x400?text=No+Image';

export const calcCartTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const calcCartCount = (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0);
