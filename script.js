/* =========================================
   MASAR — APP LOGIC
========================================= */
const app = document.getElementById("app");
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const read = (key, fallback) => {
  try { const value=localStorage.getItem(key); return value===null?fallback:JSON.parse(value); }
  catch { return fallback; }
};
const write = (key,value) => localStorage.setItem(key,JSON.stringify(value));

let tasks = read("masarTasks",[
  {id:1,name:"Complete my daily goals",completed:false,priority:"Medium",category:"Personal",dueDate:""},
  {id:2,name:"Study for 30 minutes",completed:false,priority:"High",category:"Study",dueDate:""},
  {id:3,name:"Read 10 pages",completed:true,priority:"Low",category:"Personal",dueDate:""}
]);
let xp = Number(read("masarXP",0)) || 0;
let lifetimeCompletions = Number(read("masarCompletedEver",0)) || 0;
let habits = read("masarHabits",[{id:1,name:"Drink enough water",days:[],streak:0},{id:2,name:"Read for 15 minutes",days:[],streak:0}]);
let language = read("masarLanguage","en");
let currentView = "overview";
let initialRender = true;
let calendarDate = new Date();
let selectedCalendarDate = new Date().toISOString().slice(0,10);
let toastTimer;

const translations = {
 en:{overview:"Overview",tasks:"My Tasks",progress:"Progress",calendar:"Calendar",habits:"Habits",achievements:"Achievements",settings:"Settings",menu:"MENU",personal:"PERSONAL",reminder:"YOUR DAILY REMINDER",hero:"Make Today Count! ✨",heroText:"Every small step brings you closer to your dreams. Keep going, you're doing amazing!",overviewTitle:"Your Overview",grow:"Keep growing 🌱",total:"Total Tasks",completed:"Completed Tasks",remaining:"Remaining Tasks",rate:"Completion Rate",todayTasks:"Today's Tasks 📝",addPlaceholder:"Add a new task...",add:"Add",daily:"Daily Completion",motivation:"✨ A Little Motivation",motivationText:"Don't wait for the perfect moment. Start where you are, use what you have, and do what you can.",all:"All",active:"Active",done:"Completed",search:"Search tasks...",priority:"Priority",category:"Category",due:"Due date",high:"High",medium:"Medium",low:"Low",study:"Study",work:"Work",personalCat:"Personal",other:"Other",calendarTitle:"Your Calendar",habitsTitle:"Build Better Habits",achievementsTitle:"Your Achievements",settingsTitle:"Make MASAR Yours",addHabit:"Add Habit",habitPlaceholder:"Name your new habit...",markDone:"Mark today done",doneToday:"Done today ✓",streak:"day streak",level:"Your Level",xp:"XP Points",theme:"Choose your color theme",font:"Choose your font",dark:"Dark mode",language:"Language",taskAdded:"Task Added! 🎯",taskAddedText:"One more step towards your goals.",taskDeleted:"Task Deleted",taskUpdated:"Task Updated ✨",first:"Your Journey Begins! 🌱",firstText:"Your journey has officially begun!",amazing:"Amazing Job! 🎉",amazingText:"You're doing amazing! Keep shining!",allDone:"You Crushed It! 🏆",allDoneText:"You completed all your tasks. What an achievement!",editPrompt:"Edit your task:",deleteConfirm:"Delete this task?",empty:"No tasks here yet. Add one small step 🌱",habitCreated:"Habit created! 🌱",achievementUnlocked:"Achievement unlocked! 🏆"},
 ar:{overview:"الرئيسية",tasks:"مهامي",progress:"تقدّمي",calendar:"التقويم",habits:"عاداتي",achievements:"إنجازاتي",settings:"الإعدادات",menu:"القائمة",personal:"شخصي",reminder:"تذكيرك اليومي",hero:"اجعلي يومك مميزاً! ✨",heroText:"كل خطوة صغيرة تقرّبك من أحلامك. تابعي، أنتِ تقومين بعمل رائع!",overviewTitle:"نظرة عامة",grow:"استمري بالتقدم 🌱",total:"كل المهام",completed:"المهام المكتملة",remaining:"المهام المتبقية",rate:"نسبة الإنجاز",todayTasks:"مهام اليوم 📝",addPlaceholder:"أضيفي مهمة جديدة...",add:"إضافة",daily:"إنجاز اليوم",motivation:"✨ جرعة تحفيز",motivationText:"لا تنتظري اللحظة المثالية. ابدئي من مكانك وبما تملكينه، وافعلي ما تستطيعين.",all:"الكل",active:"قيد التنفيذ",done:"مكتملة",search:"ابحثي عن مهمة...",priority:"الأولوية",category:"التصنيف",due:"تاريخ التسليم",high:"عالية",medium:"متوسطة",low:"منخفضة",study:"دراسة",work:"عمل",personalCat:"شخصي",other:"أخرى",calendarTitle:"التقويم",habitsTitle:"ابني عادات أفضل",achievementsTitle:"إنجازاتك",settingsTitle:"اجعلي مسار يشبهك",addHabit:"إضافة عادة",habitPlaceholder:"اكتبي اسم العادة...",markDone:"أنجزت اليوم",doneToday:"تم اليوم ✓",streak:"أيام متتالية",level:"مستواك",xp:"نقاط الخبرة",theme:"اختاري ألوانك",font:"اختاري الخط",dark:"الوضع الداكن",language:"اللغة",taskAdded:"تمت إضافة المهمة! 🎯",taskAddedText:"خطوة إضافية نحو أهدافك.",taskDeleted:"تم حذف المهمة",taskUpdated:"تم تحديث المهمة ✨",first:"بدأت رحلتك! 🌱",firstText:"هذه أول خطوة في رحلتك!",amazing:"عمل رائع! 🎉",amazingText:"أنتِ تقومين بعمل رائع، تابعي!",allDone:"أنجزتِ كل شيء! 🏆",allDoneText:"أكملتِ كل مهامك اليوم، يا له من إنجاز!",editPrompt:"عدّلي المهمة:",deleteConfirm:"هل تريدين حذف المهمة؟",empty:"لا توجد مهام هنا بعد. أضيفي خطوة صغيرة 🌱",habitCreated:"تمت إضافة العادة! 🌱",achievementUnlocked:"إنجاز جديد! 🏆"},
 fr:{overview:"Aperçu",tasks:"Mes tâches",progress:"Progrès",calendar:"Calendrier",habits:"Habitudes",achievements:"Récompenses",settings:"Paramètres",menu:"MENU",personal:"PERSONNEL",reminder:"RAPPEL QUOTIDIEN",hero:"Faites compter votre journée ! ✨",heroText:"Chaque petit pas vous rapproche de vos rêves. Continuez !",overviewTitle:"Votre aperçu",grow:"Continuez à grandir 🌱",total:"Toutes les tâches",completed:"Tâches terminées",remaining:"Tâches restantes",rate:"Taux de réussite",todayTasks:"Tâches du jour 📝",addPlaceholder:"Ajouter une tâche...",add:"Ajouter",daily:"Progression du jour",motivation:"✨ Un peu de motivation",motivationText:"N'attendez pas le moment parfait. Commencez là où vous êtes.",all:"Toutes",active:"Actives",done:"Terminées",search:"Rechercher...",priority:"Priorité",category:"Catégorie",due:"Échéance",high:"Haute",medium:"Moyenne",low:"Basse",study:"Études",work:"Travail",personalCat:"Personnel",other:"Autre",calendarTitle:"Votre calendrier",habitsTitle:"Créer de meilleures habitudes",achievementsTitle:"Vos réussites",settingsTitle:"Personnalisez MASAR",addHabit:"Ajouter une habitude",habitPlaceholder:"Nom de l'habitude...",markDone:"Fait aujourd'hui",doneToday:"Fait aujourd'hui ✓",streak:"jours de suite",level:"Votre niveau",xp:"Points XP",theme:"Choisir un thème",font:"Choisir une police",dark:"Mode sombre",language:"Langue",taskAdded:"Tâche ajoutée ! 🎯",taskAddedText:"Un pas de plus vers vos objectifs.",taskDeleted:"Tâche supprimée",taskUpdated:"Tâche modifiée ✨",first:"Votre aventure commence ! 🌱",firstText:"Votre parcours vient de commencer !",amazing:"Bravo ! 🎉",amazingText:"Vous faites du très bon travail !",allDone:"Objectifs atteints ! 🏆",allDoneText:"Toutes vos tâches sont terminées !",editPrompt:"Modifier la tâche :",deleteConfirm:"Supprimer cette tâche ?",empty:"Aucune tâche. Ajoutez un petit pas 🌱",habitCreated:"Habitude ajoutée ! 🌱",achievementUnlocked:"Réussite débloquée ! 🏆"}
};
const t = key => (translations[language] && translations[language][key]) || translations.en[key] || key;
const todayKey = () => new Date().toISOString().slice(0,10);
const safe = value => String(value ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function renderShell(){
 applyPreferences();
 app.innerHTML = `
 <div class="dashboard">
  <aside class="sidebar" id="sidebar">
   <div><div class="logo">MAS<span>AR.</span></div><p class="tagline">Your journey starts here.</p></div>
   <nav>
    <p class="nav-title">${t("menu")}</p>
    ${navLink("overview","fa-house","overview")}
    ${navLink("tasks","fa-list-check","tasks")}
    ${navLink("progress","fa-chart-line","progress")}
    ${navLink("calendar","fa-calendar-days","calendar")}
    <p class="nav-title">${t("personal")}</p>
    ${navLink("habits","fa-bullseye","habits")}
    ${navLink("achievements","fa-trophy","achievements")}
   </nav>
   <div class="sidebar-bottom">${navLink("settings","fa-gear","settings")}</div>
  </aside>
  <main class="main-content">
   <header class="topbar">
    <div style="display:flex;align-items:center;gap:10px">
     <button class="icon-button mobile-menu" id="mobileMenu" aria-label="Open menu"><i class="fa-solid fa-bars"></i></button>
     <p class="page-date" id="currentDate"></p>
    </div>
    <div class="top-actions">
     <span class="xp-counter" id="xpCounter">⭐ ${xp} XP</span>
     <select class="language-select" id="languageSelect" aria-label="Language">
      <option value="en" ${language==="en"?"selected":""}>EN</option><option value="ar" ${language==="ar"?"selected":""}>AR</option><option value="fr" ${language==="fr"?"selected":""}>FR</option>
     </select>
     <button class="icon-button" id="themeToggle" aria-label="Toggle dark mode"><i class="fa-solid fa-moon"></i></button>
    </div>
   </header>
   <section class="view active${initialRender?" initial-view":""}" id="view-overview">
    <section class="hero"><div class="hero-content"><p class="hero-label">${t("reminder")}</p><h1>${t("hero")}</h1><p>${t("heroText")}</p></div><div class="hero-emoji">🚀</div><span class="floating-word word-one">Dream Big!</span><span class="floating-word word-two">Keep Going!</span><span class="floating-word word-three">You Got This!</span></section>
    ${statsMarkup()}
    <div class="content-grid">
     <section class="panel" id="overviewTaskPanel">${taskPanelMarkup()}</section>
     <div><section class="panel">${progressMarkup()}</section><section class="motivation-card"><h3>${t("motivation")}</h3><p>${t("motivationText")}</p></section></div>
    </div>
   </section>
   <section class="view" id="view-tasks"><h1 class="page-title">${t("tasks")}</h1><p class="page-subtitle">Organize your day, one step at a time.</p><section class="panel">${taskPanelMarkup(true)}</section></section>
   <section class="view" id="view-progress"><h1 class="page-title">${t("progress")}</h1><p class="page-subtitle">Every completed task is a step forward.</p><section class="panel">${statsMarkup()}${progressMarkup()}<div class="xp-level" style="margin-top:22px" id="levelPanel"></div></section></section>
   <section class="view" id="view-calendar"><h1 class="page-title">${t("calendarTitle")}</h1><p class="page-subtitle">See what's coming up and plan ahead.</p><section class="panel" id="calendarPanel"></section></section>
   <section class="view" id="view-habits"><h1 class="page-title">${t("habitsTitle")}</h1><p class="page-subtitle">Small actions become meaningful routines.</p><section class="panel" id="habitsPanel"></section></section>
   <section class="view" id="view-achievements"><h1 class="page-title">${t("achievementsTitle")}</h1><p class="page-subtitle">Celebrate the progress you've made.</p><div id="achievementsPanel"></div></section>
   <section class="view" id="view-settings"><h1 class="page-title">${t("settingsTitle")}</h1><p class="page-subtitle">Choose the colors, type, and atmosphere that feel right.</p><div class="settings-grid" id="settingsPanel"></div></section>
  </main>
 </div>
 <div id="masarToast" class="masar-toast" role="status" aria-live="polite"></div><div id="confettiContainer" class="confetti-container" aria-hidden="true"></div>`;
 document.documentElement.lang=language;
 document.documentElement.dir=language==="ar"?"rtl":"ltr";
 $("#currentDate").textContent=new Date().toLocaleDateString(language==="ar"?"ar-LB":language==="fr"?"fr-FR":"en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
 $("#languageSelect").addEventListener("change",e=>{language=e.target.value;write("masarLanguage",language);renderShell();navigate(currentView);});
 $("#themeToggle").addEventListener("click",toggleDark);
 $("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
 $$(".nav-link").forEach(link=>link.addEventListener("click",e=>{e.preventDefault();navigate(link.dataset.view);$("#sidebar").classList.remove("open");}));
 renderTaskLists(); renderCalendar(); renderHabits(); renderAchievements(); renderSettings(); renderThemeStudio(); updateLevel();
}
function navLink(view,icon,label){return `<a href="#${view}" data-view="${view}" class="nav-link ${currentView===view?"active":""}"><i class="fa-solid ${icon}"></i>${t(label)}</a>`;}
function statsMarkup(){return `<div class="section-heading"><h2>${t("overviewTitle")}</h2><span>${t("grow")}</span></div><div class="stats-grid"><div class="stat-card"><div class="stat-icon coral-bg"><i class="fa-solid fa-list-check"></i></div><h3 id="totalTasks">0</h3><p>${t("total")}</p></div><div class="stat-card"><div class="stat-icon mint-bg"><i class="fa-solid fa-check"></i></div><h3 id="completedTasks">0</h3><p>${t("completed")}</p></div><div class="stat-card"><div class="stat-icon purple-bg"><i class="fa-solid fa-hourglass-half"></i></div><h3 id="remainingTasks">0</h3><p>${t("remaining")}</p></div><div class="stat-card"><div class="stat-icon yellow-bg"><i class="fa-solid fa-star"></i></div><h3 id="completionRate">0%</h3><p>${t("rate")}</p></div></div>`;}
function taskPanelMarkup(full=false){return `<div class="section-heading"><h2>${t("todayTasks")}</h2><span id="${full?"taskCountFull":"taskCount"}">0 tasks</span></div>
 <form class="task-form" id="${full?"taskFormFull":"taskForm"}"><input id="${full?"taskInputFull":"taskInput"}" type="text" maxlength="120" placeholder="${t("addPlaceholder")}" autocomplete="off" required><button class="add-button" type="submit"><i class="fa-solid fa-plus"></i> ${t("add")}</button></form>
 <div class="task-options"><select id="${full?"priorityFull":"priority"}" class="field"><option value="Medium">${t("medium")} ${t("priority")}</option><option value="High">${t("high")} ${t("priority")}</option><option value="Low">${t("low")} ${t("priority")}</option></select><select id="${full?"categoryFull":"category"}" class="field"><option value="Study">${t("study")}</option><option value="Work">${t("work")}</option><option value="Personal">${t("personalCat")}</option><option value="Other">${t("other")}</option></select><input id="${full?"dueFull":"dueDate"}" class="field" type="date" aria-label="${t("due")}"></div>
 <div class="task-filters"><select class="filter-select" id="${full?"filterFull":"filter"}"><option value="all">${t("all")}</option><option value="active">${t("active")}</option><option value="completed">${t("done")}</option></select><select class="filter-select" id="${full?"categoryFilterFull":"categoryFilter"}"><option value="all">${t("category")}: ${t("all")}</option><option>Study</option><option>Work</option><option>Personal</option><option>Other</option></select><input class="filter-select" style="flex:1" id="${full?"taskSearchFull":"taskSearch"}" placeholder="${t("search")}"></div>
 <div id="${full?"taskListFull":"taskList"}"></div>`;}
function progressMarkup(){return `<div class="section-heading"><h2>${t("progress")}</h2></div><p style="font-size:12px">${t("daily")}</p><div class="progress-track"><div class="progress-fill" id="progressFill"></div></div><div class="progress-info"><span id="progressText">0% completed</span><span>100%</span></div>`;}
function navigate(view){currentView=view;$$(".view").forEach(v=>{v.classList.remove("initial-view");v.classList.toggle("active",v.id===`view-${view}`);});$$(".nav-link").forEach(a=>a.classList.toggle("active",a.dataset.view===view));if(view==="calendar")renderCalendar();if(view==="habits")renderHabits();if(view==="achievements")renderAchievements();if(view==="settings"){renderSettings();renderThemeStudio();}if(view==="progress")updateLevel();window.scrollTo({top:0,behavior:"smooth"});}
function renderTaskLists(){
 const configs=[["taskList","taskForm","taskInput","priority","category","dueDate","filter","categoryFilter","taskSearch","taskCount"],["taskListFull","taskFormFull","taskInputFull","priorityFull","categoryFull","dueFull","filterFull","categoryFilterFull","taskSearchFull","taskCountFull"]];
 configs.forEach(ids=>{
  const [listId,formId,inputId,priorityId,categoryId,dueId,filterId,catFilterId,searchId,countId]=ids;
  const list=$("#"+listId),form=$("#"+formId);if(!list||!form)return;
  if(!form.dataset.bound){form.dataset.bound="1";form.addEventListener("submit",e=>{e.preventDefault();const input=$("#"+inputId);const name=input.value.trim();if(!name){input.focus();return;}tasks.unshift({id:Date.now()+Math.random(),name,completed:false,priority:$("#"+priorityId).value,category:$("#"+categoryId).value,dueDate:$("#"+dueId).value});persistTasks();input.value="";$("#"+dueId).value="";$("#"+priorityId).value="Medium";$("#"+categoryId).value="Study";renderTaskLists();input.focus();toast(t("taskAdded"),t("taskAddedText"));});}
  [filterId,catFilterId,searchId].forEach(id=>{const el=$("#"+id);if(el&&!el.dataset.bound){el.dataset.bound="1";el.addEventListener(id===searchId?"input":"change",()=>renderTaskLists());}});
  const status=$("#"+filterId)?.value||"all",cat=$("#"+catFilterId)?.value||"all",query=($("#"+searchId)?.value||"").toLowerCase();
  const shown=tasks.filter(task=>(status==="all"||(status==="active"&&!task.completed)||(status==="completed"&&task.completed))&&(cat==="all"||task.category===cat)&&task.name.toLowerCase().includes(query));
  list.innerHTML="";
  if(!shown.length){const empty=document.createElement("div");empty.className="empty-tasks";empty.textContent=t("empty");list.append(empty);}
  shown.forEach(task=>{
   const item=document.createElement("div");item.className="task-item"+(task.completed?" completed":"")+(initialRender?" initial-task":"");
   const check=document.createElement("input");check.type="checkbox";check.className="task-check";check.checked=task.completed;check.setAttribute("aria-label","Complete task");check.addEventListener("change",()=>toggleTask(task.id,check.checked));
   const info=document.createElement("div");info.className="task-info";
   const name=document.createElement("span");name.className="task-name";name.textContent=task.name;
   const meta=document.createElement("div");meta.className="task-meta";
   const p=document.createElement("span");p.className="task-badge priority-"+(task.priority||"Medium").toLowerCase();p.textContent=task.priority||"Medium";
   const c=document.createElement("span");c.className="task-badge";c.textContent=task.category||"Personal";meta.append(p,c);
   if(task.dueDate){const d=document.createElement("span");d.className="task-badge";d.textContent="📅 "+task.dueDate;meta.append(d);}
   info.append(name,meta);
   const actions=document.createElement("div");actions.className="task-actions";
   const edit=document.createElement("button");edit.className="task-edit";edit.type="button";edit.innerHTML='<i class="fa-solid fa-pen"></i>';edit.setAttribute("aria-label","Edit task");edit.addEventListener("click",()=>editTask(task.id));
   const del=document.createElement("button");del.className="task-delete";del.type="button";del.innerHTML='<i class="fa-solid fa-trash"></i>';del.setAttribute("aria-label","Delete task");del.addEventListener("click",()=>deleteTask(task.id));
   actions.append(edit,del);item.append(check,info,actions);list.append(item);
  });
  const count=$("#"+countId);if(count)count.textContent=`${shown.length} / ${tasks.length} tasks`;
 });
 updateStats();
}
function persistTasks(){write("masarTasks",tasks);}
function toggleTask(id,checked){const task=tasks.find(x=>x.id===id);if(!task)return;if(checked&&!task.completed){task.completed=true;xp+=10;lifetimeCompletions++;write("masarXP",xp);write("masarCompletedEver",lifetimeCompletions);persistTasks();renderTaskLists();toast(lifetimeCompletions===1?t("first"):tasks.length>0&&tasks.every(x=>x.completed)?t("allDone"):t("amazing"),lifetimeCompletions===1?t("firstText"):tasks.length>0&&tasks.every(x=>x.completed)?t("allDoneText"):t("amazingText")+"  +10 XP ⭐");confetti();checkAchievements();}else{task.completed=checked;persistTasks();renderTaskLists();}}
function editTask(id){const task=tasks.find(x=>x.id===id);if(!task)return;const name=prompt(t("editPrompt"),task.name);if(name===null)return;if(!name.trim()){toast("Task name required");return;}task.name=name.trim();persistTasks();renderTaskLists();toast(t("taskUpdated"));}
function deleteTask(id){if(!confirm(t("deleteConfirm")))return;tasks=tasks.filter(x=>x.id!==id);persistTasks();renderTaskLists();toast(t("taskDeleted"));}
function updateStats(){const total=tasks.length,done=tasks.filter(x=>x.completed).length,rate=total?Math.round(done/total*100):0;["totalTasks"].forEach(id=>{const el=$("#"+id);if(el)el.textContent=total;});const c=$("#completedTasks"),r=$("#remainingTasks"),p=$("#completionRate"),fill=$("#progressFill"),txt=$("#progressText"),xpEl=$("#xpCounter");if(c)c.textContent=done;if(r)r.textContent=total-done;if(p)p.textContent=rate+"%";if(fill)fill.style.width=rate+"%";if(txt)txt.textContent=rate+"% completed";if(xpEl)xpEl.textContent=`⭐ ${xp} XP`;const count=$("#taskCount");if(count)count.textContent=`${total} tasks`;}
function toast(title,message=""){const el=$("#masarToast");if(!el)return;el.replaceChildren();const strong=document.createElement("strong");strong.textContent=title;el.append(strong);if(message){const span=document.createElement("span");span.textContent=message;el.append(span);}el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),3600);}
function confetti(){const box=$("#confettiContainer");["🎉","✨","⭐","💗","🌟","🎊"].forEach(()=>{});for(let i=0;i<25;i++){const bit=document.createElement("span");bit.className="confetti-piece";bit.textContent=["🎉","✨","⭐","💗","🌟"][Math.floor(Math.random()*5)];bit.style.left=Math.random()*100+"vw";bit.style.animationDelay=Math.random()*.7+"s";box.append(bit);setTimeout(()=>bit.remove(),2500);}}
function applySavedMasarCustomColors(){Object.entries(read("masarCustomColors",{})).forEach(([variable,color])=>applyCustomMasarColor(variable,color,false));}
function toggleDark(){document.body.classList.toggle("dark-mode");write("masarTheme",document.body.classList.contains("dark-mode")?"dark":"light");const selected=localStorage.getItem("masarSelectedTheme")||"lavender";if(masarThemes[selected])applyMasarTheme(selected,false);applySavedMasarCustomColors();}
function applyPreferences(){document.body.classList.toggle("dark-mode",read("masarTheme","light")==="dark");const selected=localStorage.getItem("masarSelectedTheme")||"lavender";if(masarThemes[selected])applyMasarTheme(selected,false);const customColors=read("masarCustomColors",{});applySavedMasarCustomColors();const prefs=read("masarPrefs",{});if(prefs.accent&&!localStorage.getItem("masarSelectedTheme")&&!customColors["--accent"]){document.documentElement.style.setProperty("--accent",prefs.accent);document.documentElement.style.setProperty("--coral",prefs.accent);}if(prefs.font){document.documentElement.style.setProperty("--heading",prefs.font);document.documentElement.style.setProperty("--body",prefs.font);}}
function updateLevel(){const el=$("#levelPanel");if(!el)return;const level=Math.floor(xp/100)+1,progress=xp%100;el.innerHTML=`<h3>Level ${level} ✨</h3><p>${xp} ${t("xp")} · ${100-progress} XP to next level</p><div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>`;}
function renderCalendar(){const panel=$("#calendarPanel");if(!panel)return;const year=calendarDate.getFullYear(),month=calendarDate.getMonth(),first=new Date(year,month,1),last=new Date(year,month+1,0),start=first.getDay(),days=last.getDate();const monthName=calendarDate.toLocaleDateString(language==="ar"?"ar-LB":language==="fr"?"fr-FR":"en-US",{month:"long",year:"numeric"});let html=`<div class="calendar-head"><button class="secondary-button" id="prevMonth">‹</button><strong>${monthName}</strong><button class="secondary-button" id="nextMonth">›</button></div><div class="calendar-grid">`;const names=language==="ar"?["ح","ن","ث","ر","خ","ج","س"]:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];names.forEach(n=>html+=`<div class="calendar-day-name">${n}</div>`);for(let i=0;i<start;i++)html+=`<div></div>`;for(let d=1;d<=days;d++){const key=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,has=tasks.some(x=>x.dueDate===key),today=key===todayKey();html+=`<button class="calendar-cell ${today?"today":""} ${selectedCalendarDate===key?"selected":""}" data-date="${key}"><span class="day-number">${d}</span><span class="calendar-dots">${has?'<i class="calendar-dot"></i>':""}</span></button>`;}html+=`</div><div style="margin-top:18px"><strong>${selectedCalendarDate}</strong><div id="calendarDayTasks" class="empty-tasks"></div></div>`;panel.innerHTML=html;$("#prevMonth").onclick=()=>{calendarDate.setMonth(calendarDate.getMonth()-1);renderCalendar();};$("#nextMonth").onclick=()=>{calendarDate.setMonth(calendarDate.getMonth()+1);renderCalendar();};$$("[data-date]",panel).forEach(btn=>btn.onclick=()=>{selectedCalendarDate=btn.dataset.date;renderCalendar();});const dayTasks=tasks.filter(x=>x.dueDate===selectedCalendarDate);$("#calendarDayTasks").textContent=dayTasks.length?dayTasks.map(x=>(x.completed?"✓ ":"• ")+x.name).join(" · "):"No tasks scheduled for this day.";}
function renderHabits(){const panel=$("#habitsPanel");if(!panel)return;panel.innerHTML=`<form class="task-form" id="habitForm"><input id="habitInput" placeholder="${t("habitPlaceholder")}" maxlength="70" required><button class="add-button">${t("addHabit")}</button></form><div class="habit-list" id="habitList"></div>`;$("#habitForm").onsubmit=e=>{e.preventDefault();const name=$("#habitInput").value.trim();if(!name)return;habits.push({id:Date.now(),name,days:[],streak:0});write("masarHabits",habits);renderHabits();toast(t("habitCreated"));};const list=$("#habitList");habits.forEach(h=>{const done=(h.days||[]).includes(todayKey());const card=document.createElement("article");card.className="habit-card";card.innerHTML=`<h3>${safe(h.name)}</h3><p>Build consistency, one day at a time.</p><div class="habit-actions"><span class="streak">🔥 ${h.streak||0} ${t("streak")}</span><button class="habit-check ${done?"done":""}">${done?t("doneToday"):t("markDone")}</button></div>`;card.querySelector("button").onclick=()=>{if(done)return;h.days=h.days||[];h.days.push(todayKey());h.streak=(h.streak||0)+1;write("masarHabits",habits);xp+=5;write("masarXP",xp);renderHabits();updateStats();toast("Habit completed! +5 XP 🌱");};list.append(card);});}
function getAchievements(){return [{id:"first",icon:"🌱",title:"First Step",desc:"Complete your first task.",unlocked:lifetimeCompletions>=1},{id:"five",icon:"🔥",title:"Getting Momentum",desc:"Complete 5 tasks.",unlocked:lifetimeCompletions>=5},{id:"ten",icon:"⭐",title:"Rising Star",desc:"Complete 10 tasks.",unlocked:lifetimeCompletions>=10},{id:"xp100",icon:"🏆",title:"Century Club",desc:"Earn 100 XP.",unlocked:xp>=100},{id:"habit",icon:"🌿",title:"Habit Builder",desc:"Create your first habit.",unlocked:habits.length>=1}];}
function renderAchievements(){const panel=$("#achievementsPanel");if(!panel)return;panel.innerHTML=`<div class="xp-level"><h3>⭐ ${xp} XP</h3><p>${t("level")} ${Math.floor(xp/100)+1} · Keep collecting points!</p></div><div class="achievement-grid"></div>`;const grid=$(".achievement-grid",panel);getAchievements().forEach(a=>{const card=document.createElement("article");card.className="achievement-card"+(a.unlocked?"":" locked");card.innerHTML=`<div class="achievement-icon">${a.icon}</div><h3>${a.title} ${a.unlocked?"✓":"🔒"}</h3><p>${a.desc}</p>`;grid.append(card);});}
function checkAchievements(){renderAchievements();}
function renderSettings(){const panel=$("#settingsPanel");if(!panel)return;panel.replaceChildren();}
function boot(){renderShell();initialRender=false;document.body.classList.remove("is-initializing");if(!localStorage.getItem("masarTasks"))persistTasks();}
/* =========================
   MASAR THEME STUDIO
========================= */

const masarThemes = {
    lavender: {
        name: "Lavender Dream",
        primary: "#9B8AFB",
        secondary: "#D9C8FF",
        accent: "#F3A6D8",
        background: "#F3F0FF",
        surface: "#FFFFFF",
        text: "#39304F"
    },

    peach: {
        name: "Peach Blossom",
        primary: "#FF967D",
        secondary: "#FFD0B8",
        accent: "#FFC46B",
        background: "#FFF1E9",
        surface: "#FFFFFF",
        text: "#573C36"
    },

    mint: {
        name: "Mint Fresh",
        primary: "#55CDB4",
        secondary: "#B5EBDD",
        accent: "#A6B8FF",
        background: "#EAF9F4",
        surface: "#FFFFFF",
        text: "#294B43"
    },

    ocean: {
        name: "Ocean Breeze",
        primary: "#72B9E8",
        secondary: "#B8E2F8",
        accent: "#8B7CF6",
        background: "#EAF5FF",
        surface: "#FFFFFF",
        text: "#29435C"
    },

    candy: {
        name: "Cotton Candy",
        primary: "#EC78B5",
        secondary: "#F8C7E2",
        accent: "#9B8AFB",
        background: "#FFF0F8",
        surface: "#FFFFFF",
        text: "#57334B"
    },

    sunset: {
        name: "Sunset Glow",
        primary: "#FF8B70",
        secondary: "#FFC857",
        accent: "#B58AE8",
        background: "#FFF3E8",
        surface: "#FFFFFF",
        text: "#594035"
    },

    midnight: {
        name: "Midnight Purple",
        primary: "#8B7CF6",
        secondary: "#544A86",
        accent: "#D98FC7",
        background: "#211D32",
        surface: "#302A45",
        text: "#F4EFFC"
    },

    roseGold: {
        name: "Rose Gold",
        primary: "#C77D86",
        secondary: "#E8B9AE",
        accent: "#D6A75C",
        background: "#FBF1EE",
        surface: "#FFFFFF",
        text: "#50383D"
    }
};

function applyMasarTheme(themeKey, persist=true) {
    const theme = masarThemes[themeKey];

    if (!theme) return;

    const root = document.documentElement;
    const dark = document.body.classList.contains("dark-mode");
    const background = dark
        ? `color-mix(in srgb, ${theme.background} 18%, #171426)`
        : theme.background;
    const surface = dark
        ? `color-mix(in srgb, ${theme.surface} 16%, #282534)`
        : theme.surface;
    const softSurface = dark
        ? `color-mix(in srgb, ${theme.secondary} 18%, #353044)`
        : `color-mix(in srgb, ${theme.secondary} 24%, ${theme.surface})`;
    const text = dark
        ? `color-mix(in srgb, ${theme.text} 18%, #F4EFF8)`
        : theme.text;
    const muted = dark
        ? `color-mix(in srgb, ${text} 68%, ${surface})`
        : `color-mix(in srgb, ${text} 62%, ${surface})`;
    const properties = {
        "--primary": theme.primary,
        "--secondary": theme.secondary,
        "--accent": theme.accent,
        "--bg-base": background,
        "--bg": background,
        "--surface": surface,
        "--surface-2": softSurface,
        "--text": text,
        "--text-main": text,
        "--muted": muted,
        "--coral": theme.primary,
        "--purple": theme.secondary,
        "--mint": theme.accent,
        "--yellow": theme.secondary,
        "--blue": theme.secondary,
        "--pink": theme.accent,
        "--cream": background,
        "--peach": theme.secondary,
        "--orb-purple": theme.secondary,
        "--orb-pink": theme.accent,
        "--orb-coral": theme.primary,
        "--orb-mint": theme.accent,
        "--orb-blue": theme.secondary,
        "--hero-heading": text,
        "--hero-copy": text,
        "--hero-label": theme.primary
    };
    Object.entries(properties).forEach(([name, value]) => root.style.setProperty(name, value));

    if (persist) {
        localStorage.setItem("masarSelectedTheme", themeKey);
        localStorage.removeItem("masarCustomColors");
    }
}

function applyCustomMasarColor(variable, color, persist=true) {
    const root = document.documentElement;
    const linkedVariables = {
        "--primary": ["--coral", "--orb-coral"],
        "--secondary": ["--purple", "--blue", "--peach", "--orb-purple", "--orb-blue"],
        "--accent": ["--mint", "--pink", "--orb-pink", "--orb-mint"],
        "--bg-base": ["--bg", "--cream"],
        "--text-main": ["--text"]
    };
    root.style.setProperty(variable, color);
    (linkedVariables[variable] || []).forEach(name => root.style.setProperty(name, color));

    if (!persist) return;
    const customColors = read("masarCustomColors", {});
    customColors[variable] = color;

    localStorage.setItem("masarCustomColors", JSON.stringify(customColors));
}

function restoreMasarTheme() {
    const savedTheme = localStorage.getItem("masarSelectedTheme");

    if (savedTheme && masarThemes[savedTheme]) {
        applyMasarTheme(savedTheme, false);
    }

    const customColors = read("masarCustomColors", {});

    Object.entries(customColors).forEach(([variable, color]) =>
        applyCustomMasarColor(variable, color, false)
    );
}

restoreMasarTheme();
/* =========================
   THEME STUDIO INTERFACE
========================= */

function renderThemeStudio() {
    const settingsPage = document.getElementById("settingsPanel");

    if (!settingsPage) {
        console.warn("MASAR settings section was not found.");
        return;
    }

    if (document.getElementById("themeStudio")) return;

    const studio = document.createElement("section");
    studio.id = "themeStudio";
    studio.className = "theme-studio";

    studio.innerHTML = `
        <h2>🎨 Make MASAR Yours</h2>
        <p class="theme-description">
            Choose your favorite colors and create your own atmosphere.
        </p>

        <h3>Choose Your Theme</h3>

        <div class="theme-grid" id="themeGrid">
            ${Object.entries(masarThemes).map(([key, theme]) => `
                <button class="theme-card" type="button"
                    data-theme="${key}">
                    <div class="theme-swatches">
                        <span style="background:${theme.primary}"></span>
                        <span style="background:${theme.secondary}"></span>
                        <span style="background:${theme.accent}"></span>
                    </div>
                    <strong>${theme.name}</strong>
                </button>
            `).join("")}
        </div>

        <div class="theme-section">
            <h3>🖌️ Custom Colors</h3>

            <div class="theme-color-controls">
                <label class="theme-color-option">
                    Main Color
                    <input type="color" data-variable="--primary"
                        value="#9B8AFB">
                </label>

                <label class="theme-color-option">
                    Secondary Color
                    <input type="color" data-variable="--secondary"
                        value="#D9C8FF">
                </label>

                <label class="theme-color-option">
                    Accent Color
                    <input type="color" data-variable="--accent"
                        value="#F3A6D8">
                </label>

                <label class="theme-color-option">
                    Background
                    <input type="color" data-variable="--bg-base"
                        value="#F3F0FF">
                </label>
                <label class="theme-color-option">
                    Card Background
                    <input type="color" data-variable="--surface"
                        value="#FFFFFF">
                </label>
                <label class="theme-color-option">
                    Text Color
                    <input type="color" data-variable="--text-main"
                        value="#39304F">
                </label>
            </div>
        </div>

        <div class="theme-section">
            <h3>🌌 Background Style</h3>
            <select class="theme-select" id="masarBackgroundStyle">
                <option value="dreamy-pastel">Dreamy pastel</option>
                <option value="soft-gradient">Soft gradient</option>
                <option value="aurora-glow">Aurora glow</option>
                <option value="glass">Glass background</option>
                <option value="three-d">3D floating shapes</option>
            </select>
        </div>

        <div class="theme-section">
            <h3>🌗 Appearance</h3>
            <select class="theme-select" id="masarAppearance">
                <option value="light">Light mode</option>
                <option value="dark">Dark mode</option>
            </select>
        </div>

        <div class="theme-section">
            <h3>✍️ Font Style</h3>
            <select class="theme-select" id="masarFont">
                <option value="'Outfit', sans-serif">Outfit</option>
                <option value="'Plus Jakarta Sans', sans-serif">
                    Plus Jakarta Sans
                </option>
                <option value="'Poppins', sans-serif">Poppins</option>
                <option value="'Nunito', sans-serif">Nunito</option>
                <option value="'Alexandria', sans-serif">Alexandria</option>
            </select>
        </div>

        <div class="theme-section">
            <h3>📏 Font Size</h3>
            <select class="theme-select" id="masarFontSize">
                <option value="14px">Small</option>
                <option value="16px" selected>Medium</option>
                <option value="18px">Large</option>
            </select>
        </div>

        <button class="theme-reset" id="resetMasarTheme" type="button">
            Reset to Default
        </button>
    `;

    settingsPage.appendChild(studio);

    studio.querySelectorAll("[data-theme]").forEach(button => {
        button.addEventListener("click", () => {
            applyMasarTheme(button.dataset.theme);
            updateThemeSelection();
            updateColorInputs();
        });
    });

    studio.querySelectorAll("[data-variable]").forEach(input => {
        input.addEventListener("input", () => {
            applyCustomMasarColor(input.dataset.variable, input.value);
            updateThemeSelection();
        });
    });

    const backgroundSelect = document.getElementById("masarBackgroundStyle");
    backgroundSelect.value = localStorage.getItem("masarBackgroundStyle") || "dreamy-pastel";
    document.body.dataset.backgroundStyle = backgroundSelect.value;
    backgroundSelect.addEventListener("change", event => {
        document.body.dataset.backgroundStyle = event.target.value;
        localStorage.setItem("masarBackgroundStyle", event.target.value);
    });

    const appearanceSelect = document.getElementById("masarAppearance");
    appearanceSelect.value = document.body.classList.contains("dark-mode") ? "dark" : "light";
    appearanceSelect.addEventListener("change", event => {
        document.body.classList.toggle("dark-mode", event.target.value === "dark");
        write("masarTheme", event.target.value);
        const selected = localStorage.getItem("masarSelectedTheme") || "lavender";
        if (masarThemes[selected]) applyMasarTheme(selected, false);
        applySavedMasarCustomColors();
    });

    document.getElementById("masarFont").addEventListener("change", event => {
        document.documentElement.style.setProperty(
            "--masar-font",
            event.target.value
        );
        localStorage.setItem("masarFont", event.target.value);
    });

    document.getElementById("masarFontSize").addEventListener("change", event => {
        document.documentElement.style.setProperty(
            "--masar-font-size",
            event.target.value
        );
        localStorage.setItem("masarFontSize", event.target.value);
    });

    document.getElementById("resetMasarTheme").addEventListener("click", () => {
        localStorage.removeItem("masarSelectedTheme");
        localStorage.removeItem("masarCustomColors");
        localStorage.removeItem("masarFont");
        localStorage.removeItem("masarFontSize");

        document.documentElement.style.removeProperty("--masar-font");
        document.documentElement.style.removeProperty("--masar-font-size");
        document.body.classList.remove("dark-mode");
        write("masarTheme", "light");
        localStorage.removeItem("masarBackgroundStyle");
        document.body.dataset.backgroundStyle = "dreamy-pastel";

        applyMasarTheme("lavender");
        updateColorInputs();
        updateThemeSelection();

        document.getElementById("masarFont").value =
            "'Outfit', sans-serif";

        document.getElementById("masarFontSize").value = "16px";
        document.getElementById("masarAppearance").value = "light";
        document.getElementById("masarBackgroundStyle").value = "dreamy-pastel";
    });

    const savedFont = localStorage.getItem("masarFont");
    const savedFontSize = localStorage.getItem("masarFontSize");
    if (savedFont) document.getElementById("masarFont").value = savedFont;
    if (savedFontSize) document.getElementById("masarFontSize").value = savedFontSize;
    updateColorInputs();
    updateThemeSelection();
}

function updateThemeSelection() {
    const selected = localStorage.getItem("masarSelectedTheme") || "lavender";

    document.querySelectorAll(".theme-card").forEach(card => {
        card.classList.toggle(
            "active",
            card.dataset.theme === selected
        );
    });
}

function updateColorInputs() {
    const theme = masarThemes[localStorage.getItem("masarSelectedTheme") || "lavender"];
    const customColors = read("masarCustomColors", {});
    const themeVariables = {
        "--primary": "primary",
        "--secondary": "secondary",
        "--accent": "accent",
        "--bg-base": "background",
        "--surface": "surface",
        "--text-main": "text"
    };

    document.querySelectorAll("[data-variable]").forEach(input => {
        const variable = input.dataset.variable;
        const value = customColors[variable]
            || theme?.[themeVariables[variable]]
            || getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

        if (/^#[0-9a-fA-F]{6}$/.test(value)) {
            input.value = value;
        }
    });
}

function restoreMasarFontSettings() {
    const font = localStorage.getItem("masarFont");
    const size = localStorage.getItem("masarFontSize");

    if (font) {
        document.documentElement.style.setProperty("--masar-font", font);
    }

    if (size) {
        document.documentElement.style.setProperty("--masar-font-size", size);
    }
}

restoreMasarFontSettings();
document.body.dataset.backgroundStyle = localStorage.getItem("masarBackgroundStyle") || "dreamy-pastel";
boot();