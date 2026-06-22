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
Deep Squat Hold|mobility|bodyweight|beg|hips
Air Squat|squat|bodyweight|beg|quads,glutes
Jump Squat|squat|bodyweight|int|quads,glutes
Split Squat|squat|bodyweight|beg|quads,glutes
Step-Up|squat|bodyweight|beg|quads,glutes
Wall Sit|squat|bodyweight|beg|quads
Shrimp Squat|squat|bodyweight|adv|quads
Sissy Squat|squat|bodyweight|adv|quads
Cossack Squat|squat|bodyweight|int|quads,adductors
Skater Squat|squat|bodyweight|adv|quads,glutes
High-Bar Back Squat|squat|barbell|int|quads,glutes
Low-Bar Back Squat|squat|barbell|int|glutes,hams
Safety Bar Squat|squat|barbell|int|quads,glutes
Zercher Squat|squat|barbell|adv|quads,core
Tempo Back Squat|squat|barbell|int|quads,glutes
Landmine Squat|squat|barbell|beg|quads,glutes
Belt Squat|squat|machine|int|quads,glutes
Hatfield Squat|squat|machine|int|quads,glutes
Spanish Squat|squat|band|beg|quads
KB Goblet Squat|squat|kettlebell|beg|quads,glutes
KB Front Squat|squat|kettlebell|int|quads,core
DB Step-Up|squat|dumbbell|beg|quads,glutes
Lateral Lunge|squat|dumbbell|int|quads,adductors
Curtsy Lunge|squat|dumbbell|int|glutes,quads
Heel-Elevated Goblet Squat|squat|dumbbell|beg|quads
Glute Bridge|hinge|bodyweight|beg|glutes
Single-Leg Glute Bridge|hinge|bodyweight|beg|glutes
Hip Hinge (Dowel)|hinge|bodyweight|beg|hams,glutes
Nordic Hamstring Curl|hinge|bodyweight|adv|hams
Single-Leg RDL (Bodyweight)|hinge|bodyweight|int|hams,glutes
Reverse Hyperextension|hinge|bodyweight|int|glutes,lower back
Single-Leg RDL (DB)|hinge|dumbbell|int|hams,glutes
B-Stance RDL|hinge|dumbbell|int|hams,glutes
DB Hip Thrust|hinge|dumbbell|beg|glutes
Single-Leg Hip Thrust|hinge|bodyweight|int|glutes
KB Deadlift|hinge|kettlebell|beg|hams,glutes
KB Single-Leg Deadlift|hinge|kettlebell|int|hams,glutes
KB Clean|hinge|kettlebell|int|glutes,traps
KB Snatch|hinge|kettlebell|adv|glutes,shoulders
Snatch-Grip Deadlift|hinge|barbell|adv|back,hams
Deficit Deadlift|hinge|barbell|adv|hams,glutes,back
Stiff-Leg Deadlift|hinge|barbell|int|hams,glutes
Banded Hip Thrust|hinge|band|beg|glutes
Glute Ham Raise|hinge|machine|adv|hams,glutes
Hip Adduction|hinge|machine|beg|adductors
Hip Abduction|hinge|machine|beg|glutes
Incline Push-Up|push|bodyweight|beg|chest,triceps
Knee Push-Up|push|bodyweight|beg|chest,triceps
Decline Push-Up|push|bodyweight|int|upper chest,triceps
Diamond Push-Up|push|bodyweight|int|triceps,chest
Archer Push-Up|push|bodyweight|adv|chest,triceps
Pike Push-Up|push|bodyweight|int|shoulders,triceps
Handstand Push-Up|push|bodyweight|adv|shoulders,triceps
Pseudo Planche Push-Up|push|bodyweight|adv|chest,shoulders
Spoto Press|push|barbell|int|chest,triceps
Larsen Press|push|barbell|int|chest,triceps
Pin Press|push|barbell|int|chest,triceps
Z Press|push|barbell|adv|shoulders,core
Behind-the-Neck Press|push|barbell|adv|shoulders
Landmine Press|push|barbell|int|shoulders,chest
DB Floor Press|push|dumbbell|beg|chest,triceps
DB Z Press|push|dumbbell|int|shoulders,core
Neutral-Grip DB Press|push|dumbbell|beg|chest,triceps
DB Front Raise|push|dumbbell|beg|front delts
DB Pullover|push|dumbbell|int|chest,lats
Tate Press|push|dumbbell|int|triceps
KB Overhead Press|push|kettlebell|int|shoulders,triceps
KB Floor Press|push|kettlebell|beg|chest,triceps
KB Push Press|push|kettlebell|adv|shoulders
KB Z Press|push|kettlebell|adv|shoulders,core
Cable Lateral Raise|push|cable|beg|side delts
Cable Overhead Press|push|cable|int|shoulders
Cable Crossover|push|cable|beg|chest
Pec Deck|push|machine|beg|chest
Machine Shoulder Press|push|machine|beg|shoulders
Machine Lateral Raise|push|machine|beg|side delts
Smith Machine Press|push|machine|int|chest,triceps
Scapular Pull-Up|pull|bodyweight|beg|lats,traps
Negative Pull-Up|pull|bodyweight|beg|lats,biceps
Archer Pull-Up|pull|bodyweight|adv|lats,biceps
Commando Pull-Up|pull|bodyweight|adv|lats,biceps
Towel Row|pull|bodyweight|int|back,grip
Yates Row|pull|barbell|int|back
Meadows Row|pull|barbell|adv|back
Seal Row|pull|barbell|int|back
Snatch-Grip Row|pull|barbell|adv|back,traps
Reverse-Grip Row|pull|barbell|int|back,biceps
Preacher Curl|pull|barbell|beg|biceps
Reverse Curl|pull|barbell|beg|forearms,biceps
Chest-Supported DB Row|pull|dumbbell|beg|back
Incline DB Curl|pull|dumbbell|beg|biceps
DB Shrug|pull|dumbbell|beg|traps
DB Rear Delt Fly|pull|dumbbell|beg|rear delts
DB Pullover (Lats)|pull|dumbbell|int|lats
DB Preacher Curl|pull|dumbbell|beg|biceps
Concentration Curl|pull|dumbbell|beg|biceps
Spider Curl|pull|dumbbell|int|biceps
KB Row|pull|kettlebell|beg|back
KB High Pull|pull|kettlebell|int|traps,back
KB Upright Row|pull|kettlebell|int|traps,delts
KB Gorilla Row|pull|kettlebell|int|back
Straight-Arm Pulldown|pull|cable|beg|lats
Cable Hammer Curl|pull|cable|beg|biceps,forearms
Reverse-Grip Pulldown|pull|cable|beg|lats,biceps
Cable Rear Delt Fly|pull|cable|beg|rear delts
Machine Row|pull|machine|beg|back
Machine Pulldown|pull|machine|beg|lats
Machine Rear Delt|pull|machine|beg|rear delts
Dead Bug|core|bodyweight|beg|core
Bird Dog|core|bodyweight|beg|core,lower back
Crunch|core|bodyweight|beg|abs
Glute Bridge March|core|bodyweight|beg|core,glutes
Standing Oblique Crunch|core|bodyweight|beg|obliques
Heel Tap|core|bodyweight|beg|abs
Modified Side Plank|core|bodyweight|beg|obliques
Seated Knee Tuck|core|bodyweight|beg|abs
Hollow Hold|core|bodyweight|int|core
Russian Twist|core|bodyweight|int|obliques
Bicycle Crunch|core|bodyweight|int|abs,obliques
Mountain Climber|core|bodyweight|int|core
Plank Shoulder Tap|core|bodyweight|int|core
V-Up|core|bodyweight|int|abs
Flutter Kick|core|bodyweight|int|abs
Side Plank Reach-Through|core|bodyweight|int|obliques
Hanging Knee Raise|core|bodyweight|int|core
Cable Woodchop|core|cable|int|obliques
Weighted Russian Twist|core|dumbbell|int|obliques
Hollow Rock|core|bodyweight|adv|core
Dragon Flag|core|bodyweight|adv|core
L-Sit|core|bodyweight|adv|core
Toes-to-Bar|core|bodyweight|adv|core
Windshield Wiper|core|bodyweight|adv|obliques
Weighted Plank|core|bodyweight|adv|core
Standing Ab Wheel|core|bodyweight|adv|core
GHD Sit-Up|core|machine|adv|core
KB Windmill|core|kettlebell|adv|obliques,shoulders
KB Farmer Carry|carry|kettlebell|beg|grip,core
KB Goblet Carry|carry|kettlebell|beg|core,grip
Overhead Carry|carry|dumbbell|int|shoulders,core
Waiter Walk|carry|kettlebell|int|shoulders,core
Mixed Carry|carry|dumbbell|int|core,grip
Sandbag Carry|carry|bodyweight|int|core,grip
KB Turkish Get-Up|carry|kettlebell|adv|core,shoulders
Preacher Curl (Machine)|acc|machine|beg|biceps
Overhead Tricep Extension|acc|dumbbell|beg|triceps
DB Skullcrusher|acc|dumbbell|int|triceps
JM Press|acc|barbell|adv|triceps
Cable Overhead Tricep Ext|acc|cable|beg|triceps
Wrist Curl|acc|dumbbell|beg|forearms
Reverse Wrist Curl|acc|dumbbell|beg|forearms
Tibialis Raise|acc|bodyweight|beg|shins
Bodyweight Calf Raise|acc|bodyweight|beg|calves
Donkey Calf Raise|acc|machine|int|calves
Ski Erg|condition|machine|beg|conditioning
Echo Bike|condition|machine|int|conditioning
Sled Drag|condition|machine|int|conditioning
Prowler Push|condition|machine|int|conditioning
Jumping Jacks|condition|bodyweight|beg|conditioning
High Knees|condition|bodyweight|beg|conditioning
Double-Unders|condition|bodyweight|int|conditioning
Shuttle Run|condition|bodyweight|int|conditioning
Stair Climber|condition|machine|beg|conditioning
Bear Crawl|condition|bodyweight|int|core,conditioning
Broad Jump|condition|bodyweight|int|power
Mountain Climbers (Cardio)|condition|bodyweight|beg|conditioning
90/90 Hip Switch|mobility|bodyweight|beg|hips
Ankle Dorsiflexion Drill|mobility|bodyweight|beg|ankles
Banded Shoulder Dislocate|mobility|band|beg|shoulders
Hip Flexor Stretch|mobility|bodyweight|beg|hips
Hamstring Stretch|mobility|bodyweight|beg|hams
Child's Pose|mobility|bodyweight|beg|spine
Downward Dog|mobility|bodyweight|beg|posterior chain
Spiderman Lunge|mobility|bodyweight|beg|hips
Scapular Wall Slide|mobility|bodyweight|beg|shoulders
Wrist Mobility Flow|mobility|bodyweight|beg|wrists
Power Clean|pull|barbell|adv|traps,glutes
Hang Power Clean|pull|barbell|adv|traps,glutes
Squat Clean|pull|barbell|adv|quads,traps
Snatch|pull|barbell|adv|shoulders,glutes
Power Snatch|pull|barbell|adv|shoulders,glutes
Overhead Squat|squat|barbell|adv|quads,shoulders
Clean and Jerk|pull|barbell|adv|traps,shoulders
Push Jerk|push|barbell|adv|shoulders,triceps`;
const LV={beg:"beginner",int:"intermediate",adv:"advanced"};
const BASE=_EX.split("\n").map((l,i)=>{const[n,p,e,lv,m]=l.split("|");return{id:"e"+i,n,p,e,lv:LV[lv],m:m.split(",")};});
// EX / EXBYID are LIVE bindings. Base movements are fixed; coach-defined custom
// exercises are merged in at runtime via setCustomExercises / addCustomToRegistry.
export let EX=BASE.slice();
export let EXBYID=Object.fromEntries(EX.map(e=>[e.id,e]));
let CUSTOM=[];
const mapCustom=r=>({id:r.id,n:r.name,p:r.pattern,e:r.equip,lv:r.level,m:String(r.muscles||"").split(",").map(s=>s.trim()).filter(Boolean),custom:true});
function rebuild(){EX=BASE.concat(CUSTOM);EXBYID=Object.fromEntries(EX.map(e=>[e.id,e]));}
export function setCustomExercises(rows){CUSTOM=(rows||[]).map(mapCustom);rebuild();}
export function addCustomToRegistry(row){const ex=mapCustom(row);CUSTOM=[...CUSTOM,ex];rebuild();return ex;}
export function removeCustomFromRegistry(id){CUSTOM=CUSTOM.filter(e=>e.id!==id);rebuild();}
export const ID=n=>{const x=EX.find(e=>e.n===n);return x?x.id:null;};
export const PATS=["squat","hinge","push","pull","carry","core","acc","condition","mobility"];
export const PATL={squat:"Squat",hinge:"Hinge",push:"Push",pull:"Pull",carry:"Carry",core:"Core",acc:"Accessory",condition:"Conditioning",mobility:"Mobility"};
export const EQUIP=["barbell","dumbbell","cable","machine","bodyweight","kettlebell","band"];
export const LEVELS=["beginner","intermediate","advanced"];
export const LDOT={beginner:"#3AE07A",intermediate:"#FFB23A",advanced:"#FF4D4D"};
