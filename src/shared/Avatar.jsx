// shared/Avatar.jsx — initials chip (was Av in the monolith)
export default function Avatar({txt,c,size=22}){return(<span className="av" style={{width:size,height:size,fontSize:size*.42,background:c+"22",color:c}}>{txt}</span>);}
