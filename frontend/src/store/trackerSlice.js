import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../api';
export const fetchModels  = createAsyncThunk('tracker/fetchModels',  api.getModels);
export const fetchSummary = createAsyncThunk('tracker/fetchSummary', api.getSummary);
export const fetchHistory = createAsyncThunk('tracker/fetchHistory', ({model}={}) => api.getHistory(model));
export const logCall      = createAsyncThunk('tracker/logCall',      api.trackCall);
export const estimate     = createAsyncThunk('tracker/estimate',     api.estimateCost);
export const clearAll     = createAsyncThunk('tracker/clearAll',     async(_,{dispatch}) => { await api.clearHistory(); dispatch(fetchSummary()); dispatch(fetchHistory({})); });
const trackerSlice = createSlice({
  name:'tracker',
  initialState:{models:[],summary:null,history:[],estimate:null,loading:false,error:null,activeModel:'all'},
  reducers:{
    setActiveModel:(s,a)=>{s.activeModel=a.payload;},
    clearEstimate:(s)=>{s.estimate=null;}
  },
  extraReducers:(builder)=>{
    builder
      .addCase(fetchModels.fulfilled,(s,a)=>{s.models=a.payload.models;})
      .addCase(fetchSummary.fulfilled,(s,a)=>{s.summary=a.payload;})
      .addCase(fetchHistory.fulfilled,(s,a)=>{s.history=a.payload.calls;})
      .addCase(estimate.fulfilled,(s,a)=>{s.estimate=a.payload;})
      .addMatcher((a)=>a.type.endsWith('/pending'),(s)=>{s.loading=true;s.error=null;})
      .addMatcher((a)=>a.type.endsWith('/fulfilled')||a.type.endsWith('/rejected'),(s,a)=>{s.loading=false;if(a.error)s.error=a.error.message;});
  }
});
export const {setActiveModel,clearEstimate}=trackerSlice.actions;
export default trackerSlice.reducer;
