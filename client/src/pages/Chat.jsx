import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Trash2, Bot, User, Loader2, AlertTriangle,
  Sparkles, Stethoscope,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PROMPTS = [
  'What are symptoms of diabetes?',
  'Best diet for fever recovery?',
  'When is chest pain serious?',
  'What is dengue fever?',
  'How to reduce headache naturally?',
];

const INIT = [{
  role:'bot',
  text:"👋 Hello! I'm MediBot — your AI health companion powered by Gemini. Ask me about symptoms, medications, or general health advice. I provide health education only, not medical diagnosis. How can I help you today?",
  timestamp: new Date(),
}];

function Bubble({ msg }) {
  const isBot   = msg.role === 'bot';
  const isEmerg = msg.type === 'emergency';
  const isError = msg.type === 'error' || msg.text.startsWith('⚠️');
  
  return (
    <motion.div
      initial={{ opacity:0, y:10, scale:.97 }}
      animate={{ opacity:1, y:0, scale:1 }}
      transition={{ duration:.25 }}
      style={{ 
        display:'flex', 
        gap:12, 
        justifyContent:isBot?'flex-start':'flex-end', 
        marginBottom:16, 
        alignItems:'flex-end',
        maxWidth: 820,
        margin: '0 auto 16px auto'
      }}
    >
      {isBot && (
        <div style={{
          width:34, height:34, borderRadius:11, flexShrink:0,
          background: (isEmerg || isError) ? 'var(--red-dim)' : 'linear-gradient(135deg,var(--teal),var(--purple))',
          border: (isEmerg || isError) ? '1px solid rgba(225,29,72,0.3)' : 'none',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow: (isEmerg || isError) ? 'none' : '0 4px 12px rgba(16,185,129,.15)',
        }}>
          {(isEmerg || isError) ? <AlertTriangle size={15} color="var(--red)"/> : <Bot size={16} color="#ffffff"/>}
        </div>
      )}

      <div style={{
        maxWidth:'75%', padding:'12px 18px',
        borderRadius: isBot ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
        background: (isEmerg || isError)
          ? 'var(--red-dim)'
          : isBot
          ? 'var(--bg-2)'
          : 'linear-gradient(135deg,var(--teal),var(--purple))',
        border: (isEmerg || isError)
          ? '1px solid rgba(225,29,72,.22)'
          : '1px solid var(--border-2)',
        color: (isEmerg || isError) ? 'var(--red)' : isBot ? 'var(--t1)' : '#ffffff',
        fontSize:'.9rem', lineHeight:1.7, fontWeight: isBot ? 500 : 600,
        boxShadow: isBot ? 'var(--sh-xs)' : '0 4px 18px rgba(16,185,129,.15)',
      }}>
        <p style={{ whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{msg.text}</p>
        {msg.timestamp && (
          <div style={{ fontSize:'.65rem', opacity:.5, marginTop:6, textAlign:isBot?'left':'right', color: (isEmerg || isError) ? 'var(--red)' : 'inherit' }}>
            {new Date(msg.timestamp).toLocaleTimeString([],{ hour:'2-digit', minute:'2-digit' })}
          </div>
        )}
      </div>

      {!isBot && (
        <div style={{ 
          width:34, height:34, borderRadius:'50%', 
          background:'var(--teal-dim)', 
          border:'1px solid var(--border)', 
          display:'flex', alignItems:'center', justifyContent:'center', 
          flexShrink:0 
        }}>
          <User size={15} style={{ color:'var(--teal)' }}/>
        </div>
      )}
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div style={{ display:'flex', gap:12, marginBottom:16, alignItems:'flex-end', maxWidth: 820, margin: '0 auto 16px auto' }}>
      <div style={{ width:34, height:34, borderRadius:11, background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(16,185,129,.15)', flexShrink:0 }}>
        <Bot size={16} color="#ffffff"/>
      </div>
      <div style={{ padding:'14px 18px', background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'4px 18px 18px 18px', display:'flex', gap:6, alignItems:'center', boxShadow:'var(--sh-xs)' }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ width:7, height:7, borderRadius:'50%', background:'var(--teal)', display:'inline-block', animation:`pulse 1.4s ease-in-out ${i*.2}s infinite` }}/>
        ))}
      </div>
    </div>
  );
}

export default function Chat() {
  const { isAuth } = useAuth();
  const [msgs, setMsgs]         = useState(INIT);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [lastDis, setLastDis]   = useState(null);
  const bottomRef = useRef(null);
  const textRef   = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs, loading]);

  useEffect(() => {
    if (!isAuth) return;
    api.get('/chat/history').then(r => {
      if (r.data.messages?.length) {
        setMsgs([...INIT, ...r.data.messages]);
        setLastDis(r.data.lastDisease);
      }
    }).catch(() => {});
  }, [isAuth]);

  const send = async (text = input) => {
    const msg = text.trim();
    if (!msg) return;
    setInput(''); textRef.current?.focus();
    setMsgs(p => [...p, { role:'user', text: msg, timestamp:new Date() }]);
    setLoading(true);
    try {
      const ctx = msgs.slice(-6).map(m => ({ role:m.role, text:m.text }));
      const { data } = await api.post('/chat', { message:msg, lang:'en', lastDisease:lastDis, context:ctx });
      setMsgs(p => [...p, { role:'bot', text:data.response.text, type:data.response.type, timestamp:new Date() }]);
    } catch {
      setMsgs(p => [...p, { role:'bot', text:'⚠️ Something went wrong. Please try again.', timestamp:new Date() }]);
    } finally { setLoading(false); }
  };

  const clear = async () => {
    setMsgs(INIT);
    if (isAuth) await api.delete('/chat/history').catch(() => {});
    toast.success('Chat cleared');
  };

  const isFresh = msgs.length <= 1;

  return (
    <div style={{ display:'flex', height:'calc(100vh - 60px)', overflow:'hidden', width:'100%' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0, background:'var(--bg)' }}>
        
        {/* Top bar */}
        <div style={{
          padding:'14px 24px', borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', gap:12, flexShrink:0,
          background:'var(--bg-2)',
        }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 8px var(--green)', animation:'pulse 2s ease-in-out infinite' }}/>
            <div>
              <span style={{ fontFamily:'var(--f-display)', fontWeight:800, fontSize:'.95rem', color:'var(--t1)' }}>MediBot</span>
              <span style={{ color:'var(--teal)', fontSize:'.75rem', marginLeft:8, fontWeight:700, background:'var(--teal-dim)', padding:'2px 8px', borderRadius:4 }}>Gemini AI Active</span>
            </div>
          </div>
          <button onClick={clear} className="btn btn-ghost btn-sm" style={{ height:32 }} title="Clear chat"><Trash2 size={14}/></button>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'2rem' }}>
          {/* Welcome + Quick prompts */}
          {isFresh && (
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }} style={{ textAlign:'center', paddingTop:'1.5rem', maxWidth:820, margin:'0 auto 3.5rem auto' }}>
              <div style={{ width:68, height:68, borderRadius:20, background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', boxShadow:'0 6px 20px rgba(16,185,129,0.18)' }}>
                <Stethoscope size={32} color="#ffffff"/>
              </div>
              <h2 style={{ fontFamily:'var(--f-display)', fontWeight:800, fontSize:'1.6rem', marginBottom:10, color:'var(--t1)' }}>How can I help you today?</h2>
              <p style={{ color:'var(--t2)', fontSize:'.9rem', marginBottom:'2rem', fontWeight:500 }}>Ask anything about symptoms, medicines, health metrics, or wellness advice.</p>
              
              {/* Center the welcome area with suggested question chips in a 2-column grid */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, textAlign:'left', maxWidth:720, margin:'0 auto' }}>
                {PROMPTS.map((p, idx) => {
                  const isLastOdd = idx === PROMPTS.length - 1 && PROMPTS.length % 2 !== 0;
                  return (
                    <button key={p} onClick={() => send(p)} style={{
                      padding:'14px 20px', borderRadius:99,
                      background:'var(--bg-2)',
                      border:'1px solid var(--border)',
                      color:'var(--t1)', fontSize:'.85rem', cursor:'pointer',
                      transition:'all 0.2s ease', textAlign:'left', lineHeight:1.5,
                      fontWeight:600,
                      boxShadow:'var(--sh-xs)',
                      display:'flex',
                      alignItems:'center',
                      gap:8,
                      gridColumn: isLastOdd ? 'span 2' : 'auto',
                      justifyContent: isLastOdd ? 'center' : 'flex-start'
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.background='var(--teal-dim)';e.currentTarget.style.borderColor='var(--teal)';e.currentTarget.style.color='var(--teal)';e.currentTarget.style.transform='scale(1.02)';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='var(--bg-2)';e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--t1)';e.currentTarget.style.transform='none';}}
                    >
                      <Sparkles size={13} style={{ color:'var(--purple)', flexShrink:0 }}/>
                      <span style={{ overflow:'hidden', textOverflow:'ellipsis' }}>{p}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {msgs.map((m, i) => <Bubble key={i} msg={m}/>)}
          {loading && <TypingDots/>}
          <div ref={bottomRef}/>
        </div>

        {/* Input area */}
        <div style={{ padding:'1.25rem 2rem 1.5rem', borderTop:'1px solid var(--border)', background:'var(--bg-2)', flexShrink:0 }}>
          <div style={{
            maxWidth: 820,
            margin: '0 auto',
            display:'flex', gap:10, alignItems:'flex-end',
            background:'var(--bg-3)',
            border:'1px solid var(--border)',
            borderRadius:16, padding:'8px 10px 8px 16px',
            transition:'border-color .2s, box-shadow .2s',
          }}
          onFocusCapture={e => { e.currentTarget.style.borderColor='var(--teal)'; e.currentTarget.style.boxShadow='0 0 0 3px var(--teal-dim)'; }}
          onBlurCapture={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; }}
          >
            <textarea ref={textRef} value={input} onChange={e => setInput(e.target.value)} rows={1}
              onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask MediBot anything about your health… (Enter to send)"
              style={{ flex:1, background:'none', border:'none', color:'var(--t1)', padding:'6px 4px', fontSize:'.92rem', resize:'none', maxHeight:140, outline:'none', lineHeight:1.65, fontWeight:500 }}
            />
            <button onClick={() => send()} style={{
              background: input.trim() ? 'linear-gradient(135deg,var(--teal),var(--purple))' : 'rgba(0,0,0,.04)',
              border:'none', borderRadius:11, padding:'9px 12px',
              color: input.trim() ? '#ffffff' : 'var(--t3)',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', transition:'var(--t)', flexShrink:0,
              boxShadow: input.trim() ? '0 4px 14px rgba(16,185,129,.28)' : 'none',
            }} disabled={loading || !input.trim()}>
              {loading ? <Loader2 size={17} style={{ animation:'_spin .75s linear infinite' }}/> : <Send size={17}/>}
            </button>
          </div>
          
          {/* Footer Disclaimer Badges */}
          <div style={{ display:'flex', justifyContent:'center', marginTop:10, gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <span className="badge badge-teal" style={{ textTransform:'none', padding:'4px 10px', fontSize:'.65rem', fontWeight:700 }}>
              MediBot Health AI
            </span>
            <span style={{ fontSize:'.7rem', color:'var(--t3)', fontWeight:600 }}>
              Provides health education only · Always consult a licensed professional
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
