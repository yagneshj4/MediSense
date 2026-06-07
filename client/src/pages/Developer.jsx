import { motion } from 'framer-motion';
import { GitBranch, Link2, ExternalLink, Code2, Brain, Cpu, Layers, Activity } from 'lucide-react';

const skills = [
  { name:'MERN Stack',        level:95, color:'var(--teal)'   },
  { name:'Python / ML',       level:88, color:'var(--purple)' },
  { name:'Gemini AI / LLMs',  level:82, color:'var(--green)'  },
  { name:'Cloud Deployment',  level:78, color:'var(--orange)' },
  { name:'System Design',     level:85, color:'#ec4899'       },
];

function Bar({ name, level, color }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.82rem', marginBottom:6 }}>
        <span style={{ color:'var(--t1)', fontWeight:500 }}>{name}</span>
        <span style={{ color, fontWeight:700 }}>{level}%</span>
      </div>
      <div className="progress">
        <motion.div initial={{ width:0 }} whileInView={{ width:`${level}%` }} viewport={{ once:true }} transition={{ duration:1.1, delay:.1, ease:[.25,.46,.45,.94] }}
          className="progress-fill" style={{ background:`linear-gradient(90deg,${color}88,${color})` }} />
      </div>
    </div>
  );
}

export default function Developer() {
  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:'2.5rem' }}>
        <span className="badge badge-purple" style={{ marginBottom:12, display:'inline-flex' }}>Developer</span>
        <h1 className="h2">Meet the <span className="grad">Builder</span></h1>
      </motion.div>

      {/* Profile card */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0, transition:{ delay:.1 } }}
        className="glass" style={{ padding:'2.5rem', marginBottom:'1.5rem', display:'flex', gap:'2rem', flexWrap:'wrap', alignItems:'flex-start', background:'linear-gradient(135deg,rgba(0,212,255,.035),rgba(139,92,246,.05))', borderColor:'rgba(0,212,255,.1)' }}>
        {/* Avatar */}
        <div style={{ position:'relative', flexShrink:0 }}>
          <div style={{ width:110, height:110, borderRadius:26, background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.8rem' }}>
            👨‍💻
          </div>
          <div style={{ position:'absolute', bottom:-4, right:-4, width:22, height:22, borderRadius:'50%', background:'var(--green)', border:'3px solid var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:'.55rem', fontWeight:800, color:'#060b17' }}>✓</span>
          </div>
        </div>

        <div style={{ flex:1, minWidth:240 }}>
          <h2 style={{ fontFamily:'var(--f-display)', fontSize:'1.8rem', fontWeight:800, marginBottom:4 }}>Yallapu Yagnesh</h2>
          <p style={{ color:'var(--teal)', fontWeight:600, fontSize:'.9rem', marginBottom:'1rem' }}>
            Full-Stack Developer · AI/ML Engineer
          </p>
          <p style={{ color:'var(--t2)', lineHeight:1.8, fontSize:'.88rem', marginBottom:'1.5rem', maxWidth:'55ch' }}>
            Passionate about building production-grade, AI-powered healthcare applications using MERN stack + Python ML. Specializes in integrating machine learning with modern JavaScript frontends, creating intelligent user experiences.
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:9 }}>
            <a href="https://github.com/yagneshj4/MediSense-AI" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              <GitBranch size={14}/> GitHub Repo
            </a>
            <a href="https://www.linkedin.com/in/your-profile" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              <Link2 size={14}/> LinkedIn
            </a>
            <a href="https://medi-assist.onrender.com" target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
              <ExternalLink size={14}/> Live Demo
            </a>
          </div>
        </div>
      </motion.div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
        {/* Skills */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0, transition:{ delay:.2 } }} className="glass" style={{ padding:'1.75rem' }}>
          <h2 style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:'1rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:8 }}>
            <Activity size={18} style={{ color:'var(--teal)' }}/> Core Skills
          </h2>
          {skills.map(s => <Bar key={s.name} {...s} />)}
        </motion.div>

        {/* Expertise tags */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0, transition:{ delay:.28 } }} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          {[
            { icon: Code2,  color:'var(--teal)',   title:'Frontend',   tags:['React 18','Vite','Framer Motion','TypeScript','CSS3'] },
            { icon: Cpu,    color:'var(--purple)', title:'Backend',    tags:['Node.js','Express','JWT','Mongoose','Python','Flask'] },
            { icon: Brain,  color:'var(--green)',  title:'AI / ML',   tags:['Scikit-learn','Gemini AI','SVM','NLP','Pandas'] },
            { icon: Layers, color:'var(--orange)', title:'DevOps',    tags:['Render','MongoDB Atlas','Docker','Git','REST APIs'] },
          ].map(({ icon: Icon, color, title, tags }) => (
            <div key={title} className="glass" style={{ padding:'1.25rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:12 }}>
                <div className="icon-box" style={{ width:34, height:34, borderRadius:9, background:`${color}15` }}>
                  <Icon size={16} style={{ color }}/>
                </div>
                <span style={{ fontWeight:700, fontSize:'.88rem' }}>{title}</span>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {tags.map(t => <span key={t} className="chip chip-gray" style={{ fontSize:'.72rem' }}>{t}</span>)}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
