import { useState, useEffect, useRef } from "react";

const G = "-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif";
const C = {
  bg:"#F2F2F7", card:"#FFFFFF", card2:"#F2F2F7",
  t1:"#1C1C1E", t2:"#3A3A3C", t3:"#8E8E93", t4:"#C7C7CC", sep:"#E5E5EA",
  blue:"#007AFF", mint:"#34C759", orange:"#FF9500",
  red:"#FF3B30", purple:"#5856D6", yellow:"#FFCC00", pink:"#FF2D55",
};
const sh = "0 1px 8px rgba(0,0,0,0.06),0 0 0 0.5px rgba(0,0,0,0.04)";
const shM = "0 4px 20px rgba(0,0,0,0.09),0 0 0 0.5px rgba(0,0,0,0.04)";

const SCH=[
  {id:1,s:"09:00",e:"10:00",task:"Breakfast & Coffee",type:"coffee",icon:"☕",dur:60,sub:null},
  {id:2,s:"10:00",e:"12:00",task:"Study — UI/UX",type:"study",icon:"🎨",dur:120,sub:"UI/UX"},
  {id:3,s:"12:00",e:"13:00",task:"Study — CMMS",type:"study",icon:"⚙️",dur:60,sub:"CMMS"},
  {id:4,s:"13:00",e:"13:30",task:"Bath & Refresh",type:"personal",icon:"🚿",dur:30,sub:null},
  {id:5,s:"13:30",e:"14:15",task:"Gaming",type:"gaming",icon:"🎮",dur:45,sub:null},
  {id:6,s:"14:15",e:"15:30",task:"Study — CMMS",type:"study",icon:"⚙️",dur:75,sub:"CMMS"},
  {id:7,s:"15:30",e:"16:15",task:"Afternoon Coffee",type:"coffee",icon:"☕",dur:45,sub:null},
  {id:8,s:"16:15",e:"17:15",task:"Outdoor Walk",type:"personal",icon:"🚶",dur:60,sub:null},
  {id:9,s:"17:15",e:"19:15",task:"Study — UI/UX",type:"study",icon:"🎨",dur:120,sub:"UI/UX"},
  {id:10,s:"19:15",e:"20:00",task:"Gaming",type:"gaming",icon:"🎮",dur:45,sub:null},
  {id:11,s:"21:00",e:"22:00",task:"GF Call ♥",type:"personal",icon:"💕",dur:60,sub:null},
  {id:12,s:"23:00",e:"24:00",task:"Wind Down",type:"rest",icon:"🌙",dur:60,sub:null},
];
const TC={study:C.blue,rest:C.mint,personal:C.pink,gaming:C.purple,coffee:C.orange};
const tCol=t=>TC[t]||C.t3;
const toMin=t=>{const[h,m]=t.split(":").map(Number);return h*60+m};
const fmtS=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const fmtT=d=>`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
const todayStr=()=>new Date().toISOString().split("T")[0];
const START=new Date(2026,3,18);
const DAY_N=Math.max(1,Math.min(30,Math.floor((new Date()-START)/86400000)+1));
const calcPri=t=>{
  const i={low:1,medium:2,high:3}[t.impact||"medium"];
  const u={low:1,medium:2,high:3}[t.urgency||"medium"];
  const e={low:1.5,medium:1.0,high:0.6}[t.effort||"medium"];
  return +(i*u*e).toFixed(1);
};
const DEF_GOALS=[
  {id:1,title:"Master UI/UX Design",icon:"🎨",color:C.blue,
   projects:[{id:11,title:"30-Day Study Program",tasks:[
     {id:101,title:"Daily UI/UX study session",done:false,impact:"high",urgency:"high",effort:"medium"},
     {id:102,title:"Build portfolio project",done:false,impact:"high",urgency:"medium",effort:"high"}]}]},
  {id:2,title:"CMMS Certification",icon:"⚙️",color:C.orange,
   projects:[{id:21,title:"Module Completion",tasks:[
     {id:201,title:"Finish CMMS Module 3",done:false,impact:"high",urgency:"medium",effort:"medium"},
     {id:202,title:"Practice exam questions",done:false,impact:"medium",urgency:"low",effort:"low"}]}]},
];
const PHASES=[
  {w:1,r:[1,7],  title:"Foundations",col:C.blue},
  {w:2,r:[8,14], title:"Stamina",    col:C.orange},
  {w:3,r:[15,21],title:"Peak Perf.", col:C.red},
  {w:4,r:[22,30],title:"Synthesis",  col:C.mint},
];

export default function App() {
  const [now,setNow]     = useState(new Date());
  const [tab,setTab]     = useState("today");
  const [pMode,setPMode] = useState("focus");
  const [pSecs,setPSecs] = useState(25*60);
  const [pRun,setPRun]   = useState(false);
  const [pCnt,setPCnt]   = useState(0);
  const [checks,setChecks]= useState({});
  const [goals,setGoals] = useState(DEF_GOALS);
  const [notes,setNotes] = useState([]);
  const [noteIn,setNoteIn]= useState("");
  const [noteTag,setNoteTag]=useState("study");
  const [energy,setEnergy]= useState({});
  const [habits,setHabits]= useState({});
  const [pts,setPts]     = useState(0);
  const [streak,setStreak]= useState(0);
  const [todos,setTodos] = useState([{id:1,text:"Review UI/UX notes",done:false},{id:2,text:"Prep tomorrow's schedule",done:false}]);
  const [todoIn,setTodoIn]= useState("");
  const pRef=useRef(); const tid=todayStr();

 useEffect(() => {
    const ld = (k, fn, def) => {
      try {
        const r = window.localStorage.getItem(k);
        fn(r ? JSON.parse(r) : def);
      } catch (e) {
        fn(def);
      }
    };
    ld(`ck:${tid}`, setChecks, {});
    ld("goals2", setGoals, DEF_GOALS);
    ld("notes2", setNotes, []);
    ld("energy2", setEnergy, {});
    ld("habits2", setHabits, {});
    ld("pts2", setPts, 0);
    ld("streak2", setStreak, 0);
    ld("todos2", setTodos, [{ id: 1, text: "Review UI/UX notes", done: false }]);
  }, []);

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t);},[]);
  useEffect(()=>{
    if(pRun){
      pRef.current=setInterval(()=>setPSecs(s=>{
        if(s<=1){clearInterval(pRef.current);setPRun(false);if(pMode==="focus"){setPCnt(c=>c+1);addPts(15);}return 0;}
        return s-1;
      }),1000);
    }else clearInterval(pRef.current);
    return()=>clearInterval(pRef.current);
  },[pRun,pMode]);

  const sv=(k,v)=>window.storage.set(k,JSON.stringify(v)).catch(()=>{});
  const addPts=n=>setPts(p=>{const np=p+n;sv("pts2",np);return np;});
  const togCk=id=>{const n={...checks,[id]:!checks[id]};setChecks(n);sv(`ck:${tid}`,n);if(!checks[id])addPts(10);};
  const togTask=(gid,pid,tsk)=>{
    const ng=goals.map(g=>g.id!==gid?g:{...g,projects:g.projects.map(p=>p.id!==pid?p:{
      ...p,tasks:p.tasks.map(t=>t.id!==tsk?t:{...t,done:!t.done})})});
    const old=goals.find(g=>g.id===gid)?.projects.find(p=>p.id===pid)?.tasks.find(t=>t.id===tsk);
    if(old&&!old.done)addPts(10);
    setGoals(ng);sv("goals2",ng);
  };
  const addNote=()=>{
    if(!noteIn.trim())return;
    const n=[{id:Date.now(),text:noteIn.trim(),tag:noteTag,date:tid},...notes];
    setNotes(n);sv("notes2",n);setNoteIn("");addPts(3);
  };
  const logEn=(p,v)=>{const n={...energy,[tid]:{...(energy[tid]||{}),[p]:v}};setEnergy(n);sv("energy2",n);};
  const togHb=d=>{const n={...habits,[d]:!habits[d]};setHabits(n);sv("habits2",n);if(!habits[d])addPts(5);};
  const swPom=m=>{setPMode(m);setPSecs({focus:25*60,short:5*60,long:15*60}[m]);setPRun(false);};
  const addTodo=()=>{if(!todoIn.trim())return;const n=[...todos,{id:Date.now(),text:todoIn.trim(),done:false}];setTodos(n);sv("todos2",n);setTodoIn("");};
  const togTodo=id=>{const n=todos.map(t=>t.id===id?{...t,done:!t.done}:t);setTodos(n);sv("todos2",n);if(todos.find(t=>t.id===id&&!t.done))addPts(10);};
  const rmTodo=id=>{const n=todos.filter(t=>t.id!==id);setTodos(n);sv("todos2",n);};

  const curMin=now.getHours()*60+now.getMinutes();
  const curB=SCH.find(b=>{const s=toMin(b.s),e=b.e==="24:00"?1440:toMin(b.e);return curMin>=s&&curMin<e;});
  const nxtB=curB?SCH[SCH.indexOf(curB)+1]||null:null;
  const bProg=curB?Math.min(100,Math.round((curMin-toMin(curB.s))/curB.dur*100)):0;
  const ckDone=SCH.filter(b=>checks[b.id]).length;
  const ckPct=Math.round(ckDone/SCH.length*100);
  const pDur={focus:25*60,short:5*60,long:15*60}[pMode];
  const pProg=1-pSecs/pDur;
  const pCol=pMode==="focus"?C.blue:pMode==="short"?C.mint:C.purple;
  const R=46; const circ=2*Math.PI*R;
  const allTasks=goals.flatMap(g=>g.projects.flatMap(p=>p.tasks.map(t=>({...t,goalTitle:g.title,goalColor:g.color,gid:g.id,pid:p.id}))));
  const top3=allTasks.filter(t=>!t.done).map(t=>({...t,score:calcPri(t)})).sort((a,b)=>b.score-a.score).slice(0,3);

  // Style helpers
  const card=(e={})=>({background:C.card,borderRadius:18,boxShadow:sh,padding:16,...e});
  const pill=(c,bg)=>({background:bg||`${c}18`,color:c,borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:600,display:"inline-block",lineHeight:"18px"});
  const seclbl=(c=C.t3)=>({fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:c,marginBottom:10,display:"block"});
  const inpStyle={background:C.bg,border:"none",borderRadius:10,padding:"9px 12px",color:C.t1,fontSize:13,fontFamily:G,outline:"none",width:"100%",boxSizing:"border-box"};
  const acBtn=(c=C.blue,e={})=>({background:c,color:"#fff",border:"none",borderRadius:10,padding:"9px 16px",cursor:"pointer",fontFamily:G,fontSize:13,fontWeight:600,...e});

  // ── HEADER ────────────────────────────────────────────────
  const Header=()=>(
    <div style={{background:C.card,borderBottom:`1px solid ${C.sep}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginRight:6}}>
        <div style={{width:10,height:10,background:C.blue,borderRadius:"50%"}}/>
        <span style={{fontWeight:700,fontSize:15,color:C.t1,letterSpacing:"-0.3px"}}>PPOS</span>
        <span style={{fontSize:11,color:C.t4,fontWeight:400,marginLeft:2}}>Productivity OS</span>
      </div>
      <div style={{width:1,height:22,background:C.sep}}/>
      <div style={{flex:1,display:"flex",alignItems:"center",gap:8,minWidth:0}}>
        <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,
          background:curB?tCol(curB.type):C.t4,boxShadow:curB?`0 0 6px ${tCol(curB.type)}`:"none"}}/>
        <div style={{minWidth:0,flex:1}}>
          <div style={{fontSize:11,color:C.t3,fontWeight:500}}>NOW ACTIVE</div>
          <div style={{fontSize:13,fontWeight:600,color:curB?tCol(curB.type):C.t3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
            {curB?`${curB.icon} ${curB.task}`:"Outside schedule"}
          </div>
        </div>
        {curB&&<div style={{flex:1,maxWidth:140}}>
          <div style={{height:2.5,background:C.sep,borderRadius:2,overflow:"hidden"}}>
            <div style={{width:`${bProg}%`,height:"100%",background:tCol(curB.type),transition:"width 30s linear",borderRadius:2}}/>
          </div>
          <div style={{fontSize:9,color:C.t4,marginTop:2}}>{bProg}% elapsed</div>
        </div>}
        {nxtB&&<>
          <div style={{width:1,height:24,background:C.sep}}/>
          <div style={{opacity:0.7,flexShrink:0}}>
            <div style={{fontSize:9,color:C.t4}}>NEXT</div>
            <div style={{fontSize:12,fontWeight:500,color:C.t2,whiteSpace:"nowrap"}}>{nxtB.icon} {nxtB.task} · {nxtB.s}</div>
          </div>
        </>}
      </div>
      <div style={{display:"flex",gap:6,flexShrink:0}}>
        <div style={{padding:"6px 10px",background:C.bg,borderRadius:10,textAlign:"center"}}>
          <div style={{fontSize:15,fontWeight:700,color:C.t1,letterSpacing:"-0.5px",fontVariantNumeric:"tabular-nums"}}>
            {fmtT(now)}<span style={{fontSize:10,color:C.t4,fontWeight:400}}>:{String(now.getSeconds()).padStart(2,"0")}</span>
          </div>
          <div style={{fontSize:9,color:C.t4,fontWeight:500}}>Day {DAY_N}/30</div>
        </div>
        {[[`🍅 ${pCnt}`,"Poms",C.blue],[`${ckPct}%`,"Done",C.mint],[`⭐ ${pts}`,"Pts",C.yellow]].map(([v,l,c])=>(
          <div key={l} style={{padding:"6px 10px",background:C.bg,borderRadius:10,textAlign:"center"}}>
            <div style={{fontSize:14,fontWeight:700,color:c,lineHeight:1.2}}>{v}</div>
            <div style={{fontSize:9,color:C.t4,fontWeight:500}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── NAV ───────────────────────────────────────────────────
  const TABS=[["today","Today"],["goals","Goals"],["notes","Notes"],["energy","Energy"],["habits","Habits"],["weekly","Weekly"]];
  const Nav=()=>(
    <div style={{background:C.card,borderBottom:`1px solid ${C.sep}`,padding:"0 16px",display:"flex",overflowX:"auto"}}>
      {TABS.map(([id,lbl])=>(
        <button key={id} onClick={()=>setTab(id)} style={{
          padding:"11px 14px",border:"none",borderBottom:tab===id?`2px solid ${C.blue}`:"2px solid transparent",
          background:"none",cursor:"pointer",fontFamily:G,fontSize:13,
          fontWeight:tab===id?600:400,color:tab===id?C.blue:C.t3,
          marginBottom:-1,whiteSpace:"nowrap",transition:"color .12s"
        }}>{lbl}</button>
      ))}
    </div>
  );

  // ── TODAY VIEW ────────────────────────────────────────────
  const TodayView=()=>(
    <div style={{padding:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>

      {/* Pomodoro */}
      <div style={card()}>
        <span style={seclbl(C.blue)}>Focus Timer</span>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <svg width={108} height={108} style={{flexShrink:0}}>
            <circle cx={54} cy={54} r={R} stroke={C.sep} strokeWidth={5.5} fill="none"/>
            <circle cx={54} cy={54} r={R} stroke={pCol} strokeWidth={5.5} fill="none"
              strokeDasharray={circ} strokeDashoffset={circ*(1-pProg)}
              strokeLinecap="round" transform="rotate(-90 54 54)"
              style={{transition:"stroke-dashoffset 1s linear",filter:`drop-shadow(0 0 4px ${pCol}66)`}}/>
            <text x={54} y={50} textAnchor="middle" fill={C.t1} fontSize={17} fontFamily={G} fontWeight="700"
              style={{fontVariantNumeric:"tabular-nums"}}>{fmtS(pSecs)}</text>
            <text x={54} y={65} textAnchor="middle" fill={C.t3} fontSize={8} fontFamily={G} fontWeight="600" letterSpacing="1.5">{pMode.toUpperCase()}</text>
            {Array.from({length:8}).map((_,i)=>{
              const a=(i/8)*Math.PI*2-Math.PI/2;
              return <circle key={i} cx={54+54*Math.cos(a)} cy={54+54*Math.sin(a)} r={2.5} fill={i<pCnt%8?pCol:C.sep}/>;
            })}
          </svg>
          <div style={{flex:1}}>
            {curB?.sub&&<div style={{...pill(tCol(curB.type)),marginBottom:8}}>{curB.icon} {curB.sub}</div>}
            <div style={{display:"flex",gap:3,marginBottom:8}}>
              {[["focus","25m",C.blue],["short","5m",C.mint],["long","15m",C.purple]].map(([m,d,c])=>(
                <button key={m} onClick={()=>swPom(m)} style={{
                  flex:1,padding:"5px 2px",background:pMode===m?c:C.bg,
                  color:pMode===m?"#fff":C.t3,border:"none",borderRadius:8,cursor:"pointer",fontFamily:G,fontSize:10,fontWeight:600
                }}>{d}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:5}}>
              <button onClick={()=>setPRun(!pRun)} style={{...acBtn(pCol,{flex:2,padding:"10px 0"})}}>{pRun?"⏸ Pause":"▶ Start"}</button>
              <button onClick={()=>{setPRun(false);setPSecs(pDur);}} style={{
                flex:1,padding:"10px 0",background:C.bg,color:C.t3,border:"none",borderRadius:10,cursor:"pointer",fontFamily:G,fontSize:14
              }}>↺</button>
            </div>
            <div style={{fontSize:10,color:C.t4,marginTop:6,textAlign:"center"}}>Session {Math.floor(pCnt/4)+1} · {pCnt%4}/4</div>
          </div>
        </div>
      </div>

      {/* Top 3 Tasks */}
      <div style={card()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{...seclbl(C.orange),marginBottom:0}}>Top 3 Priority</span>
          <span style={pill(C.orange)}>⚡ Impact × Urgency ÷ Effort</span>
        </div>
        {top3.length===0
          ? <div style={{textAlign:"center",padding:"20px 0",color:C.mint,fontSize:13}}>✅ All tasks cleared!</div>
          : top3.map((t,i)=>(
            <div key={t.id} onClick={()=>togTask(t.gid,t.pid,t.id)} style={{
              display:"flex",alignItems:"center",gap:10,padding:"9px 10px",marginBottom:5,
              borderRadius:12,background:C.bg,cursor:"pointer"
            }}>
              <div style={{width:24,height:24,borderRadius:"50%",background:`${t.goalColor}18`,
                border:`1.5px solid ${t.goalColor}44`,display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:12,fontWeight:700,color:t.goalColor,flexShrink:0}}>{i+1}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:500,color:C.t1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.title}</div>
                <span style={pill(t.goalColor)}>{t.goalTitle}</span>
              </div>
              <div style={{...pill(t.score>=6?C.red:t.score>=4?C.orange:C.mint),flexShrink:0,fontWeight:700}}>⚡{t.score}</div>
            </div>
          ))
        }
      </div>

      {/* Daily Timeline */}
      <div style={{...card(),gridRow:"span 2",maxHeight:440,display:"flex",flexDirection:"column"}}>
        <span style={seclbl()}>Daily Timeline</span>
        <div style={{overflowY:"auto",flex:1}}>
          {SCH.map((b,i)=>{
            const isCur=curB?.id===b.id, isPast=curMin>(b.e==="24:00"?1440:toMin(b.e));
            const c=tCol(b.type);
            const prog=isCur?Math.min(100,Math.round((curMin-toMin(b.s))/b.dur*100)):0;
            return (
              <div key={b.id} style={{display:"flex",gap:8,marginBottom:2,opacity:isPast?.38:1}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:14,flexShrink:0}}>
                  <div style={{width:8,height:8,borderRadius:"50%",marginTop:13,flexShrink:0,
                    background:isCur?c:isPast?C.mint:C.sep,
                    border:`1.5px solid ${isCur?c:C.sep}`,
                    boxShadow:isCur?`0 0 6px ${c}99`:"none"}}/>
                  {i<SCH.length-1&&<div style={{width:1.5,flex:1,minHeight:8,background:isCur?`${c}30`:C.sep,margin:"2px 0"}}/>}
                </div>
                <div style={{flex:1,padding:"8px 10px",borderRadius:12,marginBottom:2,
                  background:isCur?`${c}0C`:C.bg,
                  border:isCur?`1px solid ${c}28`:"none",
                  position:"relative",overflow:"hidden"}}>
                  {isCur&&<div style={{position:"absolute",bottom:0,left:0,height:2,width:`${prog}%`,background:c,transition:"width 15s linear"}}/>}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:isCur?600:400,color:isCur?C.t1:C.t2}}>{b.icon} {b.task}</div>
                      {b.sub&&<div style={{fontSize:10,color:c,fontWeight:600,marginTop:1}}>{b.sub}</div>}
                    </div>
                    <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                      <div style={{fontSize:11,color:isCur?c:C.t4,fontWeight:isCur?600:400}}>{b.s}</div>
                      <div style={{fontSize:10,color:C.t4}}>{b.dur}m</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Checklist */}
      <div style={card()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{...seclbl(C.mint),marginBottom:0}}>Checklist</span>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:52,height:3,background:C.sep,borderRadius:2,overflow:"hidden"}}>
              <div style={{width:`${ckPct}%`,height:"100%",background:C.mint,borderRadius:2,transition:"width .3s"}}/>
            </div>
            <span style={{fontSize:11,color:C.mint,fontWeight:700}}>{ckPct}%</span>
          </div>
        </div>
        <div style={{maxHeight:150,overflowY:"auto"}}>
          {SCH.map(b=>(
            <div key={b.id} onClick={()=>togCk(b.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",
              borderBottom:`1px solid ${C.sep}`,cursor:"pointer",opacity:checks[b.id]?.38:1}}>
              <div style={{width:16,height:16,borderRadius:"50%",flexShrink:0,
                background:checks[b.id]?C.mint:C.bg,border:`1.5px solid ${checks[b.id]?C.mint:C.sep}`,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                {checks[b.id]&&<span style={{fontSize:8,color:"#fff"}}>✓</span>}
              </div>
              <span style={{flex:1,fontSize:11,color:C.t2,textDecoration:checks[b.id]?"line-through":"none"}}>{b.icon} {b.task}</span>
              <span style={{fontSize:10,color:C.t4}}>{b.s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Energy + Rewards */}
      <div style={card({padding:14})}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <span style={seclbl(C.orange)}>Energy Today</span>
            {[["morning","🌅"],["afternoon","☀️"],["evening","🌙"]].map(([p,icon])=>{
              const v=energy[tid]?.[p]||0;
              return (
                <div key={p} style={{marginBottom:8}}>
                  <div style={{fontSize:10,color:C.t3,marginBottom:4}}>{icon} {p}</div>
                  <div style={{display:"flex",gap:3}}>
                    {[1,2,3,4,5].map(n=>(
                      <div key={n} onClick={()=>logEn(p,n)} style={{
                        flex:1,height:18,borderRadius:4,cursor:"pointer",
                        background:n<=v?C.orange:`${C.orange}14`,transition:"background .12s"
                      }}/>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div>
            <span style={seclbl(C.yellow)}>Rewards</span>
            <div style={{textAlign:"center",padding:"4px 0"}}>
              <div style={{fontSize:26,marginBottom:2}}>⭐</div>
              <div style={{fontSize:20,fontWeight:700,color:C.t1,lineHeight:1}}>{pts}</div>
              <div style={{fontSize:9,color:C.t3,marginBottom:8}}>points</div>
              <div style={{fontSize:11,color:C.t2}}>🔥 {streak} day streak</div>
            </div>
            <div style={{background:`${C.yellow}0A`,borderRadius:10,padding:"7px 9px"}}>
              {[["Task ✓",10,C.mint],["Pomodoro",15,C.blue],["Habit",5,C.orange],["Note",3,C.purple]].map(([l,p,c])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.t3,marginBottom:2}}>
                  <span>{l}</span><span style={{color:c,fontWeight:600}}>+{p} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{borderTop:`1px solid ${C.sep}`,marginTop:10,paddingTop:10}}>
          <div style={{fontSize:10,fontWeight:600,color:C.t3,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:7}}>Quick Tasks</div>
          <div style={{display:"flex",gap:6,marginBottom:7}}>
            <input value={todoIn} onChange={e=>setTodoIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTodo()}
              placeholder="Add task..." style={{...inpStyle,flex:1,fontSize:11,padding:"6px 10px"}}/>
            <button onClick={addTodo} style={{...acBtn(C.blue,{padding:"6px 12px",fontSize:12})}}>+</button>
          </div>
          <div style={{maxHeight:90,overflowY:"auto"}}>
            {todos.map(t=>(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:`1px solid ${C.sep}`}}>
                <div onClick={()=>togTodo(t.id)} style={{width:14,height:14,borderRadius:"50%",flexShrink:0,cursor:"pointer",
                  background:t.done?C.mint:C.bg,border:`1.5px solid ${t.done?C.mint:C.sep}`,
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {t.done&&<span style={{fontSize:7,color:"#fff"}}>✓</span>}
                </div>
                <span style={{flex:1,fontSize:11,color:t.done?C.t4:C.t2,textDecoration:t.done?"line-through":"none"}}>{t.text}</span>
                <button onClick={()=>rmTodo(t.id)} style={{background:"none",border:"none",color:C.t4,cursor:"pointer",fontSize:13,padding:0,lineHeight:1}}>×</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── GOALS VIEW ────────────────────────────────────────────
  const GoalsView=()=>{
    const [expG,setExpG]=useState({1:true,2:true});
    const allT=goals.flatMap(g=>g.projects.flatMap(p=>p.tasks));
    const doneT=allT.filter(t=>t.done).length;
    return (
      <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
        <div style={card({padding:14,display:"flex",gap:0})}>
          {[[doneT,"Done",C.mint],[allT.length-doneT,"Active",C.blue],[goals.length,"Goals",C.purple],[`${Math.round(doneT/Math.max(allT.length,1)*100)}%`,"Progress",C.orange]].map(([v,l,c],i,a)=>(
            <div key={l} style={{flex:1,textAlign:"center",padding:"6px 0",borderRight:i<a.length-1?`1px solid ${C.sep}`:"none"}}>
              <div style={{fontSize:20,fontWeight:700,color:c}}>{v}</div>
              <div style={{fontSize:10,color:C.t3,fontWeight:600}}>{l}</div>
            </div>
          ))}
        </div>
        {goals.map(g=>{
          const gT=g.projects.flatMap(p=>p.tasks), gD=gT.filter(t=>t.done).length;
          const gPct=gT.length?Math.round(gD/gT.length*100):0;
          return (
            <div key={g.id} style={card()}>
              <div onClick={()=>setExpG(e=>({...e,[g.id]:!e[g.id]}))} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                <span style={{fontSize:22}}>{g.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.t1,marginBottom:4}}>{g.title}</div>
                  <div style={{height:3,background:C.sep,borderRadius:2,overflow:"hidden"}}>
                    <div style={{width:`${gPct}%`,height:"100%",background:g.color,borderRadius:2,transition:"width .4s"}}/>
                  </div>
                </div>
                <span style={pill(g.color)}>{gPct}%</span>
                <span style={{color:C.t4,fontSize:11}}>{expG[g.id]?"▲":"▼"}</span>
              </div>
              {expG[g.id]&&g.projects.map(p=>(
                <div key={p.id} style={{marginTop:12,paddingLeft:14,borderLeft:`2px solid ${g.color}25`}}>
                  <div style={{fontSize:11,fontWeight:600,color:C.t3,marginBottom:6}}>📁 {p.title}</div>
                  {p.tasks.map(t=>{
                    const sc=calcPri(t);
                    return (
                      <div key={t.id} onClick={()=>togTask(g.id,p.id,t.id)} style={{
                        display:"flex",alignItems:"center",gap:8,padding:"8px 10px",marginBottom:4,
                        borderRadius:12,background:t.done?`${C.mint}06`:C.bg,cursor:"pointer"
                      }}>
                        <div style={{width:17,height:17,borderRadius:"50%",flexShrink:0,
                          background:t.done?C.mint:C.bg,border:`1.5px solid ${t.done?C.mint:C.sep}`,
                          display:"flex",alignItems:"center",justifyContent:"center"}}>
                          {t.done&&<span style={{fontSize:8,color:"#fff"}}>✓</span>}
                        </div>
                        <span style={{flex:1,fontSize:12,color:t.done?C.t4:C.t1,textDecoration:t.done?"line-through":"none"}}>{t.title}</span>
                        <div style={{display:"flex",gap:3,flexShrink:0}}>
                          <span style={pill(sc>=6?C.red:sc>=4?C.orange:C.mint)}>⚡{sc}</span>
                          {[["I",t.impact],["U",t.urgency]].map(([k,v])=>(
                            <span key={k} style={pill({high:C.red,medium:C.orange,low:C.mint}[v||"medium"])}>{k}:{v?.[0]?.toUpperCase()||"M"}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  // ── NOTES VIEW ────────────────────────────────────────────
  const TAGS=["study","idea","task","review","personal"];
  const TAGC={study:C.blue,idea:C.yellow,task:C.mint,review:C.purple,personal:C.pink};
  const NotesView=()=>{
    const [filter,setFilter]=useState("all");
    const shown=filter==="all"?notes:notes.filter(n=>n.tag===filter);
    return (
      <div style={{padding:12}}>
        <div style={{...card(),marginBottom:10}}>
          <span style={seclbl()}>Quick Capture</span>
          <textarea value={noteIn} onChange={e=>setNoteIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&e.metaKey&&addNote()}
            placeholder="Capture a thought, idea, or insight…"
            style={{...inpStyle,minHeight:64,resize:"none",display:"block",marginBottom:10}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {TAGS.map(t=>(
                <button key={t} onClick={()=>setNoteTag(t)} style={{
                  padding:"4px 10px",borderRadius:20,border:"none",cursor:"pointer",fontFamily:G,fontSize:11,fontWeight:600,
                  background:noteTag===t?TAGC[t]:C.bg,color:noteTag===t?"#fff":C.t3,transition:"background .1s"
                }}>{t}</button>
              ))}
            </div>
            <button onClick={addNote} style={acBtn(C.blue,{padding:"8px 18px"})}>Save</button>
          </div>
        </div>
        <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
          {["all",...TAGS].map(t=>(
            <button key={t} onClick={()=>setFilter(t)} style={{
              padding:"4px 12px",borderRadius:20,border:"none",cursor:"pointer",fontFamily:G,
              fontSize:11,fontWeight:600,background:filter===t?C.blue:C.card,
              color:filter===t?"#fff":C.t3,boxShadow:sh,transition:"background .1s"
            }}>{t} {t!=="all"&&`(${notes.filter(n=>n.tag===t).length})`}</button>
          ))}
        </div>
        {shown.length===0
          ? <div style={{textAlign:"center",padding:40,color:C.t4,fontSize:13}}>No notes yet. Start capturing ideas!</div>
          : <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {shown.map(n=>(
                <div key={n.id} style={{...card({padding:14}),borderTop:`3px solid ${TAGC[n.tag]||C.blue}`}}>
                  <div style={{fontSize:13,color:C.t1,lineHeight:1.55,marginBottom:8}}>{n.text}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={pill(TAGC[n.tag]||C.blue)}>{n.tag}</span>
                    <span style={{fontSize:10,color:C.t4}}>{n.date}</span>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    );
  };

  // ── ENERGY VIEW ───────────────────────────────────────────
  const EnergyView=()=>{
    const last7=Array.from({length:7}).map((_,i)=>{
      const d=new Date(); d.setDate(d.getDate()-6+i);
      const k=d.toISOString().split("T")[0], e=energy[k]||{};
      const avg=([(e.morning||0),(e.afternoon||0),(e.evening||0)].reduce((a,b)=>a+b,0)/3);
      return {k,day:d.toLocaleDateString("en-US",{weekday:"short"}),avg:+avg.toFixed(1),e};
    });
    return (
      <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
        <div style={card()}>
          <span style={seclbl(C.orange)}>Log Today's Energy</span>
          {[["morning","🌅 Morning"],["afternoon","☀️ Afternoon"],["evening","🌙 Evening"]].map(([p,l])=>{
            const v=energy[tid]?.[p]||0;
            return (
              <div key={p} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:13,fontWeight:500,color:C.t2}}>{l}</span>
                  <span style={{fontSize:12,color:C.orange,fontWeight:700}}>{v}/5</span>
                </div>
                <div style={{display:"flex",gap:6}}>
                  {[1,2,3,4,5].map(n=>(
                    <div key={n} onClick={()=>logEn(p,n)} style={{
                      flex:1,height:30,borderRadius:10,cursor:"pointer",
                      background:n<=v?C.orange:`${C.orange}10`,
                      boxShadow:n<=v?`0 2px 8px ${C.orange}40`:"none",
                      transition:"background .12s",display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:13
                    }}>{n<=v?"⚡":""}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div style={card()}>
          <span style={seclbl(C.blue)}>7-Day Energy Pattern</span>
          <div style={{display:"flex",gap:6,alignItems:"flex-end",height:80,marginBottom:6}}>
            {last7.map(d=>(
              <div key={d.k} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{flex:1,width:"100%",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
                  <div style={{
                    height:`${Math.max(d.avg/5*100,d.avg?4:0)}%`,background:d.k===tid?C.orange:C.blue,
                    borderRadius:"4px 4px 0 0",transition:"height .4s",opacity:d.k===tid?1:0.5
                  }}/>
                </div>
                <div style={{fontSize:9,color:d.k===tid?C.orange:C.t4,fontWeight:d.k===tid?700:400}}>{d.day}</div>
              </div>
            ))}
          </div>
          <div style={{padding:"10px 12px",background:`${C.orange}08`,borderRadius:12,fontSize:12,color:C.t2}}>
            💡 Schedule your hardest study blocks during your peak energy period.
          </div>
        </div>
      </div>
    );
  };

  // ── HABITS VIEW ───────────────────────────────────────────
  const HabitsView=()=>{
    const total=Object.values(habits).filter(Boolean).length;
    return (
      <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{...card({padding:14}),display:"flex"}}>
          {[[total,"Days Done",C.mint],[streak,"Streak 🔥",C.orange],[30-total,"Days Left",C.blue],[`${Math.round(total/30*100)}%`,"Complete",C.purple]].map(([v,l,c],i,a)=>(
            <div key={l} style={{flex:1,textAlign:"center",padding:"6px 0",borderRight:i<a.length-1?`1px solid ${C.sep}`:"none"}}>
              <div style={{fontSize:20,fontWeight:700,color:c}}>{v}</div>
              <div style={{fontSize:10,color:C.t3,fontWeight:600}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={card()}>
          <span style={seclbl()}>30-Day Habit Grid · Apr 18 – May 17, 2026</span>
          <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:5}}>
            {Array.from({length:30}).map((_,i)=>{
              const day=i+1, d=new Date(2026,3,18+i);
              const isR=d.getDay()===0||d.getDay()===3;
              const isDone=habits[`d${day}`], isCur=day===DAY_N;
              const ph=PHASES[day<=7?0:day<=14?1:day<=21?2:3];
              return (
                <div key={day} onClick={()=>!isR&&togHb(`d${day}`)} style={{
                  aspectRatio:"1",borderRadius:8,display:"flex",flexDirection:"column",
                  alignItems:"center",justifyContent:"center",cursor:isR?"default":"pointer",
                  background:isDone?ph.col:isR?`${C.mint}08`:C.bg,
                  border:isCur?`2px solid ${C.t1}`:isDone?"none":`1px solid ${C.sep}`,
                  transition:"all .15s"
                }}>
                  <span style={{fontSize:9,fontWeight:700,color:isDone?"#fff":isCur?C.t1:C.t4}}>{day}</span>
                  {isR&&<span style={{fontSize:6}}>😴</span>}
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
            {PHASES.map(p=>(
              <div key={p.w} style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:8,height:8,background:p.col,borderRadius:3}}/>
                <span style={{fontSize:10,color:C.t3}}>W{p.w}: {p.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── WEEKLY VIEW ───────────────────────────────────────────
  const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const WSCH={Mon:{f:"UI/UX",c:C.blue,r:false},Tue:{f:"CMMS",c:C.orange,r:false},Wed:{f:"REST",c:C.mint,r:true},Thu:{f:"UI/UX",c:C.blue,r:false},Fri:{f:"CMMS",c:C.orange,r:false},Sat:{f:"MIX",c:C.purple,r:false},Sun:{f:"REST",c:C.mint,r:true}};
  const QS=["What went well this week?","What held me back?","What will I change?","What am I proud of?"];
  const WeeklyView=()=>{
    const [ref,setRef]=useState({});
    const curD=DAYS[(new Date().getDay()+6)%7];
    return (
      <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
        <div style={card()}>
          <span style={seclbl()}>Weekly Study Rotation</span>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6}}>
            {DAYS.map(d=>{
              const info=WSCH[d], isCur=d===curD;
              return (
                <div key={d} style={{borderRadius:12,padding:"9px 4px",textAlign:"center",
                  background:isCur?`${info.c}14`:info.r?`${C.mint}06`:C.bg,
                  border:isCur?`1.5px solid ${info.c}`:`1px solid ${C.sep}`}}>
                  <div style={{fontSize:11,fontWeight:600,color:isCur?info.c:C.t3,marginBottom:4}}>{d}</div>
                  {info.r
                    ? <div style={{fontSize:14}}>😴</div>
                    : <div style={{display:"flex",flexDirection:"column",gap:2}}>
                        {[0.5,0.75,1].map((o,i)=><div key={i} style={{height:3,background:info.c,borderRadius:1,opacity:o}}/>)}
                      </div>
                  }
                  <div style={{fontSize:9,color:isCur?info.c:C.t4,marginTop:4,fontWeight:600}}>{info.f}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={card()}>
          <span style={seclbl(C.purple)}>Weekly Review</span>
          {QS.map((q,i)=>(
            <div key={i} style={{marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:500,color:C.t2,marginBottom:5}}>💭 {q}</div>
              <textarea value={ref[i]||""} onChange={e=>setRef(r=>({...r,[i]:e.target.value}))}
                placeholder="Reflect…"
                style={{...inpStyle,minHeight:44,resize:"none",display:"block",fontSize:12}}/>
            </div>
          ))}
        </div>
        <div style={card()}>
          <span style={seclbl(C.mint)}>Week at a Glance</span>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {[[ckDone,"Tasks Done",C.mint],[pCnt,"Pomodoros 🍅",C.blue],[`${(pCnt*.42).toFixed(1)}h`,"Study Time",C.orange],[pts,"Points ⭐",C.yellow]].map(([v,l,c])=>(
              <div key={l} style={{padding:"10px 12px",background:C.bg,borderRadius:12,display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:4,height:28,background:c,borderRadius:2}}/>
                <div><div style={{fontSize:17,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:10,color:C.t3}}>{l}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{fontFamily:G,background:C.bg,minHeight:"100vh",color:C.t1}}>
      <style>{`*{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:${C.sep};border-radius:4px}
        ::-webkit-scrollbar-track{background:transparent}
        textarea,input{font-family:${G}}
        textarea::placeholder,input::placeholder{color:${C.t4}}
        button{font-family:${G}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}
      </style>
      <Header/>
      <Nav/>
      <div style={{height:"calc(100vh - 96px)",overflowY:"auto"}}>
        {tab==="today"  && <TodayView/>}
        {tab==="goals"  && <GoalsView/>}
        {tab==="notes"  && <NotesView/>}
        {tab==="energy" && <EnergyView/>}
        {tab==="habits" && <HabitsView/>}
        {tab==="weekly" && <WeeklyView/>}
      </div>
    </div>
  );
}