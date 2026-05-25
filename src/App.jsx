import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_USERNAME = "Marrolaz";
const ADMIN_PASSWORD = "Saralola";

const GROUPS = {
  A:["México","Sudáfrica","Corea del Sur","Chequia"],
  B:["Canadá","Bosnia y Herzegovina","Qatar","Suiza"],
  C:["Brasil","Marruecos","Haití","Escocia"],
  D:["Estados Unidos","Paraguay","Australia","Turquía"],
  E:["Alemania","Curazao","Costa de Marfil","Ecuador"],
  F:["Países Bajos","Japón","Suecia","Túnez"],
  G:["Bélgica","Egipto","Irán","Nueva Zelanda"],
  H:["España","Cabo Verde","Arabia Saudita","Uruguay"],
  I:["Francia","Senegal","Irak","Noruega"],
  J:["Argentina","Argelia","Austria","Jordania"],
  K:["Portugal","R.D. Congo","Uzbekistán","Colombia"],
  L:["Inglaterra","Croacia","Ghana","Panamá"],
};

const FLAGS = {
  "México":"🇲🇽","Sudáfrica":"🇿🇦","Corea del Sur":"🇰🇷","Chequia":"🇨🇿",
  "Canadá":"🇨🇦","Bosnia y Herzegovina":"🇧🇦","Qatar":"🇶🇦","Suiza":"🇨🇭",
  "Brasil":"🇧🇷","Marruecos":"🇲🇦","Haití":"🇭🇹","Escocia":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Estados Unidos":"🇺🇸","Paraguay":"🇵🇾","Australia":"🇦🇺","Turquía":"🇹🇷",
  "Alemania":"🇩🇪","Curazao":"🇨🇼","Costa de Marfil":"🇨🇮","Ecuador":"🇪🇨",
  "Países Bajos":"🇳🇱","Japón":"🇯🇵","Suecia":"🇸🇪","Túnez":"🇹🇳",
  "Bélgica":"🇧🇪","Egipto":"🇪🇬","Irán":"🇮🇷","Nueva Zelanda":"🇳🇿",
  "España":"🇪🇸","Cabo Verde":"🇨🇻","Arabia Saudita":"🇸🇦","Uruguay":"🇺🇾",
  "Francia":"🇫🇷","Senegal":"🇸🇳","Irak":"🇮🇶","Noruega":"🇳🇴",
  "Argentina":"🇦🇷","Argelia":"🇩🇿","Austria":"🇦🇹","Jordania":"🇯🇴",
  "Portugal":"🇵🇹","R.D. Congo":"🇨🇩","Uzbekistán":"🇺🇿","Colombia":"🇨🇴",
  "Inglaterra":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croacia":"🇭🇷","Ghana":"🇬🇭","Panamá":"🇵🇦",
};

const ALL_TEAMS = Object.values(GROUPS).flat();

// Points per phase: [winner, exact]
const PHASE_POINTS = {
  groups: [3, 3],
  r32:    [4, 4],
  r16:    [4, 4],
  qf:     [5, 5],
  sf:     [5, 5],
  "3rd":  [5, 5],
  final:  [7, 7],
};

// BsAs = UTC-4 during June/July 2026
const toBsAs = (isoUtc) => {
  const d = new Date(isoUtc);
  const ba = new Date(d.getTime() - 4*60*60*1000);
  const days=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  const months=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return {
    label:`${days[ba.getUTCDay()]} ${ba.getUTCDate()} ${months[ba.getUTCMonth()]}`,
    time:`${String(ba.getUTCHours()).padStart(2,"0")}:${String(ba.getUTCMinutes()).padStart(2,"0")}`,
  };
};

const GROUP_MATCHES = [
  {id:1,  phase:"groups",group:"A",home:"México",              away:"Sudáfrica",           date:"2026-06-11T20:00:00Z",venue:"Ciudad de México"},
  {id:2,  phase:"groups",group:"A",home:"Corea del Sur",       away:"Chequia",             date:"2026-06-12T03:00:00Z",venue:"Guadalajara"},
  {id:3,  phase:"groups",group:"B",home:"Canadá",              away:"Bosnia y Herzegovina",date:"2026-06-12T19:00:00Z",venue:"Toronto"},
  {id:4,  phase:"groups",group:"D",home:"Estados Unidos",      away:"Paraguay",            date:"2026-06-13T04:00:00Z",venue:"Los Ángeles"},
  {id:5,  phase:"groups",group:"B",home:"Qatar",               away:"Suiza",               date:"2026-06-13T19:00:00Z",venue:"San Francisco"},
  {id:6,  phase:"groups",group:"C",home:"Brasil",              away:"Marruecos",           date:"2026-06-13T23:00:00Z",venue:"Nueva York/NJ"},
  {id:7,  phase:"groups",group:"C",home:"Haití",               away:"Escocia",             date:"2026-06-14T02:00:00Z",venue:"Boston"},
  {id:8,  phase:"groups",group:"D",home:"Australia",           away:"Turquía",             date:"2026-06-14T04:00:00Z",venue:"Vancouver"},
  {id:9,  phase:"groups",group:"E",home:"Alemania",            away:"Curazao",             date:"2026-06-14T18:00:00Z",venue:"Houston"},
  {id:10, phase:"groups",group:"F",home:"Países Bajos",        away:"Japón",               date:"2026-06-14T21:00:00Z",venue:"Dallas"},
  {id:11, phase:"groups",group:"E",home:"Costa de Marfil",     away:"Ecuador",             date:"2026-06-15T00:00:00Z",venue:"Filadelfia"},
  {id:12, phase:"groups",group:"F",home:"Suecia",              away:"Túnez",               date:"2026-06-15T04:00:00Z",venue:"Monterrey"},
  {id:13, phase:"groups",group:"H",home:"España",              away:"Cabo Verde",          date:"2026-06-15T17:00:00Z",venue:"Atlanta"},
  {id:14, phase:"groups",group:"G",home:"Bélgica",             away:"Egipto",              date:"2026-06-16T00:00:00Z",venue:"Vancouver"},
  {id:15, phase:"groups",group:"H",home:"Arabia Saudita",      away:"Uruguay",             date:"2026-06-15T23:00:00Z",venue:"Miami"},
  {id:16, phase:"groups",group:"G",home:"Irán",                away:"Nueva Zelanda",       date:"2026-06-16T04:00:00Z",venue:"Los Ángeles"},
  {id:17, phase:"groups",group:"I",home:"Francia",             away:"Senegal",             date:"2026-06-16T20:00:00Z",venue:"Nueva York/NJ"},
  {id:18, phase:"groups",group:"I",home:"Irak",                away:"Noruega",             date:"2026-06-16T23:00:00Z",venue:"Boston"},
  {id:19, phase:"groups",group:"J",home:"Argentina",           away:"Argelia",             date:"2026-06-17T02:00:00Z",venue:"Kansas City"},
  {id:20, phase:"groups",group:"J",home:"Austria",             away:"Jordania",            date:"2026-06-17T07:00:00Z",venue:"San Francisco"},
  {id:21, phase:"groups",group:"K",home:"Portugal",            away:"R.D. Congo",          date:"2026-06-17T18:00:00Z",venue:"Houston"},
  {id:22, phase:"groups",group:"L",home:"Inglaterra",          away:"Croacia",             date:"2026-06-17T22:00:00Z",venue:"Dallas"},
  {id:23, phase:"groups",group:"L",home:"Ghana",               away:"Panamá",              date:"2026-06-18T00:00:00Z",venue:"Toronto"},
  {id:24, phase:"groups",group:"K",home:"Uzbekistán",          away:"Colombia",            date:"2026-06-18T04:00:00Z",venue:"Ciudad de México"},
  {id:25, phase:"groups",group:"A",home:"Chequia",             away:"Sudáfrica",           date:"2026-06-18T17:00:00Z",venue:"Atlanta"},
  {id:26, phase:"groups",group:"B",home:"Suiza",               away:"Bosnia y Herzegovina",date:"2026-06-18T22:00:00Z",venue:"Los Ángeles"},
  {id:27, phase:"groups",group:"B",home:"Canadá",              away:"Qatar",               date:"2026-06-19T01:00:00Z",venue:"Vancouver"},
  {id:28, phase:"groups",group:"A",home:"México",              away:"Corea del Sur",       date:"2026-06-19T03:00:00Z",venue:"Guadalajara"},
  {id:29, phase:"groups",group:"C",home:"Escocia",             away:"Marruecos",           date:"2026-06-20T00:00:00Z",venue:"Boston"},
  {id:30, phase:"groups",group:"D",home:"Estados Unidos",      away:"Australia",           date:"2026-06-19T22:00:00Z",venue:"Seattle"},
  {id:31, phase:"groups",group:"C",home:"Brasil",              away:"Haití",               date:"2026-06-20T02:00:00Z",venue:"Filadelfia"},
  {id:32, phase:"groups",group:"D",home:"Turquía",             away:"Paraguay",            date:"2026-06-20T07:00:00Z",venue:"San Francisco"},
  {id:33, phase:"groups",group:"F",home:"Países Bajos",        away:"Suecia",              date:"2026-06-20T18:00:00Z",venue:"Houston"},
  {id:34, phase:"groups",group:"E",home:"Alemania",            away:"Costa de Marfil",     date:"2026-06-20T21:00:00Z",venue:"Toronto"},
  {id:35, phase:"groups",group:"E",home:"Ecuador",             away:"Curazao",             date:"2026-06-21T01:00:00Z",venue:"Kansas City"},
  {id:36, phase:"groups",group:"F",home:"Túnez",               away:"Japón",               date:"2026-06-21T06:00:00Z",venue:"Monterrey"},
  {id:37, phase:"groups",group:"H",home:"España",              away:"Arabia Saudita",      date:"2026-06-21T17:00:00Z",venue:"Atlanta"},
  {id:38, phase:"groups",group:"G",home:"Bélgica",             away:"Irán",                date:"2026-06-22T00:00:00Z",venue:"Los Ángeles"},
  {id:39, phase:"groups",group:"H",home:"Uruguay",             away:"Cabo Verde",          date:"2026-06-21T23:00:00Z",venue:"Miami"},
  {id:40, phase:"groups",group:"G",home:"Nueva Zelanda",       away:"Egipto",              date:"2026-06-22T04:00:00Z",venue:"Vancouver"},
  {id:41, phase:"groups",group:"J",home:"Argentina",           away:"Austria",             date:"2026-06-22T18:00:00Z",venue:"Dallas"},
  {id:42, phase:"groups",group:"I",home:"Francia",             away:"Irak",                date:"2026-06-22T22:00:00Z",venue:"Filadelfia"},
  {id:43, phase:"groups",group:"I",home:"Noruega",             away:"Senegal",             date:"2026-06-23T01:00:00Z",venue:"Nueva York/NJ"},
  {id:44, phase:"groups",group:"J",home:"Jordania",            away:"Argelia",             date:"2026-06-23T06:00:00Z",venue:"San Francisco"},
  {id:45, phase:"groups",group:"K",home:"Portugal",            away:"Uzbekistán",          date:"2026-06-23T18:00:00Z",venue:"Houston"},
  {id:46, phase:"groups",group:"L",home:"Inglaterra",          away:"Ghana",               date:"2026-06-23T21:00:00Z",venue:"Boston"},
  {id:47, phase:"groups",group:"L",home:"Panamá",              away:"Croacia",             date:"2026-06-24T00:00:00Z",venue:"Toronto"},
  {id:48, phase:"groups",group:"K",home:"Colombia",            away:"R.D. Congo",          date:"2026-06-24T04:00:00Z",venue:"Guadalajara"},
  {id:49, phase:"groups",group:"B",home:"Suiza",               away:"Canadá",              date:"2026-06-24T20:00:00Z",venue:"Vancouver"},
  {id:50, phase:"groups",group:"B",home:"Bosnia y Herzegovina",away:"Qatar",               date:"2026-06-24T20:00:00Z",venue:"Seattle"},
  {id:51, phase:"groups",group:"C",home:"Escocia",             away:"Brasil",              date:"2026-06-24T23:00:00Z",venue:"Miami"},
  {id:52, phase:"groups",group:"C",home:"Marruecos",           away:"Haití",               date:"2026-06-24T23:00:00Z",venue:"Atlanta"},
  {id:53, phase:"groups",group:"A",home:"Chequia",             away:"México",              date:"2026-06-25T02:00:00Z",venue:"Ciudad de México"},
  {id:54, phase:"groups",group:"A",home:"Sudáfrica",           away:"Corea del Sur",       date:"2026-06-25T02:00:00Z",venue:"Monterrey"},
  {id:55, phase:"groups",group:"E",home:"Ecuador",             away:"Alemania",            date:"2026-06-25T21:00:00Z",venue:"Nueva York/NJ"},
  {id:56, phase:"groups",group:"E",home:"Curazao",             away:"Costa de Marfil",     date:"2026-06-25T21:00:00Z",venue:"Filadelfia"},
  {id:57, phase:"groups",group:"F",home:"Japón",               away:"Suecia",              date:"2026-06-26T01:00:00Z",venue:"Dallas"},
  {id:58, phase:"groups",group:"F",home:"Túnez",               away:"Países Bajos",        date:"2026-06-26T01:00:00Z",venue:"Kansas City"},
  {id:59, phase:"groups",group:"D",home:"Turquía",             away:"Estados Unidos",      date:"2026-06-26T04:00:00Z",venue:"Los Ángeles"},
  {id:60, phase:"groups",group:"D",home:"Paraguay",            away:"Australia",           date:"2026-06-26T04:00:00Z",venue:"San Francisco"},
  {id:61, phase:"groups",group:"I",home:"Noruega",             away:"Francia",             date:"2026-06-26T20:00:00Z",venue:"Boston"},
  {id:62, phase:"groups",group:"I",home:"Senegal",             away:"Irak",                date:"2026-06-26T20:00:00Z",venue:"Toronto"},
  {id:63, phase:"groups",group:"H",home:"Cabo Verde",          away:"Arabia Saudita",      date:"2026-06-27T01:00:00Z",venue:"Houston"},
  {id:64, phase:"groups",group:"H",home:"Uruguay",             away:"España",              date:"2026-06-27T01:00:00Z",venue:"Guadalajara"},
  {id:65, phase:"groups",group:"G",home:"Egipto",              away:"Irán",                date:"2026-06-27T04:00:00Z",venue:"Seattle"},
  {id:66, phase:"groups",group:"G",home:"Nueva Zelanda",       away:"Bélgica",             date:"2026-06-27T04:00:00Z",venue:"Vancouver"},
  {id:67, phase:"groups",group:"L",home:"Panamá",              away:"Inglaterra",          date:"2026-06-27T22:00:00Z",venue:"Nueva York/NJ"},
  {id:68, phase:"groups",group:"L",home:"Croacia",             away:"Ghana",               date:"2026-06-27T22:00:00Z",venue:"Filadelfia"},
  {id:69, phase:"groups",group:"K",home:"Colombia",            away:"Portugal",            date:"2026-06-28T00:30:00Z",venue:"Miami"},
  {id:70, phase:"groups",group:"K",home:"R.D. Congo",          away:"Uzbekistán",          date:"2026-06-28T00:30:00Z",venue:"Atlanta"},
  {id:71, phase:"groups",group:"J",home:"Argelia",             away:"Austria",             date:"2026-06-28T03:00:00Z",venue:"Kansas City"},
  {id:72, phase:"groups",group:"J",home:"Jordania",            away:"Argentina",           date:"2026-06-28T03:00:00Z",venue:"Dallas"},
];

// slotLabel: shown when no team assigned yet. homeSlot/awaySlot are the descriptions.
const KNOCKOUT_TEMPLATES = [
  {id:101,phase:"r32",label:"16avos 1", homeSlot:"1ro Gr. A",awaySlot:"2do Gr. B",date:"2026-06-28T20:00:00Z",venue:"Los Ángeles"},
  {id:102,phase:"r32",label:"16avos 2", homeSlot:"1ro Gr. B",awaySlot:"3ro Gr. E/I/J",date:"2026-06-29T17:00:00Z",venue:"Houston"},
  {id:103,phase:"r32",label:"16avos 3", homeSlot:"1ro Gr. C",awaySlot:"3ro Gr. D/F/G",date:"2026-06-29T20:30:00Z",venue:"Boston"},
  {id:104,phase:"r32",label:"16avos 4", homeSlot:"1ro Gr. D",awaySlot:"2do Gr. E",date:"2026-06-30T01:00:00Z",venue:"Monterrey"},
  {id:105,phase:"r32",label:"16avos 5", homeSlot:"1ro Gr. E",awaySlot:"3ro Gr. A/B/C",date:"2026-06-30T17:00:00Z",venue:"Dallas"},
  {id:106,phase:"r32",label:"16avos 6", homeSlot:"1ro Gr. F",awaySlot:"2do Gr. A",date:"2026-06-30T21:00:00Z",venue:"Nueva York/NJ"},
  {id:107,phase:"r32",label:"16avos 7", homeSlot:"1ro Gr. G",awaySlot:"2do Gr. H",date:"2026-07-01T01:00:00Z",venue:"Ciudad de México"},
  {id:108,phase:"r32",label:"16avos 8", homeSlot:"1ro Gr. H",awaySlot:"2do Gr. G",date:"2026-07-01T16:00:00Z",venue:"Atlanta"},
  {id:109,phase:"r32",label:"16avos 9", homeSlot:"1ro Gr. I",awaySlot:"2do Gr. J",date:"2026-07-01T20:00:00Z",venue:"Seattle"},
  {id:110,phase:"r32",label:"16avos 10",homeSlot:"1ro Gr. J",awaySlot:"2do Gr. I",date:"2026-07-02T00:00:00Z",venue:"San Francisco"},
  {id:111,phase:"r32",label:"16avos 11",homeSlot:"1ro Gr. K",awaySlot:"2do Gr. L",date:"2026-07-02T20:00:00Z",venue:"Los Ángeles"},
  {id:112,phase:"r32",label:"16avos 12",homeSlot:"1ro Gr. L",awaySlot:"2do Gr. K",date:"2026-07-03T00:00:00Z",venue:"Toronto"},
  {id:113,phase:"r32",label:"16avos 13",homeSlot:"2do Gr. C",awaySlot:"3ro Gr. H/I/K",date:"2026-07-03T04:00:00Z",venue:"Vancouver"},
  {id:114,phase:"r32",label:"16avos 14",homeSlot:"2do Gr. D",awaySlot:"3ro Gr. J/K/L",date:"2026-07-03T18:00:00Z",venue:"Dallas"},
  {id:115,phase:"r32",label:"16avos 15",homeSlot:"2do Gr. F",awaySlot:"3ro Gr. A/C/D",date:"2026-07-03T22:00:00Z",venue:"Miami"},
  {id:116,phase:"r32",label:"16avos 16",homeSlot:"2do Gr. B",awaySlot:"3ro Gr. E/F/G",date:"2026-07-04T01:30:00Z",venue:"Kansas City"},
  {id:201,phase:"r16",label:"8vos 1",   homeSlot:"Gan. 16avos 1",awaySlot:"Gan. 16avos 2",date:"2026-07-04T17:00:00Z",venue:"Houston"},
  {id:202,phase:"r16",label:"8vos 2",   homeSlot:"Gan. 16avos 3",awaySlot:"Gan. 16avos 4",date:"2026-07-04T21:00:00Z",venue:"Filadelfia"},
  {id:203,phase:"r16",label:"8vos 3",   homeSlot:"Gan. 16avos 5",awaySlot:"Gan. 16avos 6",date:"2026-07-05T20:00:00Z",venue:"Nueva York/NJ"},
  {id:204,phase:"r16",label:"8vos 4",   homeSlot:"Gan. 16avos 7",awaySlot:"Gan. 16avos 8",date:"2026-07-06T00:00:00Z",venue:"Ciudad de México"},
  {id:205,phase:"r16",label:"8vos 5",   homeSlot:"Gan. 16avos 9",awaySlot:"Gan. 16avos 10",date:"2026-07-06T19:00:00Z",venue:"Dallas"},
  {id:206,phase:"r16",label:"8vos 6",   homeSlot:"Gan. 16avos 11",awaySlot:"Gan. 16avos 12",date:"2026-07-07T00:00:00Z",venue:"Seattle"},
  {id:207,phase:"r16",label:"8vos 7",   homeSlot:"Gan. 16avos 13",awaySlot:"Gan. 16avos 14",date:"2026-07-07T16:00:00Z",venue:"Atlanta"},
  {id:208,phase:"r16",label:"8vos 8",   homeSlot:"Gan. 16avos 15",awaySlot:"Gan. 16avos 16",date:"2026-07-08T00:00:00Z",venue:"Vancouver"},
  {id:301,phase:"qf", label:"Cuartos 1",homeSlot:"Gan. 8vos 1",awaySlot:"Gan. 8vos 2",date:"2026-07-09T21:00:00Z",venue:"Boston"},
  {id:302,phase:"qf", label:"Cuartos 2",homeSlot:"Gan. 8vos 3",awaySlot:"Gan. 8vos 4",date:"2026-07-10T23:00:00Z",venue:"Los Ángeles"},
  {id:303,phase:"qf", label:"Cuartos 3",homeSlot:"Gan. 8vos 5",awaySlot:"Gan. 8vos 6",date:"2026-07-11T22:00:00Z",venue:"Miami"},
  {id:304,phase:"qf", label:"Cuartos 4",homeSlot:"Gan. 8vos 7",awaySlot:"Gan. 8vos 8",date:"2026-07-12T03:00:00Z",venue:"Kansas City"},
  {id:401,phase:"sf", label:"Semifinal 1",homeSlot:"Gan. Cuartos 1",awaySlot:"Gan. Cuartos 2",date:"2026-07-14T21:00:00Z",venue:"Dallas"},
  {id:402,phase:"sf", label:"Semifinal 2",homeSlot:"Gan. Cuartos 3",awaySlot:"Gan. Cuartos 4",date:"2026-07-15T20:00:00Z",venue:"Atlanta"},
  {id:501,phase:"3rd",label:"3er Puesto",homeSlot:"Perd. Semifinal 1",awaySlot:"Perd. Semifinal 2",date:"2026-07-18T22:00:00Z",venue:"Miami"},
  {id:601,phase:"final",label:"FINAL 🏆",homeSlot:"Gan. Semifinal 1",awaySlot:"Gan. Semifinal 2",date:"2026-07-19T20:00:00Z",venue:"Nueva York/NJ"},
];

const PHASE_LABELS = {
  groups:"Fase de Grupos", r32:"16avos de Final", r16:"8vos de Final",
  qf:"Cuartos de Final", sf:"Semifinales", "3rd":"3er Puesto", final:"FINAL 🏆"
};

// Knockout phases use 120-min result note
const isKnockoutPhase = (phase) => phase !== "groups";

function calcPoints(pred, real, phase) {
  if (!pred || real?.home==null || real?.away==null || real.home==="" || real.away==="") return 0;
  const ph=parseInt(pred.home), pa=parseInt(pred.away);
  const rh=parseInt(real.home), ra=parseInt(real.away);
  if (isNaN(ph)||isNaN(pa)||isNaN(rh)||isNaN(ra)) return 0;
  const [winPts, exactPts] = PHASE_POINTS[phase] || [3,3];
  const pW=ph>pa?"H":ph<pa?"A":"D";
  const rW=rh>ra?"H":rh<ra?"A":"D";
  if (pW!==rW) return 0;
  return (ph===rh && pa===ra) ? winPts+exactPts : winPts;
}

function getTotalPoints(username, predictions, results, knockoutMatches) {
  let pts=0;
  if (predictions[username]?.champion && results.champion && predictions[username].champion===results.champion) pts+=10;
  GROUP_MATCHES.forEach(m => pts+=calcPoints(predictions[username]?.matches?.[m.id], results[m.id]||{}, "groups"));
  knockoutMatches.forEach(m => pts+=calcPoints(predictions[username]?.matches?.[m.id], results[m.id]||{}, m.phase));
  return pts;
}

// ─── CANVAS ──────────────────────────────────────────────────
const ParticleCanvas = () => {
  const ref=useRef(null);
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    const ctx=c.getContext("2d");
    let W=c.width=window.innerWidth, H=c.height=window.innerHeight;
    const resize=()=>{W=c.width=window.innerWidth;H=c.height=window.innerHeight;};
    window.addEventListener("resize",resize);
    const pts=Array.from({length:55},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:1.2+Math.random()*1.8,a:.2+Math.random()*.5}));
    let raf;
    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(180,210,255,${p.a})`;ctx.fill();});
      for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<110){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(100,160,255,${.12*(1-dist/110)})`;ctx.lineWidth=.8;ctx.stroke();}}
      raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}/>;
};

const FloatingDeco=()=>(
  <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
    <div style={{position:"absolute",top:"-10%",left:"-5%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(116,172,223,.12) 0%,transparent 70%)"}}/>
    <div style={{position:"absolute",bottom:"-15%",right:"-8%",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(74,222,128,.08) 0%,transparent 70%)"}}/>
    <div style={{position:"absolute",top:"40%",left:"60%",width:350,height:350,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,215,0,.07) 0%,transparent 70%)"}}/>
    <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"repeating-linear-gradient(96deg,rgba(116,172,223,.025) 0px,rgba(116,172,223,.025) 48px,transparent 48px,transparent 96px)"}}/>
    <div style={{position:"absolute",bottom:"5%",right:"2%",fontSize:200,opacity:.03,transform:"rotate(-15deg)",userSelect:"none"}}>🏆</div>
    <div style={{position:"absolute",top:"12%",left:"-2%",fontSize:160,opacity:.04,transform:"rotate(20deg)",userSelect:"none"}}>⚽</div>
  </div>
);

const GlobalCSS=()=>(
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Plus Jakarta Sans',sans-serif}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    @keyframes pulseRing{0%{box-shadow:0 0 0 0 rgba(255,215,0,.4)}70%{box-shadow:0 0 0 10px rgba(255,215,0,0)}100%{box-shadow:0 0 0 0 rgba(255,215,0,0)}}
    @keyframes modalIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
    input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
    input[type=number]{-moz-appearance:textfield} input:focus{outline:none}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,215,0,.25);border-radius:2px}
    .glass{background:rgba(255,255,255,.045);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.1)}
    .glass-gold{background:rgba(255,215,0,.07);backdrop-filter:blur(18px);border:1px solid rgba(255,215,0,.2)}
    .btn-gold{background:linear-gradient(135deg,#f7d354,#e09000);color:#1a0800;border:none;cursor:pointer;font-family:'Bangers',cursive;letter-spacing:1.5px;transition:all .18s;border-radius:14px}
    .btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(245,200,66,.45)}
    .tab-btn{background:transparent;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;transition:all .18s;padding:9px 14px;border-radius:10px;font-size:13px;white-space:nowrap}
    .tab-btn.active{background:rgba(255,215,0,.14);color:#FFD700;box-shadow:inset 0 0 0 1px rgba(255,215,0,.25)}
    .tab-btn:not(.active){color:rgba(255,255,255,.42)}
    .tab-btn:hover:not(.active){color:rgba(255,255,255,.75);background:rgba(255,255,255,.06)}
    .phase-btn{cursor:pointer;padding:7px 12px;border-radius:9px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;border:1px solid rgba(255,255,255,.18);transition:all .15s;white-space:nowrap}
    .group-btn{cursor:pointer;padding:6px 12px;border-radius:9px;font-family:'Bangers',cursive;font-size:15px;letter-spacing:1px;border:1px solid rgba(255,255,255,.18);transition:all .15s}
    .score-input{width:44px;text-align:center;background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.22);border-radius:10px;color:#fff;font-size:19px;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;padding:7px 4px;transition:all .15s}
    .score-input:focus{border-color:#FFD700;background:rgba(255,215,0,.1);box-shadow:0 0 0 3px rgba(255,215,0,.15)}
    .score-input:disabled{opacity:.32;cursor:not-allowed}
    .score-input-admin{border-color:rgba(255,215,0,.45)!important;background:rgba(255,215,0,.07)!important}
    .match-card{border-radius:16px;padding:14px 16px;margin-bottom:10px;transition:all .2s;position:relative;overflow:hidden}
    .match-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent)}
    .team-picker-btn{background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.12);border-radius:12px;padding:10px;cursor:pointer;display:flex;align-items:center;gap:8px;color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:13px;transition:all .15s}
    .team-picker-btn:hover{background:rgba(255,255,255,.1);border-color:rgba(255,215,0,.4);transform:translateY(-1px)}
    .slot-input{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.2);border-radius:10px;color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;padding:8px 12px;width:100%;transition:all .15s}
    .slot-input:focus{border-color:#FFD700;background:rgba(255,215,0,.08);outline:none}
    .help-btn{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:50%;width:28px;height:28px;color:rgba(255,255,255,.7);font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
    .help-btn:hover{background:rgba(255,215,0,.2);border-color:rgba(255,215,0,.5);color:#FFD700}
  `}</style>
);

// ─── RULES MODAL ─────────────────────────────────────────────
const RulesModal = ({onClose}) => (
  <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
    <div className="glass" style={{borderRadius:24,padding:"28px 24px",maxWidth:420,width:"100%",animation:"modalIn .25s ease-out",boxShadow:"0 32px 80px rgba(0,0,0,.6)"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{fontFamily:"'Bangers',cursive",color:"#FFD700",fontSize:26,letterSpacing:2}}>📋 REGLAS Y PUNTOS</h2>
        <button onClick={onClose} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:"50%",width:32,height:32,color:"rgba(255,255,255,.7)",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div>

      {/* Scoring table */}
      <div style={{marginBottom:18}}>
        <div style={{color:"rgba(255,255,255,.5)",fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:10,textTransform:"uppercase"}}>Sistema de puntuación</div>
        {[
          {fase:"Fase de Grupos",win:3,exact:3,max:6,icon:"⚽"},
          {fase:"16avos y 8vos",win:4,exact:4,max:8,icon:"⚔️"},
          {fase:"Cuartos, Semis y 3er Puesto",win:5,exact:5,max:10,icon:"🔥"},
          {fase:"Final",win:7,exact:7,max:14,icon:"🏆"},
        ].map(row=>(
          <div key={row.fase} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",marginBottom:6}}>
            <span style={{fontSize:18,minWidth:24}}>{row.icon}</span>
            <div style={{flex:1}}>
              <div style={{color:"#fff",fontSize:13,fontWeight:700}}>{row.fase}</div>
              <div style={{color:"rgba(255,255,255,.45)",fontSize:11,marginTop:1}}>
                Ganador/empate: <span style={{color:"#4ade80",fontWeight:700}}>+{row.win} pts</span>
                {"  ·  "}
                Resultado exacto: <span style={{color:"#FFD700",fontWeight:700}}>+{row.exact} pts</span>
              </div>
            </div>
            <div style={{fontFamily:"'Bangers',cursive",color:"#FFD700",fontSize:18,minWidth:36,textAlign:"right"}}>
              {row.max}<span style={{fontSize:11,color:"rgba(255,255,255,.35)",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600}}> max</span>
            </div>
          </div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,background:"rgba(255,215,0,.08)",border:"1px solid rgba(255,215,0,.2)",marginTop:8}}>
          <span style={{fontSize:18}}>🌟</span>
          <div style={{flex:1}}>
            <div style={{color:"#FFD700",fontSize:13,fontWeight:700}}>Campeón del Mundial</div>
            <div style={{color:"rgba(255,255,255,.45)",fontSize:11,marginTop:1}}>Debe pronosticarse antes del primer partido</div>
          </div>
          <div style={{fontFamily:"'Bangers',cursive",color:"#FFD700",fontSize:18}}>10 pts</div>
        </div>
      </div>

      {/* Rules */}
      <div style={{color:"rgba(255,255,255,.5)",fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:10,textTransform:"uppercase"}}>Reglas generales</div>
      {[
        "🔒 Cada partido se cierra 30 minutos antes del horario de inicio.",
        "⏱️ En eliminatorias, el resultado es el de los 120 minutos (incluye alargue si lo hay). Los penales no cuentan para el marcador.",
        "📅 El pronóstico de campeón cierra 30 min antes del primer partido (11 Jun, 16:00 hs ARG).",
        "👑 Solo el administrador puede cargar los resultados y los equipos de las eliminatorias.",
      ].map((rule,i)=>(
        <div key={i} style={{fontSize:13,color:"rgba(255,255,255,.6)",padding:"7px 0",borderBottom:i<3?"1px solid rgba(255,255,255,.06)":"none",lineHeight:1.5}}>{rule}</div>
      ))}
    </div>
  </div>
);

// ─── MATCH CARD ───────────────────────────────────────────────
const MatchCard = ({match, pred={}, real={}, locked, isAdmin, onPredChange, onResultChange}) => {
  const {label,time}=toBsAs(match.date);
  const phase = match.phase;
  const [winPts, exactPts] = PHASE_POINTS[phase]||[3,3];
  const pts = calcPoints(pred, real, phase);
  const hasResult = real.home!=null && real.home!=="" && real.away!=null && real.away!=="";
  const isKO = isKnockoutPhase(phase);

  // Resolve displayed team names: use assigned team or fallback to slot description
  const homeTeam = match.home || match.homeSlot || "?";
  const awayTeam = match.away || match.awaySlot || "?";
  const homeResolved = !!match.home;
  const awayResolved = !!match.away;
  const teamsPending = isKO && (!match.home || !match.away);

  const borderCol = !isAdmin && hasResult
    ? (pts===winPts+exactPts?"rgba(74,222,128,.45)":pts===winPts?"rgba(250,204,21,.45)":"rgba(248,113,113,.35)")
    : "rgba(255,255,255,.08)";
  const bg = !isAdmin && hasResult
    ? (pts===winPts+exactPts?"rgba(74,222,128,.05)":pts===winPts?"rgba(250,204,21,.05)":"rgba(248,113,113,.04)")
    : "rgba(255,255,255,.04)";

  return (
    <div className="match-card glass" style={{borderColor:isAdmin?"rgba(255,215,0,.12)":borderCol, background:isAdmin?"rgba(255,255,255,.04)":bg}}>
      {/* Header row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:4}}>
        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          <span style={{fontSize:11,color:"rgba(255,255,255,.35)",fontWeight:600}}>{label}</span>
          <span style={{background:"rgba(255,215,0,.12)",border:"1px solid rgba(255,215,0,.25)",borderRadius:6,padding:"1px 7px",fontSize:11,color:"#FFD700",fontWeight:700}}>{time} hs</span>
          <span style={{fontSize:10,color:"rgba(255,255,255,.25)",background:"rgba(255,255,255,.04)",borderRadius:5,padding:"1px 6px"}}>{match.label}</span>
          {isKO && <span style={{fontSize:10,color:"rgba(116,172,223,.6)",background:"rgba(116,172,223,.08)",borderRadius:5,padding:"1px 6px",border:"1px solid rgba(116,172,223,.15)"}}>120 min</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {!isAdmin&&<span style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>+{winPts}/{winPts+exactPts} pts</span>}
          {!isAdmin&&locked&&<span style={{fontSize:11,color:"#ef4444",fontWeight:600}}>🔒</span>}
          {!isAdmin&&hasResult&&<span style={{fontSize:13,fontWeight:800,color:pts===winPts+exactPts?"#4ade80":pts===winPts?"#facc15":"#f87171"}}>{pts>0?`+${pts}`:"-0"} pts</span>}
        </div>
      </div>

      {/* Teams row */}
      <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}>
        {/* Home */}
        <div style={{flex:1,textAlign:"right"}}>
          {homeResolved
            ? <><div style={{fontSize:26,lineHeight:1}}>{FLAGS[homeTeam]||"🏳️"}</div><div style={{color:"#fff",fontSize:12,fontWeight:700,marginTop:3}}>{homeTeam}</div></>
            : <div style={{color:"rgba(255,255,255,.35)",fontSize:11,fontStyle:"italic",lineHeight:1.4,paddingRight:4}}>{homeTeam}</div>
          }
        </div>

        {/* Inputs */}
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          {isAdmin ? (
            <>
              <input className="score-input score-input-admin" type="number" min="0" value={real.home??""} onChange={e=>onResultChange("home",e.target.value)} placeholder="?"/>
              <span style={{color:"rgba(255,255,255,.3)",fontSize:20,fontWeight:800}}>–</span>
              <input className="score-input score-input-admin" type="number" min="0" value={real.away??""} onChange={e=>onResultChange("away",e.target.value)} placeholder="?"/>
            </>
          ) : (
            <>
              <input className="score-input" type="number" min="0" max="99" value={pred.home??""} disabled={locked||teamsPending} onChange={e=>onPredChange("home",e.target.value)} placeholder="?"/>
              <span style={{color:"rgba(255,255,255,.3)",fontSize:20,fontWeight:800}}>–</span>
              <input className="score-input" type="number" min="0" max="99" value={pred.away??""} disabled={locked||teamsPending} onChange={e=>onPredChange("away",e.target.value)} placeholder="?"/>
            </>
          )}
        </div>

        {/* Away */}
        <div style={{flex:1,textAlign:"left"}}>
          {awayResolved
            ? <><div style={{fontSize:26,lineHeight:1}}>{FLAGS[awayTeam]||"🏳️"}</div><div style={{color:"#fff",fontSize:12,fontWeight:700,marginTop:3}}>{awayTeam}</div></>
            : <div style={{color:"rgba(255,255,255,.35)",fontSize:11,fontStyle:"italic",lineHeight:1.4,paddingLeft:4}}>{awayTeam}</div>
          }
        </div>
      </div>

      {/* Result shown to user */}
      {!isAdmin&&hasResult&&(
        <div style={{textAlign:"center",marginTop:9,fontSize:12,color:"rgba(255,255,255,.35)",borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:8}}>
          Resultado{isKO?" (120 min)":""}: <strong style={{color:"rgba(255,255,255,.6)"}}>{real.home} – {real.away}</strong>
        </div>
      )}
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]=useState("login");
  const [currentUser,setCurrentUser]=useState(null);
  const [users,setUsers]=useState([]);
  const [predictions,setPredictions]=useState({});
  const [results,setResults]=useState({});
  const [knockoutMatches,setKnockoutMatches]=useState(KNOCKOUT_TEMPLATES.map(m=>({...m})));
  const [loginForm,setLoginForm]=useState({username:"",password:""});
  const [registerForm,setRegisterForm]=useState({username:"",password:"",confirm:""});
  const [error,setError]=useState("");
  const [activeTab,setActiveTab]=useState("prode");
  const [selectedPhase,setSelectedPhase]=useState("groups");
  const [selectedGroup,setSelectedGroup]=useState("A");
  const [toast,setToast]=useState("");
  const [champSearch,setChampSearch]=useState("");
  const [loading,setLoading]=useState(true);
  const [showRules,setShowRules]=useState(false);

  useEffect(()=>{
    (async()=>{
      try {
        const [{data:u},{data:p},{data:r},{data:km}]=await Promise.all([
          supabase.from("users").select("*"),
          supabase.from("predictions").select("*"),
          supabase.from("results").select("*"),
          supabase.from("knockout_matches").select("*"),
        ]);
        if(u) setUsers(u);
        const pMap={};
        (p||[]).forEach(row=>{
          if(!pMap[row.username]) pMap[row.username]={matches:{}};
          if(row.match_id!=null) pMap[row.username].matches[row.match_id]={home:row.home_pred,away:row.away_pred};
          if(row.champion) pMap[row.username].champion=row.champion;
        });
        setPredictions(pMap);
        const rMap={};
        (r||[]).forEach(row=>{
          if(row.match_id==="champion") rMap.champion=row.home_score;
          else rMap[row.match_id]={home:row.home_score,away:row.away_score};
        });
        setResults(rMap);
        if(km&&km.length>0){
          setKnockoutMatches(prev=>prev.map(m=>{
            const found=km.find(k=>k.match_id===m.id);
            return found?{...m,home:found.home||"",away:found.away||""}:m;
          }));
        }
      } catch(e){console.error(e);}
      setLoading(false);
    })();
  },[]);

  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(""),2600);};

  const handleLogin=()=>{
    setError("");
    if(loginForm.username===ADMIN_USERNAME&&loginForm.password===ADMIN_PASSWORD){
      setCurrentUser({username:ADMIN_USERNAME,isAdmin:true});setScreen("app");setActiveTab("admin");return;
    }
    const found=users.find(u=>u.username===loginForm.username&&u.password===loginForm.password);
    if(found){setCurrentUser(found);setScreen("app");setActiveTab("prode");}
    else setError("Usuario o contraseña incorrectos.");
  };

  const handleRegister=async()=>{
    setError("");
    if(!registerForm.username.trim()||!registerForm.password.trim()){setError("Completá todos los campos.");return;}
    if(registerForm.password!==registerForm.confirm){setError("Las contraseñas no coinciden.");return;}
    if(registerForm.username===ADMIN_USERNAME){setError("Ese nombre no está disponible.");return;}
    if(users.find(u=>u.username===registerForm.username)){setError("Ese nombre ya existe.");return;}
    if(users.length>=25){setError("Se alcanzó el límite de 25 participantes.");return;}
    const {error:e}=await supabase.from("users").insert({username:registerForm.username,password:registerForm.password});
    if(e){setError("Error al registrarse. Intentá de nuevo.");return;}
    const newU={username:registerForm.username,password:registerForm.password};
    setUsers(p=>[...p,newU]);setCurrentUser(newU);setScreen("app");setActiveTab("prode");
  };

  const handleLogout=()=>{setCurrentUser(null);setScreen("login");setLoginForm({username:"",password:""});};
  const isLocked=(match)=>new Date()>=new Date(new Date(match.date).getTime()-30*60*1000);

  const setPrediction=async(matchId,side,val)=>{
    const clean=val.replace(/[^0-9]/g,"").slice(0,2);
    const newPred={...(predictions[currentUser.username]?.matches?.[matchId]||{}),[side]:clean};
    setPredictions(p=>({...p,[currentUser.username]:{...p[currentUser.username],matches:{...(p[currentUser.username]?.matches||{}),[matchId]:newPred}}}));
    await supabase.from("predictions").upsert({username:currentUser.username,match_id:matchId,home_pred:newPred.home??null,away_pred:newPred.away??null},{onConflict:"username,match_id"});
  };

  const setChampionPick=async(team)=>{
    setPredictions(p=>({...p,[currentUser.username]:{...p[currentUser.username],champion:team}}));
    // champion stored with match_id = 0
    await supabase.from("predictions").upsert({username:currentUser.username,match_id:0,home_pred:null,away_pred:null,champion:team},{onConflict:"username,match_id"});
    showToast(`${FLAGS[team]} ${team} guardado ✓`);
  };

  const setResult=async(matchId,side,val)=>{
    const clean=val.replace(/[^0-9]/g,"").slice(0,2);
    const newR={...(results[matchId]||{}),[side]:clean};
    setResults(p=>({...p,[matchId]:newR}));
    await supabase.from("results").upsert({match_id:String(matchId),home_score:newR.home??null,away_score:newR.away??null},{onConflict:"match_id"});
  };

  const setChampionResult=async(team)=>{
    setResults(p=>({...p,champion:team}));
    await supabase.from("results").upsert({match_id:"champion",home_score:team,away_score:null},{onConflict:"match_id"});
    showToast(`🏆 ${team} guardado como campeón!`);
  };

  const setKnockoutTeam=async(matchId,side,val)=>{
    setKnockoutMatches(prev=>prev.map(m=>m.id===matchId?{...m,[side]:val}:m));
    const updated=knockoutMatches.find(m=>m.id===matchId);
    const next={...updated,[side]:val};
    await supabase.from("knockout_matches").upsert({match_id:matchId,home:next.home||null,away:next.away||null},{onConflict:"match_id"});
  };

  const myPoints=()=>currentUser&&!currentUser.isAdmin?getTotalPoints(currentUser.username,predictions,results,knockoutMatches):0;
  const lb=users.filter(u=>!u.isAdmin).map(u=>({username:u.username,points:getTotalPoints(u.username,predictions,results,knockoutMatches)})).sort((a,b)=>b.points-a.points);
  const myRank=lb.findIndex(x=>x.username===currentUser?.username)+1;
  const userChamp=predictions[currentUser?.username]?.champion;
  const champLocked=new Date()>=new Date(new Date("2026-06-11T20:00:00Z").getTime()-30*60*1000);
  const filteredTeams=ALL_TEAMS.filter(t=>t.toLowerCase().includes(champSearch.toLowerCase()));
  const phases=["groups","r32","r16","qf","sf","3rd","final"];

  const matchesForPhase=(phase)=>{
    if(phase==="groups") return GROUP_MATCHES.filter(m=>m.group===selectedGroup);
    return knockoutMatches.filter(m=>m.phase===phase);
  };

  const inp=(extra={})=>({width:"100%",padding:"13px 16px",borderRadius:12,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.15)",color:"#fff",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:15,...extra});

  if(loading) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#060d1f,#0b1f4a,#091930)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <GlobalCSS/>
      <div style={{color:"#FFD700",fontFamily:"'Bangers',cursive",fontSize:28,letterSpacing:2}}>Cargando... ⚽</div>
    </div>
  );

  // ── AUTH ──────────────────────────────────────────────────
  if(screen==="login"||screen==="register") return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#060d1f 0%,#0b1f4a 35%,#091930 65%,#040e1e 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:16,position:"relative",overflow:"hidden"}}>
      <GlobalCSS/><ParticleCanvas/><FloatingDeco/>
      <div style={{position:"relative",zIndex:2,textAlign:"center",marginBottom:28,animation:"slideUp .5s ease-out"}}>
        <div style={{fontSize:56,animation:"float 3.5s ease-in-out infinite",lineHeight:1,marginBottom:10}}>⚽</div>
        <h1 style={{fontFamily:"'Bangers',cursive",fontSize:"clamp(40px,9vw,62px)",color:"#FFD700",letterSpacing:4,lineHeight:1,textShadow:"0 0 40px rgba(255,215,0,.5),0 4px 0 rgba(0,0,0,.6)"}}>PRODE FAMIGLIA</h1>
        <div style={{fontFamily:"'Bangers',cursive",fontSize:"clamp(18px,4vw,26px)",color:"rgba(116,172,223,.9)",letterSpacing:7,marginTop:4}}>MUNDIAL 2026</div>
        <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:8,fontSize:22}}>🇦🇷🌍🏆🌎🇦🇷</div>
      </div>
      <div style={{position:"relative",zIndex:2,width:"100%",maxWidth:400,animation:"slideUp .7s ease-out"}}>
        <div className="glass" style={{borderRadius:24,padding:"30px 28px",boxShadow:"0 32px 80px rgba(0,0,0,.6)"}}>
          {screen==="login"?<>
            <h2 style={{fontFamily:"'Bangers',cursive",color:"#FFD700",textAlign:"center",fontSize:26,letterSpacing:2,marginBottom:20}}>INICIAR SESIÓN</h2>
            <input value={loginForm.username} onChange={e=>setLoginForm(p=>({...p,username:e.target.value}))} placeholder="Usuario" style={inp({marginBottom:12})}/>
            <input type="password" value={loginForm.password} onChange={e=>setLoginForm(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="Contraseña" style={inp({marginBottom:8})}/>
            {error&&<p style={{color:"#ff6b6b",fontSize:13,margin:"4px 0 10px",textAlign:"center",fontWeight:600}}>{error}</p>}
            <button className="btn-gold" onClick={handleLogin} style={{width:"100%",padding:"15px",fontSize:21,marginTop:6}}>¡ENTRAR! 🚀</button>
            <p style={{textAlign:"center",marginTop:16,color:"rgba(255,255,255,.45)",fontSize:14}}>¿No tenés cuenta?{" "}<button onClick={()=>{setScreen("register");setError("");}} style={{background:"none",border:"none",color:"#FFD700",fontWeight:800,fontSize:14,cursor:"pointer",textDecoration:"underline",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Registrate</button></p>
          </>:<>
            <h2 style={{fontFamily:"'Bangers',cursive",color:"#FFD700",textAlign:"center",fontSize:26,letterSpacing:2,marginBottom:20}}>REGISTRARSE</h2>
            <input value={registerForm.username} onChange={e=>setRegisterForm(p=>({...p,username:e.target.value}))} placeholder="Elegí un nombre de usuario" style={inp({marginBottom:12})}/>
            <input type="password" value={registerForm.password} onChange={e=>setRegisterForm(p=>({...p,password:e.target.value}))} placeholder="Contraseña" style={inp({marginBottom:12})}/>
            <input type="password" value={registerForm.confirm} onChange={e=>setRegisterForm(p=>({...p,confirm:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleRegister()} placeholder="Repetí la contraseña" style={inp({marginBottom:8})}/>
            {error&&<p style={{color:"#ff6b6b",fontSize:13,margin:"4px 0 10px",textAlign:"center",fontWeight:600}}>{error}</p>}
            <button className="btn-gold" onClick={handleRegister} style={{width:"100%",padding:"15px",fontSize:21,marginTop:6}}>¡UNIRME! 🎉</button>
            <p style={{textAlign:"center",marginTop:16,color:"rgba(255,255,255,.45)",fontSize:14}}>¿Ya tenés cuenta?{" "}<button onClick={()=>{setScreen("login");setError("");}} style={{background:"none",border:"none",color:"#FFD700",fontWeight:800,fontSize:14,cursor:"pointer",textDecoration:"underline",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Iniciá sesión</button></p>
          </>}
        </div>
      </div>
      <p style={{position:"relative",zIndex:2,color:"rgba(255,255,255,.25)",fontSize:12,marginTop:20}}>{users.length}/25 participantes registrados</p>
    </div>
  );

  // ── MAIN APP ──────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#060d1f 0%,#0b1f4a 40%,#091930 70%,#040e1e 100%)",fontFamily:"'Plus Jakarta Sans',sans-serif",position:"relative"}}>
      <GlobalCSS/><ParticleCanvas/><FloatingDeco/>
      {showRules&&<RulesModal onClose={()=>setShowRules(false)}/>}
      {toast&&<div style={{position:"fixed",bottom:76,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",padding:"10px 26px",borderRadius:50,fontWeight:700,zIndex:9999,animation:"toastIn .3s ease-out",whiteSpace:"nowrap",boxShadow:"0 8px 24px rgba(34,197,94,.4)",fontSize:14}}>{toast}</div>}

      {/* HEADER */}
      <div className="glass" style={{position:"sticky",top:0,zIndex:100,borderRadius:0,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(6,13,31,.7)",backdropFilter:"blur(20px)"}}>
        <div>
          <div style={{fontFamily:"'Bangers',cursive",color:"#FFD700",fontSize:20,letterSpacing:2,lineHeight:1,textShadow:"0 0 20px rgba(255,215,0,.4)"}}>PRODE FAMIGLIA</div>
          <div style={{color:"rgba(116,172,223,.7)",fontSize:10,letterSpacing:2,fontWeight:600,marginTop:1}}>MUNDIAL 2026 ⚽</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {!currentUser?.isAdmin&&(
            <div className="glass-gold" style={{textAlign:"center",borderRadius:12,padding:"5px 14px",animation:myPoints()>0?"pulseRing 2s infinite":undefined}}>
              <div style={{fontFamily:"'Bangers',cursive",color:"#FFD700",fontSize:22,lineHeight:1}}>{myPoints()}</div>
              <div style={{color:"rgba(255,255,255,.4)",fontSize:10,fontWeight:600}}>{myRank>0?`#${myRank} · `:""}pts</div>
            </div>
          )}
          {/* Help button */}
          <button className="help-btn" onClick={()=>setShowRules(true)} title="Reglas y puntuación">?</button>
          <div style={{textAlign:"right"}}>
            <div style={{color:"#fff",fontSize:13,fontWeight:700}}>{currentUser?.isAdmin?"👑 Admin":currentUser?.username}</div>
            <button onClick={handleLogout} style={{background:"none",border:"none",color:"rgba(255,255,255,.35)",fontSize:11,cursor:"pointer",padding:0,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Salir</button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{position:"sticky",top:55,zIndex:99,background:"rgba(6,13,31,.85)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",gap:2,padding:"6px 10px",overflowX:"auto"}}>
        {!currentUser?.isAdmin&&<button className={`tab-btn${activeTab==="prode"?" active":""}`} onClick={()=>setActiveTab("prode")}>⚽ Mi Prode</button>}
        {!currentUser?.isAdmin&&<button className={`tab-btn${activeTab==="campeon"?" active":""}`} onClick={()=>setActiveTab("campeon")}>🏆 Campeón</button>}
        <button className={`tab-btn${activeTab==="tabla"?" active":""}`} onClick={()=>setActiveTab("tabla")}>📊 Tabla</button>
        {currentUser?.isAdmin&&<button className={`tab-btn${activeTab==="admin"?" active":""}`} onClick={()=>setActiveTab("admin")}>👑 Resultados</button>}
        {currentUser?.isAdmin&&<button className={`tab-btn${activeTab==="slots"?" active":""}`} onClick={()=>setActiveTab("slots")}>🔧 Equipos KO</button>}
        {currentUser?.isAdmin&&<button className={`tab-btn${activeTab==="champAdmin"?" active":""}`} onClick={()=>setActiveTab("champAdmin")}>🏆 Campeón</button>}
      </div>

      <div style={{position:"relative",zIndex:2,padding:"16px 14px",maxWidth:700,margin:"0 auto",paddingBottom:50}}>

        {/* ── MI PRODE ──────────────────────────────────────── */}
        {activeTab==="prode"&&!currentUser?.isAdmin&&(
          <div style={{animation:"slideUp .4s ease-out"}}>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
              {phases.map(ph=>(
                <button key={ph} className="phase-btn" onClick={()=>setSelectedPhase(ph)} style={{background:selectedPhase===ph?"rgba(255,215,0,.18)":"transparent",color:selectedPhase===ph?"#FFD700":"rgba(255,255,255,.45)",borderColor:selectedPhase===ph?"rgba(255,215,0,.5)":"rgba(255,255,255,.15)"}}>
                  {PHASE_LABELS[ph]}
                </button>
              ))}
            </div>
            {selectedPhase==="groups"&&(
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                {Object.keys(GROUPS).map(g=>(
                  <button key={g} className="group-btn" onClick={()=>setSelectedGroup(g)} style={{background:selectedGroup===g?"rgba(255,215,0,.18)":"transparent",color:selectedGroup===g?"#FFD700":"rgba(255,255,255,.45)",borderColor:selectedGroup===g?"rgba(255,215,0,.5)":"rgba(255,255,255,.15)"}}>Gr. {g}</button>
                ))}
              </div>
            )}
            {/* Points info bar */}
            {(()=>{const [w,e]=PHASE_POINTS[selectedPhase]||[3,3];return(
              <div style={{display:"flex",gap:10,marginBottom:12,padding:"9px 14px",borderRadius:12,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",flexWrap:"wrap"}}>
                <span style={{color:"rgba(255,255,255,.4)",fontSize:12}}>🔒 Cierra 30 min antes</span>
                <span style={{color:"rgba(255,255,255,.2)"}}>·</span>
                <span style={{color:"#4ade80",fontSize:12,fontWeight:600}}>+{w} ganador · +{e} exacto</span>
                {isKnockoutPhase(selectedPhase)&&<><span style={{color:"rgba(255,255,255,.2)"}}>·</span><span style={{color:"rgba(116,172,223,.7)",fontSize:12}}>resultado a 120 min</span></>}
              </div>
            );})()}
            {matchesForPhase(selectedPhase).map(m=>{
              const locked=isLocked(m);
              const pred=predictions[currentUser.username]?.matches?.[m.id]||{};
              const real=results[m.id]||{};
              return <MatchCard key={m.id} match={m} pred={pred} real={real} locked={locked} isAdmin={false}
                onPredChange={(side,val)=>setPrediction(m.id,side,val)} onResultChange={()=>{}}/>;
            })}
          </div>
        )}

        {/* ── CAMPEÓN ───────────────────────────────────────── */}
        {activeTab==="campeon"&&!currentUser?.isAdmin&&(
          <div style={{animation:"slideUp .4s ease-out"}}>
            <div style={{textAlign:"center",marginBottom:22}}>
              <div style={{fontSize:52,animation:"float 3s ease-in-out infinite"}}>🏆</div>
              <h2 style={{fontFamily:"'Bangers',cursive",color:"#FFD700",fontSize:32,letterSpacing:2,margin:"10px 0 6px"}}>CAMPEÓN DEL MUNDO</h2>
              <p style={{color:"rgba(255,255,255,.45)",fontSize:14}}>Pronosticá antes del primer partido · Vale <strong style={{color:"#FFD700"}}>10 puntos</strong> 🎯</p>
            </div>
            {champLocked&&<div style={{background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.3)",borderRadius:14,padding:"12px 16px",textAlign:"center",marginBottom:16}}><span style={{color:"#ef4444",fontWeight:700,fontSize:14}}>🔒 El pronóstico de campeón está cerrado</span></div>}
            {userChamp&&(
              <div className="glass-gold" style={{borderRadius:16,padding:"18px 20px",textAlign:"center",marginBottom:18,boxShadow:"0 8px 32px rgba(255,215,0,.15)"}}>
                <div style={{color:"rgba(255,255,255,.5)",fontSize:13,marginBottom:6}}>Tu pronóstico:</div>
                <div style={{fontSize:42}}>{FLAGS[userChamp]}</div>
                <div style={{fontFamily:"'Bangers',cursive",color:"#FFD700",fontSize:26,letterSpacing:1,marginTop:4}}>{userChamp}</div>
                {results.champion&&<div style={{marginTop:10,fontWeight:800,color:results.champion===userChamp?"#4ade80":"#f87171",fontSize:15}}>{results.champion===userChamp?"✅ ¡Acertaste! +10 puntos 🎉":`❌ Ganó: ${FLAGS[results.champion]||""} ${results.champion}`}</div>}
              </div>
            )}
            {!champLocked&&<>
              <input value={champSearch} onChange={e=>setChampSearch(e.target.value)} placeholder="🔍 Buscar selección..." style={{...inp(),marginBottom:12}}/>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:8}}>
                {filteredTeams.map(team=>(
                  <button key={team} className="team-picker-btn" onClick={()=>setChampionPick(team)} style={{borderColor:userChamp===team?"rgba(255,215,0,.6)":"rgba(255,255,255,.12)",background:userChamp===team?"rgba(255,215,0,.14)":"rgba(255,255,255,.05)"}}>
                    <span style={{fontSize:22}}>{FLAGS[team]}</span><span style={{flex:1,textAlign:"left"}}>{team}</span>
                    {userChamp===team&&<span style={{color:"#FFD700",fontSize:14}}>✓</span>}
                  </button>
                ))}
              </div>
            </>}
          </div>
        )}

        {/* ── TABLA ─────────────────────────────────────────── */}
        {activeTab==="tabla"&&(
          <div style={{animation:"slideUp .4s ease-out"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <h2 style={{fontFamily:"'Bangers',cursive",color:"#FFD700",fontSize:30,letterSpacing:2,textShadow:"0 0 20px rgba(255,215,0,.3)"}}>📊 TABLA DE POSICIONES</h2>
              <p style={{color:"rgba(255,255,255,.35)",fontSize:13,marginTop:4}}>{users.filter(u=>!u.isAdmin).length} participantes</p>
            </div>
            {lb.length===0?<div style={{textAlign:"center",color:"rgba(255,255,255,.3)",padding:40}}>Aún no hay participantes 🤷</div>
            :lb.map((entry,i)=>{
              const isMe=entry.username===currentUser?.username;
              const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}.`;
              const chPick=predictions[entry.username]?.champion;
              return (
                <div key={entry.username} className={isMe?"glass-gold":"glass"} style={{display:"flex",alignItems:"center",gap:12,borderRadius:14,padding:"12px 16px",marginBottom:8,animation:`slideUp ${.3+i*.04}s ease-out`}}>
                  <div style={{fontSize:i<3?22:15,fontWeight:800,color:"rgba(255,255,255,.5)",minWidth:30,textAlign:"center"}}>{medal}</div>
                  <div style={{flex:1}}>
                    <div style={{color:isMe?"#FFD700":"#fff",fontWeight:800,fontSize:14}}>{entry.username}{isMe&&<span style={{fontSize:11,opacity:.6,marginLeft:4}}>(vos)</span>}</div>
                    {chPick&&<div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:2}}>Campeón: {FLAGS[chPick]||""} {chPick}</div>}
                  </div>
                  <div style={{fontFamily:"'Bangers',cursive",fontSize:26,color:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"rgba(255,255,255,.7)"}}>
                    {entry.points}<span style={{fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600,color:"rgba(255,255,255,.35)",marginLeft:3}}>pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── ADMIN: RESULTADOS ─────────────────────────────── */}
        {activeTab==="admin"&&currentUser?.isAdmin&&(
          <div style={{animation:"slideUp .4s ease-out"}}>
            <div style={{textAlign:"center",marginBottom:14}}>
              <h2 style={{fontFamily:"'Bangers',cursive",color:"#FFD700",fontSize:26,letterSpacing:2}}>👑 CARGAR RESULTADOS</h2>
              <p style={{color:"rgba(255,255,255,.35)",fontSize:12,marginTop:4}}>Horarios en 🇦🇷 Buenos Aires</p>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
              {phases.map(ph=>(
                <button key={ph} className="phase-btn" onClick={()=>setSelectedPhase(ph)} style={{background:selectedPhase===ph?"rgba(255,215,0,.18)":"transparent",color:selectedPhase===ph?"#FFD700":"rgba(255,255,255,.45)",borderColor:selectedPhase===ph?"rgba(255,215,0,.5)":"rgba(255,255,255,.15)"}}>
                  {PHASE_LABELS[ph]}
                </button>
              ))}
            </div>
            {selectedPhase==="groups"&&(
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                {Object.keys(GROUPS).map(g=>(
                  <button key={g} className="group-btn" onClick={()=>setSelectedGroup(g)} style={{background:selectedGroup===g?"rgba(255,215,0,.18)":"transparent",color:selectedGroup===g?"#FFD700":"rgba(255,255,255,.45)",borderColor:selectedGroup===g?"rgba(255,215,0,.5)":"rgba(255,255,255,.15)"}}>Gr. {g}</button>
                ))}
              </div>
            )}
            {isKnockoutPhase(selectedPhase)&&<div style={{background:"rgba(116,172,223,.08)",border:"1px solid rgba(116,172,223,.2)",borderRadius:10,padding:"8px 14px",marginBottom:12,fontSize:12,color:"rgba(116,172,223,.8)"}}>⏱️ Cargá el resultado a 120 minutos (incluye alargue)</div>}
            {matchesForPhase(selectedPhase).map(m=>{
              const real=results[m.id]||{};
              return <MatchCard key={m.id} match={m} pred={{}} real={real} locked={false} isAdmin={true}
                onPredChange={()=>{}} onResultChange={(side,val)=>setResult(m.id,side,val)}/>;
            })}
          </div>
        )}

        {/* ── ADMIN: EQUIPOS KO ─────────────────────────────── */}
        {activeTab==="slots"&&currentUser?.isAdmin&&(
          <div style={{animation:"slideUp .4s ease-out"}}>
            <div style={{textAlign:"center",marginBottom:18}}>
              <h2 style={{fontFamily:"'Bangers',cursive",color:"#FFD700",fontSize:26,letterSpacing:2}}>🔧 EQUIPOS ELIMINATORIAS</h2>
              <p style={{color:"rgba(255,255,255,.4)",fontSize:13,marginTop:4}}>Completá los equipos clasificados. Los participantes podrán pronosticar una vez que los cargues.</p>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}}>
              {["r32","r16","qf","sf","3rd","final"].map(ph=>(
                <button key={ph} className="phase-btn" onClick={()=>setSelectedPhase(ph)} style={{background:selectedPhase===ph?"rgba(255,215,0,.18)":"transparent",color:selectedPhase===ph?"#FFD700":"rgba(255,255,255,.45)",borderColor:selectedPhase===ph?"rgba(255,215,0,.5)":"rgba(255,255,255,.15)"}}>
                  {PHASE_LABELS[ph]}
                </button>
              ))}
            </div>
            {knockoutMatches.filter(m=>m.phase===selectedPhase).map(m=>{
              const {label,time}=toBsAs(m.date);
              return (
                <div key={m.id} className="match-card glass" style={{borderColor:"rgba(255,215,0,.12)"}}>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:10,fontWeight:600,display:"flex",gap:8,flexWrap:"wrap"}}>
                    <span>{label}</span>
                    <span style={{color:"#FFD700"}}>{time} hs</span>
                    <span style={{color:"rgba(255,255,255,.2)"}}>·</span>
                    <span>{m.label}</span>
                    <span style={{color:"rgba(255,255,255,.2)"}}>·</span>
                    <span>{m.venue}</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"end"}}>
                    <div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:4}}>Local — <span style={{color:"rgba(255,215,0,.5)"}}>{m.homeSlot}</span></div>
                      <input className="slot-input" list={`h-${m.id}`} value={m.home||""} onChange={e=>setKnockoutTeam(m.id,"home",e.target.value)} placeholder="Escribí el equipo..."/>
                      <datalist id={`h-${m.id}`}>{ALL_TEAMS.map(t=><option key={t} value={t}/>)}</datalist>
                    </div>
                    <div style={{textAlign:"center",color:"rgba(255,255,255,.3)",fontSize:16,fontWeight:800,paddingBottom:8}}>vs</div>
                    <div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:4}}>Visitante — <span style={{color:"rgba(255,215,0,.5)"}}>{m.awaySlot}</span></div>
                      <input className="slot-input" list={`a-${m.id}`} value={m.away||""} onChange={e=>setKnockoutTeam(m.id,"away",e.target.value)} placeholder="Escribí el equipo..."/>
                      <datalist id={`a-${m.id}`}>{ALL_TEAMS.map(t=><option key={t} value={t}/>)}</datalist>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── ADMIN: CAMPEÓN ────────────────────────────────── */}
        {activeTab==="champAdmin"&&currentUser?.isAdmin&&(
          <div style={{animation:"slideUp .4s ease-out"}}>
            <div style={{textAlign:"center",marginBottom:22}}>
              <div style={{fontSize:48}}>🏆</div>
              <h2 style={{fontFamily:"'Bangers',cursive",color:"#FFD700",fontSize:30,letterSpacing:2,margin:"10px 0 6px"}}>DEFINIR CAMPEÓN</h2>
              <p style={{color:"rgba(255,255,255,.4)",fontSize:13}}>Cuando Argentina gane, cargalo acá 🇦🇷</p>
            </div>
            {results.champion?(
              <div style={{background:"rgba(74,222,128,.08)",border:"1px solid rgba(74,222,128,.3)",borderRadius:16,padding:"18px 20px",textAlign:"center",marginBottom:18}}>
                <div style={{fontSize:42}}>{FLAGS[results.champion]||""}</div>
                <div style={{fontFamily:"'Bangers',cursive",color:"#4ade80",fontSize:26,letterSpacing:1,marginTop:4}}>{results.champion} — Campeón 🎉</div>
                <button onClick={()=>setChampionResult("")} style={{marginTop:12,background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.35)",borderRadius:10,color:"#f87171",padding:"7px 18px",cursor:"pointer",fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700}}>Cambiar</button>
              </div>
            ):(
              <>
                <input value={champSearch} onChange={e=>setChampSearch(e.target.value)} placeholder="🔍 Buscar selección..." style={{...inp(),marginBottom:12}}/>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:8}}>
                  {filteredTeams.map(team=>(
                    <button key={team} className="team-picker-btn" onClick={()=>setChampionResult(team)}>
                      <span style={{fontSize:22}}>{FLAGS[team]}</span><span style={{flex:1,textAlign:"left"}}>{team}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            <div style={{marginTop:26}}>
              <h3 style={{color:"rgba(255,255,255,.5)",fontFamily:"'Bangers',cursive",letterSpacing:1,fontSize:18,marginBottom:12}}>PRONÓSTICOS DE LA FAMILIA</h3>
              {users.filter(u=>!u.isAdmin).length===0&&<p style={{color:"rgba(255,255,255,.25)",fontSize:13}}>Sin participantes aún.</p>}
              {users.filter(u=>!u.isAdmin).map(u=>{
                const pick=predictions[u.username]?.champion;
                return (
                  <div key={u.username} className="glass" style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderRadius:12,marginBottom:6}}>
                    <div style={{color:"#fff",fontWeight:700,flex:1,fontSize:14}}>{u.username}</div>
                    {pick?<div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:20}}>{FLAGS[pick]||""}</span><span style={{color:"rgba(255,255,255,.65)",fontSize:13}}>{pick}</span></div>:<span style={{color:"rgba(255,255,255,.25)",fontSize:13}}>Sin pronóstico</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
