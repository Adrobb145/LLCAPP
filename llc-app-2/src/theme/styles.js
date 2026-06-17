// theme/styles.js — coach Coach-OS stylesheet + font import
export const CSS=`
*{box-sizing:border-box;}
.app{display:grid;grid-template-columns:210px 1fr;height:100vh;width:100%;max-width:1024px;margin-left:auto;margin-right:auto;background:#0B0B0C;color:#F5F4F0;font-family:'Inter Tight',-apple-system,system-ui,sans-serif;font-size:13.5px;line-height:1.4;}
.mono{font-family:'JetBrains Mono',ui-monospace,monospace;font-variant-numeric:tabular-nums;}
.sidebar{background:#131315;border-right:1px solid #2A2A2F;display:flex;flex-direction:column;padding:16px 12px;gap:18px;overflow-y:auto;}
.brand{display:flex;align-items:center;gap:9px;padding:0 4px 4px;}
.brand-mark{width:28px;height:28px;background:#FF6B2C;color:#0B0B0C;display:flex;align-items:center;justify-content:center;font-family:'Archivo Black',sans-serif;font-size:12px;border-radius:5px;}
.brand-name{font-family:'Archivo Black',sans-serif;font-size:15px;letter-spacing:.02em;line-height:1;}
.brand-sub{font-size:11px;color:#807E76;letter-spacing:.14em;text-transform:uppercase;margin-top:2px;}
.sb-lbl{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#54534D;padding:0 8px 6px;font-weight:600;}
.sb-nav{display:flex;flex-direction:column;gap:1px;}
.sb-item{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:6px;color:#B5B3AB;font-size:12.5px;font-weight:500;cursor:pointer;border:0;background:transparent;text-align:left;width:100%;font-family:inherit;}
.sb-item:hover{background:#1A1A1D;color:#F5F4F0;}
.sb-item[data-on="true"]{background:#232327;color:#F5F4F0;}
.sb-item-ct{margin-left:auto;font-size:11px;color:#807E76;}
.sb-cl{display:flex;flex-direction:column;gap:1px;max-height:240px;overflow-y:auto;}
.sb-clrow{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;font-size:12px;color:#B5B3AB;border:0;background:transparent;text-align:left;width:100%;font-family:inherit;}
.sb-clrow:hover{background:#1A1A1D;color:#F5F4F0;}
.sb-clrow[data-on="true"]{background:#232327;color:#F5F4F0;}
.av{border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;}
.coachftr{margin-top:auto;padding:10px 8px 0;border-top:1px solid #2A2A2F;display:flex;align-items:center;gap:9px;}
.main{display:flex;flex-direction:column;overflow:hidden;min-width:0;}
.topbar{height:50px;border-bottom:1px solid #2A2A2F;display:flex;align-items:center;padding:0 18px;gap:12px;flex-shrink:0;}
.crumbs{display:flex;align-items:center;gap:7px;font-size:12.5px;color:#807E76;}
.crumbs b{color:#F5F4F0;font-weight:600;}
.crumbs span.sep{color:#54534D;}
.content{flex:1;overflow-y:auto;overflow-x:hidden;}
.btn{border:0;background:#FF6B2C;color:#0B0B0C;font-family:inherit;font-weight:700;font-size:11.5px;letter-spacing:.02em;text-transform:uppercase;padding:8px 13px;border-radius:4px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}
.btn:hover{filter:brightness(1.06);}
.btn.sec{background:#1A1A1D;color:#F5F4F0;border:1px solid #2A2A2F;}
.btn.sec:hover{background:#232327;}
.btn.sm{padding:5px 9px;font-size:11px;}
.btn.gho{background:transparent;color:#B5B3AB;}
.btn.gho:hover{background:#1A1A1D;color:#F5F4F0;}
.btn.dgr{background:#FF4D4D;color:#fff;}
.kick{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#807E76;font-weight:600;}
.pill{display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:3px;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;background:#232327;color:#B5B3AB;}
.field{background:#1A1A1D;border:1px solid #2A2A2F;border-radius:5px;padding:7px 9px;color:#F5F4F0;font-family:inherit;font-size:12.5px;outline:none;}
.field:focus{border-color:#36363C;}
.roster{padding:24px 28px 60px;max-width:1500px;}
.rhead{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:22px;}
.rtitle{font-family:'Archivo Black',sans-serif;font-size:32px;line-height:1;letter-spacing:-.01em;}
.rsub{font-size:12px;color:#807E76;margin-top:6px;}
.rstats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:22px;}
.stat{background:#131315;border:1px solid #2A2A2F;border-radius:6px;padding:13px 15px;display:flex;flex-direction:column;gap:3px;}
.stat-l{font-size:11px;color:#807E76;letter-spacing:.12em;text-transform:uppercase;font-weight:600;}
.stat-v{font-family:'Archivo Black',sans-serif;font-size:28px;line-height:1;letter-spacing:-.02em;}
.cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px;}
.ccard{background:#131315;border:1px solid #2A2A2F;border-radius:6px;padding:15px;cursor:pointer;position:relative;overflow:hidden;}
.ccard:hover{border-color:#36363C;transform:translateY(-1px);}
.ccard-ac{position:absolute;left:0;top:0;bottom:0;width:3px;}
.cc-head{display:flex;align-items:center;gap:10px;margin-bottom:11px;}
.cc-name{font-weight:600;font-size:14px;}
.cc-goal{font-size:11px;color:#807E76;margin-top:1px;}
.cc-block{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#B5B3AB;font-weight:600;padding:5px 0;border-top:1px solid #2A2A2F;border-bottom:1px solid #2A2A2F;margin-bottom:10px;display:flex;justify-content:space-between;}
.cc-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}
.ccs-l{font-size:11px;color:#807E76;letter-spacing:.08em;text-transform:uppercase;font-weight:600;margin-bottom:2px;}
.ccs-v{font-family:'Archivo Black',sans-serif;font-size:17px;line-height:1;}
.ccs-u{font-size:11px;color:#807E76;font-weight:400;margin-left:2px;}
.abar{height:4px;background:#232327;border-radius:2px;overflow:hidden;margin-top:4px;}
.afill{height:100%;background:#FF6B2C;border-radius:2px;}
.sheetwrap{display:grid;grid-template-columns:1fr 300px;height:100%;overflow:hidden;}
.sheetmain{overflow-y:auto;padding:20px 24px 60px;min-width:0;}
.sheetside{border-left:1px solid #2A2A2F;background:#131315;overflow-y:auto;padding:20px 18px 40px;}
.chead{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;gap:16px;}
.chid{display:flex;align-items:center;gap:13px;}
.ch-name{font-family:'Archivo Black',sans-serif;font-size:22px;line-height:1;letter-spacing:-.01em;text-transform:uppercase;}
.ch-goal{font-size:11.5px;color:#807E76;margin-top:4px;}
.chmeta{display:flex;gap:16px;}
.chm{display:flex;flex-direction:column;gap:2px;border-left:1px solid #2A2A2F;padding-left:13px;}
.chm-l{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#807E76;font-weight:600;}
.chm-v{font-family:'Archivo Black',sans-serif;font-size:15px;line-height:1;}
.chm-v small{font-weight:400;font-size:11px;color:#807E76;}
.meso{display:flex;align-items:stretch;gap:10px;margin-bottom:18px;padding:11px 13px;background:#131315;border:1px solid #2A2A2F;border-radius:6px;}
.meso-l{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#807E76;font-weight:600;display:flex;align-items:center;padding-right:12px;border-right:1px solid #2A2A2F;white-space:nowrap;}
.meso-c{display:flex;gap:3px;flex:1;}
.mcell{flex:1;height:22px;border-radius:3px;background:#232327;display:flex;align-items:center;justify-content:center;font-size:11px;font-family:'JetBrains Mono',monospace;color:#807E76;cursor:pointer;border:1px solid transparent;}
.mcell:hover{border-color:#36363C;}
.mcell[data-s="done"]{background:#1A1A1D;color:#B5B3AB;}
.mcell[data-s="cur"]{background:#FF6B2C;color:#0B0B0C;font-weight:700;}
.mcell[data-s="dl"]{background:#1A1A1D;color:#FF6B2C;border-color:#FF6B2C;}
.dtabs{display:flex;border-bottom:1px solid #2A2A2F;}
.dtab{padding:11px 15px;font-size:12.5px;font-weight:600;color:#807E76;cursor:pointer;border:0;background:transparent;font-family:inherit;border-bottom:2px solid transparent;margin-bottom:-1px;display:flex;flex-direction:column;align-items:flex-start;gap:2px;}
.dtab:hover{color:#B5B3AB;}
.dtab[data-on="true"]{color:#F5F4F0;border-bottom-color:#FF6B2C;}
.dtab-d{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#54534D;font-weight:600;}
.dtab[data-on="true"] .dtab-d{color:#FF6B2C;}
.dstat{width:6px;height:6px;border-radius:50%;background:#232327;display:inline-block;margin-left:6px;}
.dstat[data-s="logged"]{background:#3AE07A;}
.dstat[data-s="in"]{background:#FFB23A;}
.sheet{border:1px solid #2A2A2F;border-top:0;border-radius:0 0 6px 6px;overflow-x:auto;background:#131315;}
.shrow,.exrow{display:grid;grid-template-columns:220px 64px 92px 70px repeat(var(--sc,4),100px) 56px;align-items:stretch;min-width:max-content;}
.shrow{background:#1A1A1D;border-bottom:1px solid #2A2A2F;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#807E76;font-weight:600;height:28px;}
.shrow>div{padding:0 8px;border-right:1px solid #2A2A2F;display:flex;align-items:center;}
.shrow>div:last-child{border-right:0;}
.shrow .ctr{justify-content:center;font-family:'JetBrains Mono',monospace;}
.exrow{border-bottom:1px solid #2A2A2F;background:#131315;min-height:54px;}
.exrow:last-child{border-bottom:0;}
.exrow:hover{background:#17171A;}
.exrow>div{padding:8px;border-right:1px solid #2A2A2F;display:flex;flex-direction:column;justify-content:center;}
.exrow>div:last-child{border-right:0;}
.ex-name{font-weight:600;font-size:12.5px;}
.ex-pat{font-size:11px;color:#807E76;letter-spacing:.08em;text-transform:uppercase;margin-top:2px;}
.tcell,.lcell,.scell{align-items:center!important;text-align:center;}
.t-reps{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;}
.t-lbl{font-size:11px;color:#807E76;letter-spacing:.08em;text-transform:uppercase;}
.l-w{font-family:'JetBrains Mono',monospace;font-size:12.5px;}
.l-m{font-size:11px;color:#807E76;margin-top:1px;}
.sgst{background:rgba(255,107,44,.07);}
.s-w{font-family:'JetBrains Mono',monospace;font-size:13px;color:#FF6B2C;font-weight:700;}
.s-l{font-size:11px;color:#FF6B2C;opacity:.8;letter-spacing:.08em;text-transform:uppercase;font-weight:600;}
.setc{align-items:stretch!important;justify-content:stretch!important;padding:0!important;position:relative;}
.setin{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;height:100%;width:100%;padding:4px 4px;cursor:pointer;}
.setc[data-d="true"] .setin{background:rgba(58,224,122,.07);}
.sinp{background:transparent;border:0;color:#F5F4F0;font-family:'JetBrains Mono',monospace;text-align:center;font-size:12.5px;font-weight:600;width:100%;padding:0;outline:none;}
.sinp::-webkit-inner-spin-button,.sinp::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
.setc[data-d="true"] .sinp{color:#3AE07A;}
.smeta{display:flex;align-items:center;justify-content:center;gap:5px;font-size:11px;color:#807E76;font-family:'JetBrains Mono',monospace;}
.scheck{position:absolute;top:3px;right:3px;width:12px;height:12px;border-radius:2px;border:1px solid #36363C;cursor:pointer;display:flex;align-items:center;justify-content:center;background:#131315;font-size:11px;line-height:1;}
.setc[data-d="true"] .scheck{background:#3AE07A;border-color:#3AE07A;color:#0B0B0C;}
.actc{align-items:center!important;justify-content:center;flex-direction:row!important;gap:3px;}
.actb{border:0;background:transparent;color:#807E76;padding:3px;font-size:12px;cursor:pointer;line-height:1;}
.actb:hover{color:#F5F4F0;}
.rnote{background:#1A1A1D;border-bottom:1px solid #2A2A2F;padding:7px 14px;font-size:11px;color:#B5B3AB;display:flex;gap:8px;}
.rnote-l{font-size:11px;color:#807E76;letter-spacing:.08em;text-transform:uppercase;font-weight:700;flex-shrink:0;padding-top:1px;}
.addex{display:flex;align-items:center;gap:8px;padding:12px 14px;border-top:1px solid #2A2A2F;}
.addexb{border:1px dashed #36363C;background:transparent;color:#807E76;padding:7px 12px;border-radius:4px;font-family:inherit;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;cursor:pointer;}
.addexb:hover{border-color:#FF6B2C;color:#FF6B2C;}
.rail{margin-bottom:24px;}
.rail-t{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#807E76;font-weight:700;margin-bottom:9px;display:flex;justify-content:space-between;}
.rcard{background:#1A1A1D;border:1px solid #2A2A2F;border-radius:6px;padding:11px 13px;margin-bottom:8px;}
.spark{height:60px;width:100%;display:block;}
.vrow{display:grid;grid-template-columns:58px 1fr 32px;align-items:center;gap:8px;padding:3px 0;font-size:11px;}
.vrow-l{color:#B5B3AB;}
.vtr{height:7px;background:#232327;border-radius:2px;overflow:hidden;}
.vfl{height:100%;background:#FF6B2C;border-radius:2px;}
.note{padding:9px 11px;border-left:2px solid #FF6B2C;background:#1A1A1D;border-radius:0 4px 4px 0;margin-bottom:6px;font-size:11.5px;line-height:1.5;}
.note-m{display:flex;justify-content:space-between;font-size:11px;color:#807E76;letter-spacing:.06em;text-transform:uppercase;font-weight:600;margin-bottom:3px;}
.ninp{width:100%;background:#1A1A1D;border:1px solid #2A2A2F;border-radius:4px;padding:8px 10px;color:#F5F4F0;font-family:inherit;font-size:11.5px;resize:none;outline:none;}
.lib{padding:24px 28px 60px;max-width:1300px;}
.libf{display:flex;gap:20px;background:#131315;border:1px solid #2A2A2F;border-radius:6px;padding:13px 16px;margin-bottom:16px;flex-wrap:wrap;align-items:flex-start;}
.libfg{display:flex;flex-direction:column;gap:6px;min-width:160px;}
.libfl{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#807E76;font-weight:700;}
.chips{display:flex;gap:4px;flex-wrap:wrap;}
.chip{border:1px solid #36363C;background:transparent;color:#B5B3AB;font-family:inherit;font-size:11px;font-weight:500;padding:4px 9px;border-radius:3px;cursor:pointer;text-transform:capitalize;}
.chip:hover{border-color:#807E76;color:#F5F4F0;}
.chip[data-on="true"]{background:#FF6B2C;color:#0B0B0C;border-color:#FF6B2C;font-weight:700;}
.libsrch{flex:1;min-width:220px;display:flex;flex-direction:column;gap:6px;}
.libgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px;}
.libc{background:#131315;border:1px solid #2A2A2F;border-radius:5px;padding:11px 13px;cursor:pointer;display:flex;flex-direction:column;gap:5px;}
.libc:hover{border-color:#FF6B2C;}
.libc-n{font-weight:600;font-size:12.5px;}
.libc-p{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#FF6B2C;font-weight:700;}
.libc-m{font-size:11px;color:#807E76;}
.mtag{font-size:11px;letter-spacing:.06em;padding:1px 5px;border-radius:2px;background:#232327;color:#807E76;text-transform:capitalize;display:inline-flex;align-items:center;gap:3px;}
.ldot{width:5px;height:5px;border-radius:50%;display:inline-block;}
.povl{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:50;padding:30px;}
.pick{background:#131315;border:1px solid #36363C;border-radius:8px;width:680px;max-width:100%;max-height:84vh;display:flex;flex-direction:column;overflow:hidden;}
.pickh{padding:13px 16px;border-bottom:1px solid #2A2A2F;display:flex;align-items:center;justify-content:space-between;}
.pickt{font-family:'Archivo Black',sans-serif;font-size:15px;}
.pickl{flex:1;overflow-y:auto;padding:8px;}
.pitem{display:grid;grid-template-columns:1fr auto auto;gap:10px;padding:8px 11px;border-radius:4px;cursor:pointer;align-items:center;}
.pitem:hover{background:#1A1A1D;}
.pl{padding:24px 28px 60px;max-width:1500px;}
.plgrid{border:1px solid #2A2A2F;border-radius:6px;overflow:auto;background:#131315;}
.plr{display:grid;align-items:stretch;border-bottom:1px solid #2A2A2F;min-width:max-content;}
.plr:last-child{border-bottom:0;}
.plr>div{padding:7px 9px;border-right:1px solid #2A2A2F;display:flex;flex-direction:column;justify-content:center;min-width:0;}
.plr>div:last-child{border-right:0;}
.plr.head{background:#1A1A1D;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#807E76;font-weight:600;}
.plcell{align-items:center!important;text-align:center;}
.plcell .mono{font-size:12px;}
.plcell[data-cur="true"]{background:rgba(255,107,44,.08);}
.plcell[data-done="true"]{color:#3AE07A;}
.plw{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;}
.plsub{font-size:11px;color:#807E76;margin-top:1px;}
.pbase{width:52px;background:#1A1A1D;border:1px solid #2A2A2F;border-radius:4px;color:#F5F4F0;font-family:'JetBrains Mono',monospace;text-align:center;font-size:12px;padding:3px;outline:none;}
.team{padding:24px 28px 60px;max-width:1100px;}
.tcoach{background:#131315;border:1px solid #2A2A2F;border-radius:7px;padding:14px 16px;margin-bottom:12px;}
.tc-head{display:flex;align-items:center;gap:11px;margin-bottom:11px;}
.tc-clrow{display:flex;align-items:center;gap:9px;padding:7px 9px;background:#1A1A1D;border-radius:5px;margin-bottom:5px;}
.sel{background:#1A1A1D;border:1px solid #2A2A2F;border-radius:5px;color:#F5F4F0;font-family:inherit;font-size:11px;padding:4px 6px;outline:none;cursor:pointer;}
::-webkit-scrollbar{width:9px;height:9px;}
::-webkit-scrollbar-thumb{background:#232327;border:2px solid #0B0B0C;border-radius:5px;}

/* ===== Tablet: 768–1023px (sidebar kept, denser; rail stacks) ===== */
@media (min-width:768px) and (max-width:1023px){
  .app{grid-template-columns:184px 1fr;}
  .sb-item{font-size:12px;padding:8px 9px;}
  .sb-cl{max-height:180px;}
  .roster,.lib,.pl,.team{padding:18px 18px 64px;}
  .rstats{grid-template-columns:repeat(2,1fr);}
  .cgrid{grid-template-columns:repeat(auto-fill,minmax(220px,1fr));}
  .libgrid{grid-template-columns:repeat(auto-fill,minmax(220px,1fr));}
  .sheetwrap{grid-template-columns:1fr;}
  .sheetside{border-left:0;border-top:1px solid #2A2A2F;}
  .sheetmain{padding:18px 18px 60px;}
  .chead{flex-wrap:wrap;gap:10px;}
  .chmeta{flex-wrap:wrap;gap:12px;}
}

/* ===== Mobile: ≤767px (sidebar collapses to a top bar, single column) ===== */
@media (max-width:767px){
  .app{grid-template-columns:1fr;grid-template-rows:auto 1fr;height:100dvh;max-width:100%;}
  .sidebar{flex-direction:row;align-items:center;gap:8px;padding:8px 10px;overflow-x:auto;overflow-y:hidden;border-right:0;border-bottom:1px solid #2A2A2F;}
  .sidebar::-webkit-scrollbar{display:none;}
  .sidebar>div{flex-shrink:0;}
  .brand{padding:0 4px;}
  .brand-sub{display:none;}
  .sb-lbl{display:none;}
  .sb-nav{flex-direction:row;gap:4px;}
  .sb-item{width:auto;white-space:nowrap;padding:7px 11px;}
  .sb-cl{display:none;}
  .coachftr{margin:0;border-top:0;border-left:1px solid #2A2A2F;padding:0 0 0 10px;}
  .coachftr>div{display:none;}
  .roster,.lib,.pl,.team{padding:16px 14px 90px;}
  .rtitle{font-size:23px;}
  .rhead{margin-bottom:16px;flex-wrap:wrap;gap:10px;}
  .rstats{grid-template-columns:repeat(2,1fr);}
  .cgrid{grid-template-columns:1fr;}
  .libgrid{grid-template-columns:1fr;}
  .libf{gap:12px;}
  .topbar{padding:0 12px;padding-top:env(safe-area-inset-top,0);height:auto;min-height:50px;flex-wrap:wrap;}
  .sheetwrap{grid-template-columns:1fr;}
  .sheetside{border-left:0;border-top:1px solid #2A2A2F;}
  .sheetmain{padding:16px 14px 60px;}
  .chead{flex-wrap:wrap;gap:10px;}
  .chmeta{flex-wrap:wrap;gap:12px;}
}
`;

export const FONTS=`@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Archivo+Black&family=JetBrains+Mono:wght@400;500;600;700&display=swap');`;
