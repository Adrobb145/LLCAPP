// shared/PillarRadar.jsx — 7-pillar radar chart
export default function PillarRadar({values,size=220}){
  const cx=size/2,cy=size/2,R=size/2-30,n=values.length;
  const pt=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r];};
  const rings=[.25,.5,.75,1];
  const poly=values.map((v,i)=>pt(i,R*Math.max(.05,v.val)).join(",")).join(" ");
  return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{margin:"4px 0"}}>
    {rings.map((rr,ri)=><polygon key={ri} points={values.map((_,i)=>pt(i,R*rr).join(",")).join(" ")} fill="none" stroke="#2A2A2F" strokeWidth="1"/>)}
    {values.map((_,i)=>{const[x,y]=pt(i,R);return (<line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#2A2A2F" strokeWidth="1"/>);})}
    <polygon points={poly} fill="rgba(255,107,44,.22)" stroke="#FF6B2C" strokeWidth="2"/>
    {values.map((v,i)=>{const[x,y]=pt(i,R*Math.max(.05,v.val));return (<circle key={i} cx={x} cy={y} r="3.5" fill={v.color}/>);})}
    {values.map((v,i)=>{const[x,y]=pt(i,R+15);return (<text key={i} x={x} y={y} fontSize="13" textAnchor="middle" dominantBaseline="middle">{v.label}</text>);})}
  </svg>);
}
