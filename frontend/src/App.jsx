import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchModels, fetchSummary, fetchHistory, logCall, estimate, clearAll, setActiveModel } from './store/trackerSlice';
import './App.css';

export default function App() {
  const dispatch = useDispatch();
  const { models, summary, history, estimate: est, activeModel, loading } = useSelector(s => s.tracker);
  const [form, setForm] = useState({ model: 'gpt-4o', input_tokens: 1000, output_tokens: 500, session_label: '' });
  const [logged, setLogged] = useState(false);
  const [backendOk, setBackendOk] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/').then(() => { setBackendOk(true); dispatch(fetchModels()); dispatch(fetchSummary()); dispatch(fetchHistory({})); }).catch(() => setBackendOk(false));
  }, [dispatch]);

  useEffect(() => {
    if (form.model && form.input_tokens >= 0 && form.output_tokens >= 0)
      dispatch(estimate({ model: form.model, input_tokens: +form.input_tokens, output_tokens: +form.output_tokens }));
  }, [form.model, form.input_tokens, form.output_tokens, dispatch]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLog = async () => {
    await dispatch(logCall({ ...form, input_tokens: +form.input_tokens, output_tokens: +form.output_tokens }));
    dispatch(fetchSummary()); dispatch(fetchHistory({}));
    setLogged(true); setTimeout(() => setLogged(false), 2000);
  };

  const card = (label, value, sub) => (
    <div style={{background:'#fff',border:'0.5px solid #E2E8F2',borderRadius:8,padding:'12px 14px'}}>
      <div style={{fontSize:12,color:'#6B7280',marginBottom:5}}>{label}</div>
      <div style={{fontSize:22,fontWeight:500,color:'#185FA5'}}>{value}</div>
      {sub && <div style={{fontSize:11,color:'#6B7280',marginTop:3}}>{sub}</div>}
    </div>
  );

  const totalUsd = summary?.total_usd || 0;
  const totalTokens = summary?.total_tokens || 0;
  const totalCalls = summary?.total_calls || 0;
  const avgCost = summary?.avg_cost_usd || 0;

  return (
    <div className="app">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:8}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:500}}>LLM Token & Cost Tracker</h1>
          <p style={{fontSize:12,color:'#6B7280',marginTop:3}}>Real-time tracking — GPT-4o & Claude</p>
        </div>
        <span style={{fontSize:11,padding:'3px 10px',borderRadius:20,background:backendOk?'#E1F5EE':'#FCEBEB',color:backendOk?'#085041':'#A32D2D'}}>
          {backendOk===null?'Connecting..':backendOk?'✓ Connected':'✗ Backend offline'}
        </span>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10,marginBottom:16}}>
        {card('Total tokens', totalTokens.toLocaleString(), 'input + output')}
        {card('Total cost', '$'+totalUsd.toFixed(6), '₹'+(totalUsd*83.5).toFixed(2))}
        {card('API calls', totalCalls, 'sessions tracked')}
        {card('Avg cost/call', '$'+avgCost.toFixed(6), 'per request')}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        <div style={{background:'#fff',border:'0.5px solid #E2E8F2',borderRadius:12,padding:'14px 16px'}}>
          <div style={{fontSize:13,fontWeight:500,color:'#6B7280',marginBottom:12}}>Live cost calculator</div>
          <div style={{marginBottom:8}}>
            <label style={{fontSize:12,color:'#6B7280',display:'block',marginBottom:4}}>Model</label>
            <select value={form.model} onChange={e=>set('model',e.target.value)}>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
            </select>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:8}}>
            <div style={{flex:1}}><label style={{fontSize:12,color:'#6B7280',display:'block',marginBottom:4}}>Input tokens</label><input type="number" value={form.input_tokens} onChange={e=>set('input_tokens',e.target.value)} min="0"/></div>
            <div style={{flex:1}}><label style={{fontSize:12,color:'#6B7280',display:'block',marginBottom:4}}>Output tokens</label><input type="number" value={form.output_tokens} onChange={e=>set('output_tokens',e.target.value)} min="0"/></div>
          </div>
          <div style={{marginBottom:8}}><label style={{fontSize:12,color:'#6B7280',display:'block',marginBottom:4}}>Session label</label><input type="text" value={form.session_label} onChange={e=>set('session_label',e.target.value)} placeholder="e.g. Saudia booking flow"/></div>
          {est && <div style={{background:'#F0F4FA',borderRadius:8,padding:'10px 12px',marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#6B7280',padding:'2px 0'}}><span>Input cost</span><span></span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#6B7280',padding:'2px 0'}}><span>Output cost</span><span></span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:14,borderTop:'0.5px solid #E2E8F2',marginTop:4,paddingTop:4}}><span style={{color:'#6B7280'}}>Total USD</span><span style={{fontWeight:500,color:'#185FA5'}}></span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}><span style={{color:'#6B7280'}}>Total INR</span><span style={{color:'#7F77DD'}}>₹{est.total_inr?.toFixed(2)}</span></div>
          </div>}
          <button onClick={handleLog} disabled={loading} style={{width:'100%',background:logged?'#E1F5EE':undefined,color:logged?'#085041':undefined}}>
            {logged?'✓ Logged!':loading?'Logging…':'+ Log this call'}
          </button>
        </div>

        <div style={{background:'#fff',border:'0.5px solid #E2E8F2',borderRadius:12,padding:'14px 16px'}}>
          <div style={{fontSize:13,fontWeight:500,color:'#6B7280',marginBottom:12}}>Cost by model</div>
          {summary?.by_model && Object.keys(summary.by_model).length ? Object.entries(summary.by_model).map(([k,v])=>(
            <div key={k} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                <span style={{fontWeight:500}}>{v.label}</span>
                <span style={{color:'#6B7280'}}></span>
              </div>
              <div style={{background:'#F0F4FA',borderRadius:4,height:8}}>
                <div style={{background:v.provider==='openai'?'#378ADD':'#7F77DD',height:8,borderRadius:4,width:Math.min(100,((v.cost_usd||0)/Math.max(...Object.values(summary.by_model).map(x=>x.cost_usd||0.000001)))*100)+'%'}}/>
              </div>
              <div style={{fontSize:11,color:'#6B7280',marginTop:2}}>{v.calls} calls · {v.tokens?.toLocaleString()} tokens · ₹{v.cost_inr?.toFixed(2)}</div>
            </div>
          )) : <p style={{fontSize:12,color:'#6B7280',textAlign:'center',padding:'2rem 0'}}>Log calls to see breakdown</p>}
        </div>
      </div>

      <div style={{background:'#fff',border:'0.5px solid #E2E8F2',borderRadius:12,padding:'14px 16px',marginBottom:10}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:500,color:'#6B7280'}}>Call history</div>
          {history.length>0 && <button onClick={()=>dispatch(clearAll())} style={{fontSize:12,padding:'3px 10px',color:'#A32D2D',border:'0.5px solid #A32D2D',borderRadius:4,background:'transparent'}}>Clear all</button>}
        </div>
        {history.length===0 ? <p style={{fontSize:12,color:'#6B7280',textAlign:'center',padding:'1.5rem 0'}}>No calls logged yet — use the calculator above</p> :
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr>{['#','Model','Session','Input','Output','USD','INR','Time'].map(h=><th key={h} style={{fontWeight:500,fontSize:12,color:'#6B7280',textAlign:'left',padding:'6px 8px',borderBottom:'0.5px solid #E2E8F2'}}>{h}</th>)}</tr></thead>
            <tbody>{history.map((c,i)=>(
              <tr key={c.id} style={{borderBottom:'0.5px solid #E2E8F2'}}>
                <td style={{padding:'8px',color:'#6B7280'}}>{i+1}</td>
                <td style={{padding:'8px'}}><span style={{fontSize:11,padding:'2px 8px',borderRadius:4,background:c.provider==='openai'?'#EEF4FB':'#EEEDFE',color:c.provider==='openai'?'#0C447C':'#3C3489'}}>{c.label}</span></td>
                <td style={{padding:'8px',color:'#6B7280',fontSize:12}}>{c.session_label}</td>
                <td style={{padding:'8px'}}>{c.input_tokens?.toLocaleString()}</td>
                <td style={{padding:'8px'}}>{c.output_tokens?.toLocaleString()}</td>
                <td style={{padding:'8px',fontWeight:500}}></td>
                <td style={{padding:'8px',color:'#7F77DD'}}>₹{c.total_inr?.toFixed(2)}</td>
                <td style={{padding:'8px',color:'#6B7280',fontSize:12}}>{new Date(c.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>}
      </div>
    </div>
  );
}
