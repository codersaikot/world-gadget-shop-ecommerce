import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const buildNoCacheConfig = (params = {}) => ({
  params: { ...params, _t: Date.now() },
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
});

// ─── CART SLICE ───────────────────────────────────────────────────────────────
export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/cart'); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const addToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/cart/add', data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateCartItem = createAsyncThunk('cart/update', async (data, { rejectWithValue }) => {
  try { const res = await api.put('/cart/update', data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (productId, { rejectWithValue }) => {
  try { await api.delete(`/cart/remove/${productId}`); return productId; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try { await api.delete('/cart/clear'); return []; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    resetCart: (state) => { state.items = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || [];
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
        toast.success('Added to cart!');
      })
      .addCase(addToCart.rejected, (_, action) => { toast.error(action.payload || 'Failed to add'); })
      .addCase(updateCartItem.fulfilled, (state, action) => { state.items = action.payload?.items || []; })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.product?._id !== action.payload);
        toast.success('Item removed');
      })
      .addCase(clearCart.fulfilled, (state) => { state.items = []; });
  },
});

export const { resetCart } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;

// ─── PRODUCT SLICE ────────────────────────────────────────────────────────────
export const fetchProducts = createAsyncThunk('products/fetch', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/products', buildNoCacheConfig(params));
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchFeaturedProducts = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/products/featured', buildNoCacheConfig()); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try { const res = await api.get(`/products/${id}`, buildNoCacheConfig()); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createProduct = createAsyncThunk('products/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/products', payload);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [], featured: [], currentProduct: null,
    pagination: null, loading: false, error: null,
  },
  reducers: { clearProduct: (state) => { state.currentProduct = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => { state.featured = action.payload; })
      .addCase(fetchProduct.pending, (state) => { state.loading = true; })
      .addCase(fetchProduct.fulfilled, (state, action) => { state.loading = false; state.currentProduct = action.payload; })
      .addCase(fetchProduct.rejected, (state) => { state.loading = false; })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.currentProduct = action.payload;
        state.products = [action.payload, ...state.products];
        if (state.pagination) {
          state.pagination.total += 1;
          state.pagination.pages = Math.ceil(state.pagination.total / state.pagination.limit);
        }
      });
  },
});

export const { clearProduct } = productSlice.actions;
export const productReducer = productSlice.reducer;

// ─── ORDER SLICE ──────────────────────────────────────────────────────────────
export const createOrder = createAsyncThunk('orders/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/orders', data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchMyOrders = createAsyncThunk('orders/myOrders', async (params, { rejectWithValue }) => {
  try { const res = await api.get('/orders/my', { params }); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchOrder = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try { const res = await api.get(`/orders/${id}`); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { orders: [], currentOrder: null, loading: false, error: null, success: false },
  reducers: { clearOrderSuccess: (state) => { state.success = false; state.currentOrder = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false; state.success = true; state.currentOrder = action.payload;
        toast.success('Order placed successfully!');
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
        toast.error(action.payload || 'Order failed');
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => { state.orders = action.payload.orders; })
      .addCase(fetchOrder.fulfilled, (state, action) => { state.currentOrder = action.payload; });
  },
});

export const { clearOrderSuccess } = orderSlice.actions;
export const orderReducer = orderSlice.reducer;

// ─── UI SLICE ─────────────────────────────────────────────────────────────────
const uiSlice = createSlice({
  name: 'ui',
  initialState: { isMobileMenuOpen: false, isFilterOpen: false, isCartOpen: false },
  reducers: {
    toggleMobileMenu: (state) => { state.isMobileMenuOpen = !state.isMobileMenuOpen; },
    toggleFilter: (state) => { state.isFilterOpen = !state.isFilterOpen; },
    toggleCart: (state) => { state.isCartOpen = !state.isCartOpen; },
    closeAll: (state) => { state.isMobileMenuOpen = false; state.isFilterOpen = false; state.isCartOpen = false; },
  },
});

export const { toggleMobileMenu, toggleFilter, toggleCart, closeAll } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
