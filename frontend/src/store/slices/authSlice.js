import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const userFromStorage = localStorage.getItem('wgs_user')
  ? JSON.parse(localStorage.getItem('wgs_user'))
  : null;

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/profile', data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const toggleWishlist = createAsyncThunk('auth/toggleWishlist', async (productId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/auth/wishlist/${productId}`);
    return { productId, inWishlist: res.data.inWishlist };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: userFromStorage,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('wgs_user');
      localStorage.removeItem('wgs_token');
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem('wgs_user', JSON.stringify(action.payload));
        localStorage.setItem('wgs_token', action.payload.token);
        toast.success('Welcome to World Gadget Shop!');
      })
      .addCase(registerUser.rejected, (state, action) => {
        rejected(state, action);
        toast.error(action.payload);
      })
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem('wgs_user', JSON.stringify(action.payload));
        localStorage.setItem('wgs_token', action.payload.token);
        toast.success(`Welcome back, ${action.payload.name}!`);
      })
      .addCase(loginUser.rejected, (state, action) => {
        rejected(state, action);
        toast.error(action.payload);
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('wgs_user', JSON.stringify({ ...state.user, ...action.payload }));
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('wgs_user', JSON.stringify({ ...state.user, ...action.payload }));
        toast.success('Profile updated!');
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { productId, inWishlist } = action.payload;
        if (!state.user.wishlist) state.user.wishlist = [];
        if (inWishlist) {
          state.user.wishlist.push(productId);
          toast.success('Added to wishlist');
        } else {
          state.user.wishlist = state.user.wishlist.filter((id) => id !== productId && id?._id !== productId);
          toast.success('Removed from wishlist');
        }
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
