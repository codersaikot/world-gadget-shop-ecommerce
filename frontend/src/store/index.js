import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { cartReducer, productReducer, orderReducer, uiReducer } from './slices/otherSlices';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer,
    orders: orderReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
