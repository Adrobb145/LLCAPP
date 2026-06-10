// constants/exercises.js — movement library + pattern/equipment/level lookups
const _EX=`Back Squat|squat|barbell|int|quads,glutes
Front Squat|squat|barbell|adv|quads,core
Goblet Squat|squat|dumbbell|beg|quads,glutes
Bulgarian Split Squat|squat|dumbbell|int|quads,glutes
Walking Lunge|squat|dumbbell|int|quads,glutes
Reverse Lunge|squat|dumbbell|beg|quads,glutes
Leg Press|squat|machine|beg|quads,glutes
Hack Squat|squat|machine|int|quads
Box Squat|squat|barbell|int|glutes,hams
Pause Squat|squat|barbell|adv|quads,glutes
Pistol Squat|squat|bodyweight|adv|quads
Leg Extension|acc|machine|beg|quads
Conventional Deadlift|hinge|barbell|adv|hams,glutes,back
Sumo Deadlift|hinge|barbell|adv|glutes,adductors
Romanian Deadlift|hinge|barbell|int|hams,glutes
Trap Bar Deadlift|hinge|barbell|int|quads,glutes,back
Rack Pull|hinge|barbell|int|back,traps
Good Morning|hinge|barbell|int|hams,lower back
Barbell Hip Thrust|hinge|barbell|int|glutes
DB Romanian Deadlift|hinge|dumbbell|beg|hams,glutes
Kettlebell Swing|hinge|kettlebell|int|glutes,hams
Lying Leg Curl|hinge|machine|beg|hams
Seated Leg Curl|hinge|machine|beg|hams
Back Extension|hinge|machine|beg|lower back,glutes
Cable Pull-Through|hinge|cable|beg|glutes,hams
Barbell Bench Press|push|barbell|int|chest,triceps
Incline Barbell Bench|push|barbell|int|upper chest,triceps
Close-Grip Bench|push|barbell|int|triceps,chest
Floor Press|push|barbell|int|triceps,chest
Overhead Press|push|barbell|int|shoulders,triceps
Push Press|push|barbell|adv|shoulders,triceps
DB Bench Press|push|dumbbell|beg|chest,triceps
DB Incline Press|push|dumbbell|beg|upper chest
DB Overhead Press|push|dumbbell|beg|shoulders
Arnold Press|push|dumbbell|int|shoulders
Lateral Raise|push|dumbbell|beg|side delts
Cable Fly|push|cable|beg|chest
Machine Chest Press|push|machine|beg|chest,triceps
Push-Up|push|bodyweight|beg|chest,triceps
Dip|push|bodyweight|int|triceps,chest
Barbell Row|pull|barbell|int|back,biceps
Pendlay Row|pull|barbell|adv|back
T-Bar Row|pull|barbell|int|back
Barbell Shrug|pull|barbell|beg|traps
Barbell Curl|pull|barbell|beg|biceps
EZ-Bar Curl|pull|barbell|beg|biceps
DB Row|pull|dumbbell|beg|back
DB Curl|pull|dumbbell|beg|biceps
Hammer Curl|pull|dumbbell|beg|biceps,forearms
Seated Cable Row|pull|cable|beg|back
Face Pull|pull|cable|beg|rear delts
Cable Curl|pull|cable|beg|biceps
Lat Pulldown|pull|cable|beg|lats
Pull-Up|pull|bodyweight|int|lats,biceps
Chin-Up|pull|bodyweight|int|biceps,lats
Weighted Pull-Up|pull|bodyweight|adv|lats,biceps
Inverted Row|pull|bodyweight|beg|back
Farmer Carry|carry|dumbbell|beg|grip,core
Suitcase Carry|carry|dumbbell|beg|core,grip
Front Rack Carry|carry|kettlebell|int|core,shoulders
Plank|core|bodyweight|beg|core
Side Plank|core|bodyweight|beg|obliques
Hanging Leg Raise|core|bodyweight|int|core
Ab Wheel Rollout|core|bodyweight|int|core
Pallof Press|core|cable|beg|core
Cable Crunch|core|cable|beg|core
Tricep Pushdown|acc|cable|beg|triceps
Rope Tricep Extension|acc|cable|beg|triceps
Skullcrusher|acc|barbell|int|triceps
Standing Calf Raise|acc|machine|beg|calves
Seated Calf Raise|acc|machine|beg|calves
Band Pull-Apart|acc|band|beg|rear delts
Reverse Pec Deck|acc|machine|beg|rear delts
Assault Bike|condition|machine|beg|conditioning
Rowing Erg|condition|machine|beg|conditioning
Sled Push|condition|machine|int|conditioning
Burpee|condition|bodyweight|int|conditioning
Box Jump|condition|bodyweight|int|conditioning
Jump Rope|condition|bodyweight|beg|conditioning
Battle Ropes|condition|bodyweight|beg|conditioning
World's Greatest Stretch|mobility|bodyweight|beg|mobility
Couch Stretch|mobility|bodyweight|beg|hips
Pigeon Stretch|mobility|bodyweight|beg|hips
Thoracic Rotation|mobility|bodyweight|beg|t-spine
Cat-Cow|mobility|bodyweight|beg|spine
Deep Squat Hold|mobility|bodyweight|beg|hips`;
const LV={beg:"beginner",int:"intermediate",adv:"advanced"};
export const EX=_EX.split("\n").map((l,i)=>{const[n,p,e,lv,m]=l.split("|");return{id:"e"+i,n,p,e,lv:LV[lv],m:m.split(",")};});
export const EXBYID=Object.fromEntries(EX.map(e=>[e.id,e]));
export const ID=n=>{const x=EX.find(e=>e.n===n);return x?x.id:null;};
export const PATS=["squat","hinge","push","pull","carry","core","acc","condition","mobility"];
export const PATL={squat:"Squat",hinge:"Hinge",push:"Push",pull:"Pull",carry:"Carry",core:"Core",acc:"Accessory",condition:"Conditioning",mobility:"Mobility"};
export const EQUIP=["barbell","dumbbell","cable","machine","bodyweight","kettlebell","band"];
export const LEVELS=["beginner","intermediate","advanced"];
export const LDOT={beginner:"#3AE07A",intermediate:"#FFB23A",advanced:"#FF4D4D"};
