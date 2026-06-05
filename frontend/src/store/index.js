import { configureStore } from '@reduxjs/toolkit';
import trackerReducer from './trackerSlice';
export const store = configureStore({ reducer: { tracker: trackerReducer } });
