// constants/modalities.js — training modality metadata + lookup
export const MODALITIES=[
  {id:"straight",label:"Straight Sets",short:"Straight",color:"#807E76",desc:"Standard sets with full rest between."},
  {id:"superset",label:"Superset",short:"Superset",color:"#3AE0FF",desc:"Paired back-to-back with its group partner, minimal rest."},
  {id:"triset",label:"Tri-Set / Giant",short:"Tri-Set",color:"#A78BFA",desc:"Three or more movements cycled with little rest."},
  {id:"dropset",label:"Drop Set",short:"Drop Set",color:"#FF3A8E",desc:"Strip weight at the last set and keep going to failure."},
  {id:"restpause",label:"Rest-Pause",short:"Rest-Pause",color:"#FFB23A",desc:"Short ~15s rests inside the final set to extend reps."},
  {id:"cluster",label:"Cluster Set",short:"Cluster",color:"#9EFF3A",desc:"10-20s intra-set rest between mini-clusters of reps."},
  {id:"amrap",label:"AMRAP Finisher",short:"AMRAP",color:"#FF6B2C",desc:"Final set is max quality reps at the target effort."},
  {id:"emom",label:"EMOM",short:"EMOM",color:"#34D399",desc:"Every minute on the minute - set reps, rest the remainder."},
  {id:"tempo",label:"Tempo",short:"Tempo",color:"#3AE0FF",desc:"Controlled tempo - use the tempo field (ecc-pause-con-pause)."},
  {id:"isometric",label:"Isometric Hold",short:"Iso Hold",color:"#A78BFA",desc:"Time-under-tension hold instead of counted reps."},
  {id:"circuit",label:"Conditioning Circuit",short:"Circuit",color:"#FF4D4D",desc:"Cycled for rounds or time as conditioning."}
];
export const MODBYID=Object.fromEntries(MODALITIES.map(m=>[m.id,m]));
export const modOf=x=>MODBYID[(x&&x.mod)||"straight"]||MODBYID.straight;
