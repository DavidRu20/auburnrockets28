<script>
  /* ---------- Subcategories per subject ---------- */
  const SUBCATS = {
    math: [
      { icon:"∑", title:"Algebra 1", slug:"algebra-1", desc:"Linear equations, systems, functions." },
      { icon:"∫", title:"Algebra 2", slug:"algebra-2", desc:"Quadratics, polynomials, exponentials." },
      { icon:"△", title:"Geometry", slug:"geometry", desc:"Proofs, similarity, circles, trig basics." },
      { icon:"π", title:"Trigonometry", slug:"trigonometry", desc:"Sine/cosine, identities, graphs." },
      { icon:"∞", title:"Precalculus", slug:"precalculus", desc:"Limits, sequences, advanced functions." },
      { icon:"✦", title:"SAT Math", slug:"sat-math", desc:"Targeted practice & strategies." },
    ],
    ela: [
      { icon:"✍︎", title:"Writing", slug:"writing", desc:"Thesis, structure, clarity & style." },
      { icon:"📖", title:"Reading", slug:"reading", desc:"Annotation, inference, main ideas." },
      { icon:"🔬", title:"Research", slug:"research", desc:"Sources, note-taking, citations." },
      { icon:"📝", title:"Grammar", slug:"grammar", desc:"Punctuation, clauses, agreement." },
    ],
    science: [
      { icon:"🧬", title:"Biology", slug:"biology", desc:"Cells, genetics, evolution, ecology." },
      { icon:"⚗️", title:"Chemistry", slug:"chemistry", desc:"Stoich, bonding, reactions, acids." },
      { icon:"🪐", title:"Physics", slug:"physics", desc:"Forces, energy, waves, circuits." },
      { icon:"🌎", title:"Earth Science", slug:"earth-science", desc:"Geology, weather, climate, space." },
    ],
    technology: [
      { icon:"</>", title:"Web Dev", slug:"web", desc:"HTML, CSS, JS — modern basics." },
      { icon:"⚙️", title:"Programming", slug:"programming", desc:"Logic, variables, loops, functions." },
      { icon:"🧠", title:"AI Basics", slug:"ai", desc:"How AI works + safe usage." },
      { icon:"📦", title:"Tools", slug:"tools", desc:"GitHub, command line, editors." },
    ],
    finearts: [
      { icon:"🎺", title:"Band", slug:"band", desc:"Tone, articulation, ensemble skills." },
      { icon:"🎤", title:"Choir", slug:"choir", desc:"Blend, diction, breathing, sight-singing." },
      { icon:"🎨", title:"Visual Arts", slug:"visual-arts", desc:"Color, composition, technique." },
    ],
    languages: [
      { icon:"🇪🇸", title:"Spanish", slug:"spanish", desc:"Present, preterite, vocab & phrases." },
      { icon:"🇫🇷", title:"French", slug:"french", desc:"Pronunciation, verbs, essentials." },
    ],
    history: [
      { icon:"🏛️", title:"US History", slug:"us-history", desc:"Colonies → modern era." },
      { icon:"🌍", title:"World History", slug:"world-history", desc:"Ancient → contemporary." },
      { icon:"📜", title:"Civics/Gov", slug:"civics", desc:"Branches, rights, elections." },
      { icon:"🗺️", title:"Geography", slug:"geography", desc:"Places, regions, human systems." },
    ],
  };

  const subcatsEl = document.getElementById('subcats');
  const subcatsPanel = document.getElementById('subcatsPanel');
  const toggleAllBtn = document.getElementById('toggleAll');
  let showAll = false;

  function linkFor(subj, slug){
    // route to dedicated page; you can change folder names later
    return `study/${subj}-${slug}.html`;
    // Alternative (single template): return `study-topic.html?subject=${subj}&topic=${slug}`;
  }

  function renderSubcats(){
    const list = SUBCATS[current] || [];
    const visible = showAll ? list : list.slice(0, 6); // keep it tidy by default
    subcatsEl.innerHTML = visible.map(s => `
      <a class="subcat-card" href="${linkFor(current, s.slug)}" aria-label="${s.title}">
        <div class="subcat-icon">${s.icon}</div>
        <div class="subcat-body">
          <div class="subcat-title">${s.title}</div>
          <div class="subcat-desc">${s.desc}</div>
        </div>
      </a>
    `).join('');
    // hide the panel entirely if none exist
    subcatsPanel.style.display = list.length ? '' : 'none';
    toggleAllBtn.style.display = list.length > 6 ? '' : 'none';
    toggleAllBtn.setAttribute('aria-expanded', String(showAll));
    toggleAllBtn.textContent = showAll ? 'Show less' : 'View all';
  }

  toggleAllBtn.addEventListener('click', () => { showAll = !showAll; renderSubcats(); });

  // hook into existing subject switching & search
  const _oldApply = apply;
  function applyWithSubcats(){ _oldApply(); renderSubcats(); }
  // replace your apply() references
  apply = applyWithSubcats;

  // initial
  renderSubcats();
</script>

