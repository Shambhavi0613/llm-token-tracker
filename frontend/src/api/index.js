const BASE = 'http://localhost:8000';
const api = async (method, path, body=null) => {
  const res = await fetch(BASE+path,{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):null});
  if(!res.ok) throw new Error('HTTP '+res.status);
  return res.json();
};
export const getModels  = ()  => api('GET','/models');
export const getSummary = ()  => api('GET','/summary');
export const getHistory = (m) => api('GET','/history'+(m?'?model='+m:''));
export const trackCall  = (p) => api('POST','/track',p);
export const estimateCost=(p) => api('POST','/estimate',p);
export const clearHistory=()  => api('DELETE','/history');
