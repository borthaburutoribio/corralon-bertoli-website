// Corralón Bertoli: menú, entradas, horario en vivo, rubros con vista previa,
// lista de obra que arma el remito y el WhatsApp, reparto, vale y compartir.
(() => {
  const doc = document.documentElement;
  doc.classList.add('js');
  const WA = '5492923575259';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Menú del celular */
  const menuBtn = $('.menu-btn'), menu = $('#menu');
  const closeMenu = () => { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); };
  menuBtn?.addEventListener('click', () => {
    const open = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!open));
    menu.hidden = open;
  });
  menu?.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu && !menu.hidden) { closeMenu(); menuBtn.focus(); } });

  /* Horario en vivo (hora de Argentina) */
  const open = $('[data-open]');
  if (open) {
    const parts = new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    const get = t => parts.find(p => p.type === t)?.value || '';
    const day = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'].findIndex(d => get('weekday').toLowerCase().startsWith(d));
    const h = +get('hour') + +get('minute') / 60;
    const tramos = day >= 1 && day <= 5 ? [[8, 12], [14, 18]] : day === 6 ? [[8, 12]] : [];
    const now = tramos.find(([a, b]) => h >= a && h < b);
    if (now) open.innerHTML = `<b>Abierto ahora</b>, hasta las ${now[1]}`;
    else {
      const next = tramos.find(([a]) => h < a);
      open.innerHTML = next ? `<b>Cerrado</b>, abre a las ${next[0]}` : `<b>Cerrado</b>. ${day === 6 || day === 0 ? 'Abre el lunes a las 8' : 'Abre mañana a las 8'}`;
    }
  }

  /* Entradas escalonadas: título, texto, foto */
  const groups = $$('.resumen-text, .resumen-table tbody, .rubros-head, .rubros-list, .pared, .lista-head, .lista-grid, .reparto-grid, .reparto-text, .llega-head, .llega-steps, .nuevo-head, .tiles, .op-quote, .op-more, .op-list, .faq-wrap > h2, .cards, .vale, .donde, .foot-cols, .banda-cap');
  groups.forEach(g => {
    const kids = g.matches('.resumen-table tbody, .rubros-list, .llega-steps, .tiles, .op-list, .cards, .reparto-grid, .lista-grid, .donde, .foot-cols') ? g.children : g.querySelectorAll(':scope > *');
    [...kids].forEach((k, i) => { if (k.classList.contains('r')) return; k.classList.add('r'); k.style.setProperty('--d', Math.min(i, 8) * 75 + 'ms'); });
  });
  ['.statement', '.op-portrait', '.faq-wrap > h2'].forEach(s => $(s)?.classList.add('r'));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
  $$('.r').forEach(el => io.observe(el));

  /* El dibujo de ladrillos: la casita se arma cuando entra */
  const dg = $('.diagram');
  if (dg) {
    const dio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      $$('rect[fill="#15110d"]', dg).forEach((r, i) => { r.style.transitionDelay = (reduce ? 0 : i * 6) + 'ms'; });
      dg.classList.add('in'); dio.disconnect();
    }), { threshold: .35 });
    dio.observe(dg);
  }

  /* Rubros: índice con vista previa */
  const list = $('.rubros-list'), prev = $('[data-prev]');
  if (list && prev) {
    let cur = prev.getAttribute('src'), t;
    const show = li => {
      $$('li', list).forEach(x => x.classList.toggle('on', x === li));
      list.classList.add('dim');
      const src = li.dataset.img;
      if (src === cur) return;
      cur = src; clearTimeout(t);
      prev.classList.add('swap');
      t = setTimeout(() => { prev.src = src; prev.onload = () => prev.classList.remove('swap'); if (prev.complete) prev.classList.remove('swap'); }, 160);
    };
    $$('li', list).forEach(li => { li.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') show(li); }); li.tabIndex = 0; li.addEventListener('focus', () => show(li)); });
    list.addEventListener('pointerleave', () => { list.classList.remove('dim'); $$('li', list).forEach(x => x.classList.remove('on')); });
    $$('li', list).forEach(li => { const im = new Image(); im.src = li.dataset.img; });
  }

  /* LISTA DE OBRA: materiales por etapa. Lista orientativa: el stock lo confirma el corralón */
  const ETAPAS = {
    cimientos: { n: 'Cimientos y platea', items: [
      ['Cemento portland Avellaneda', 'bolsa'], ['Cal hidráulica', 'bolsa'], ['Arena gruesa', 'm³'], ['Piedra partida', 'm³'],
      ['Hierro del 8', 'barra'], ['Hierro del 10', 'barra'], ['Hierro del 6 para estribos', 'barra'], ['Malla sima', 'paño'],
      ['Alambre de atar', 'kg'], ['Hidrófugo', 'balde']] },
    muros: { n: 'Muros', items: [
      ['Ladrillo cerámico hueco del 12', 'unidad'], ['Ladrillo cerámico hueco del 18', 'unidad'], ['Ladrillo común', 'unidad'],
      ['Cemento de albañilería', 'bolsa'], ['Cal hidráulica', 'bolsa'], ['Arena fina', 'm³'], ['Hidrófugo', 'balde'], ['Hierro del 8 para dinteles', 'barra']] },
    techo: { n: 'Techo', items: [
      ['Viguetas pretensadas (pasanos el largo)', 'unidad'], ['Ladrillo cerámico para techo', 'unidad'], ['Malla sima', 'paño'],
      ['Membrana Megaflex', 'rollo'], ['Impermeabilizante Loimar', 'balde'], ['Lana de vidrio Isover', 'rollo'], ['Chapa (pasanos el largo)', 'unidad']] },
    seco: { n: 'Seco y PVC', items: [
      ['Placa de yeso Knauf', 'placa'], ['Perfil montante', 'unidad'], ['Perfil solera', 'unidad'], ['Masilla para placas', 'balde'],
      ['Cinta para juntas', 'rollo'], ['PVC Aisplac blanco', 'm²'], ['PVC Aisplac Versalles', 'm²'], ['Lana de vidrio Isover', 'rollo']] },
    pisos: { n: 'Pisos y revestimientos', items: [
      ['Porcelanato', 'm²'], ['Cerámico de piso Cerro Negro o Cortines', 'm²'], ['Revestimiento 38 x 38', 'm²'],
      ['Pegamento Weber', 'bolsa'], ['Pastina', 'kg'], ['Niveladores y crucetas', 'bolsa']] },
    extras: { n: 'Aberturas y más', items: [
      ['Puerta Oblak', 'unidad'], ['Ventana Oblak', 'unidad'], ['Escalera multiposición de aluminio', 'unidad'],
      ['Dobladora de hierro para estribos', 'unidad'], ['Termo Kushiro', 'unidad']] }
  };
  const KEY = 'bertoli-lista-v1';
  let qty = {};
  try { qty = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { qty = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(qty)); } catch (e) {} };
  const id = (e, i) => e + ':' + i;
  const itemsBox = $('[data-items]'), remito = $('[data-remito]'), waBtn = $('[data-wa]'), sello = $('[data-sello]');
  let etapa = 'cimientos', lastCount = 0;

  const renderItems = () => {
    if (!itemsBox) return;
    itemsBox.innerHTML = ETAPAS[etapa].items.map(([n, u], i) => {
      const k = id(etapa, i), q = qty[k] || 0;
      return `<div class="item${q ? ' has' : ''}" data-k="${k}">
        <span class="item-name">${n}</span><span class="item-unit">${u}</span>
        <span class="step"><button type="button" data-d="-1" aria-label="Uno menos de ${n}">−</button>
        <input type="number" inputmode="numeric" min="0" max="9999" value="${q}" aria-label="Cantidad de ${n} (${u})">
        <button type="button" data-d="1" aria-label="Uno más de ${n}">+</button></span></div>`;
    }).join('');
  };

  const lines = () => Object.entries(qty).filter(([, q]) => q > 0).map(([k, q]) => {
    const [e, i] = k.split(':'); const [n, u] = ETAPAS[e].items[+i]; return { k, q, n, u, e, o: Object.keys(ETAPAS).indexOf(e) * 100 + +i };
  }).sort((a, b) => a.o - b.o);

  const renderRemito = (added) => {
    if (!remito) return;
    const ls = lines();
    remito.innerHTML = ls.length
      ? ls.map(l => `<tr${l.k === added ? ' class="nuevo-row"' : ''}><td>${l.q}</td><td>${l.u}</td><td>${l.n}</td><td><button class="quitar" type="button" data-quitar="${l.k}" aria-label="Quitar ${l.n}">×</button></td></tr>`).join('')
      : '<tr class="vacio"><td colspan="4">Todavía no sumaste nada. Tocá + en los materiales.</td></tr>';
    if (sello) {
      const show = ls.length >= 3;
      if (show && sello.hidden) { sello.hidden = false; if (!reduce) { sello.classList.remove('pop'); void sello.offsetWidth; sello.classList.add('pop'); } }
      if (!show) sello.hidden = true;
    }
    const f = Object.fromEntries($$('[data-rf]').map(i => [i.name, i.value.trim()]));
    let t = 'Hola Corralón Bertoli! Armé esta lista en la web y quiero precio y día de entrega:\n';
    const byE = {};
    ls.forEach(l => (byE[l.e] = byE[l.e] || []).push(l));
    Object.keys(ETAPAS).forEach(e => { if (byE[e]) t += `\n${ETAPAS[e].n}:\n` + byE[e].map(l => `• ${l.q} ${l.u} · ${l.n}`).join('\n') + '\n'; });
    if (!ls.length) t = 'Hola Corralón Bertoli! Quiero pedir un presupuesto de materiales.';
    if (f.nombre) t += `\nSoy ${f.nombre}.`;
    if (f.obra) t += `\nLa obra es en ${f.obra}.`;
    if (waBtn) waBtn.href = `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
    lastCount = ls.length;
    const cnt = $('[data-count]');
    if (cnt) { cnt.hidden = !ls.length; $('[data-count-n]').textContent = `${ls.length} ${ls.length === 1 ? 'material' : 'materiales'} en tu lista`; }
  };

  const setQ = (k, q, fromInput) => {
    q = Math.max(0, Math.min(9999, Math.round(+q || 0)));
    const was = qty[k] || 0;
    if (q) qty[k] = q; else delete qty[k];
    save();
    const row = itemsBox?.querySelector(`[data-k="${k}"]`);
    if (row) { row.classList.toggle('has', q > 0); const inp = row.querySelector('input'); if (!fromInput) inp.value = q; }
    renderRemito(!was && q ? k : null);
  };

  itemsBox?.addEventListener('click', e => {
    const b = e.target.closest('button[data-d]'); if (!b) return;
    const k = b.closest('.item').dataset.k; setQ(k, (qty[k] || 0) + +b.dataset.d);
  });
  itemsBox?.addEventListener('input', e => { if (e.target.matches('input')) setQ(e.target.closest('.item').dataset.k, e.target.value, true); });
  remito?.addEventListener('click', e => { const b = e.target.closest('[data-quitar]'); if (b) setQ(b.dataset.quitar, 0); });
  $('[data-vaciar]')?.addEventListener('click', () => { qty = {}; save(); renderItems(); renderRemito(); });
  $$('[data-rf]').forEach(i => i.addEventListener('input', () => renderRemito()));

  const tabs = $$('.etapas [role=tab]');
  const pick = (e, focus) => {
    if (!ETAPAS[e]) return;
    etapa = e;
    tabs.forEach(t => { const on = t.dataset.e === e; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    renderItems();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(t.dataset.e));
    t.addEventListener('keydown', ev => {
      const d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
      if (d) { ev.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length].dataset.e, true); }
    });
  });
  // Las carpetas del inicio abren la lista en su etapa
  $$('.hero [data-etapa]').forEach(a => a.addEventListener('click', () => pick(a.dataset.etapa)));
  const fecha = $('[data-fecha]');
  if (fecha) fecha.textContent = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  pick('cimientos'); renderRemito();

  /* Reparto: obra / casa / proyecto */
  const REP = {
    obra: ['Del galpón a la obra', 'A la mañana se cargan los pallets de ladrillos cerámicos y el camión sale a reparto. Vos decís dónde y cuándo, nosotros llegamos con todo junto.', 'assets/img/camion-ladrillos-ceramicos-reparto-pringles.webp', 'Camión de Corralón Bertoli cargado con ladrillos cerámicos, listo para el reparto'],
    casa: ['Del galpón a tu casa', 'Un par de bolsas de pegamento, el revestimiento del baño o la escalera nueva. Lo que no entra en el baúl también se coordina por WhatsApp.', 'assets/img/porcelanato-en-deposito.webp', 'Porcelanato embalado en el depósito de Corralón Bertoli'],
    proyecto: ['Del galpón a tu proyecto', 'Si estás por empezar, pasanos la lista o el plano y lo separamos por etapas: primero cimientos, después muros y techo. Cada carga sale cuando la necesitás.', 'assets/img/autoelevador-cargando-camion.webp', 'Autoelevador cargando un camión en el patio de Corralón Bertoli']
  };
  const repTabs = $$('.rep-tabs [role=tab]'), repT = $('[data-rep-t]'), repP = $('[data-rep-p]'), repI = $('[data-rep-img]');
  repTabs.forEach((b, i) => {
    b.addEventListener('click', () => {
      const r = REP[b.dataset.rep];
      repTabs.forEach(x => { x.setAttribute('aria-selected', String(x === b)); x.tabIndex = x === b ? 0 : -1; });
      repT.textContent = r[0]; repP.textContent = r[1];
      repI.classList.add('swap');
      setTimeout(() => { repI.src = r[2]; repI.alt = r[3]; repI.classList.remove('swap'); }, reduce ? 0 : 200);
    });
    b.addEventListener('keydown', ev => {
      const d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
      if (d) { ev.preventDefault(); const n = repTabs[(i + d + repTabs.length) % repTabs.length]; n.focus(); n.click(); }
    });
  });
  repTabs.forEach((x, i) => x.tabIndex = i ? -1 : 0);

  /* La foto de la banda se acomoda con el scroll */
  const banda = $('.banda-house');
  if (banda && !reduce) {
    let tk = false;
    const onScroll = () => {
      tk = false;
      const r = banda.getBoundingClientRect();
      const p = Math.min(Math.max((innerHeight - r.top) / (innerHeight + r.height), 0), 1);
      banda.style.setProperty('--bs', (1.14 - p * 0.12).toFixed(3));
    };
    addEventListener('scroll', () => { if (!tk) { tk = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  }

  /* Preguntas: una abierta por vez (para navegadores sin details[name]) */
  const cards = $$('.card');
  cards.forEach(c => c.addEventListener('toggle', () => { if (c.open) cards.forEach(o => { if (o !== c) o.open = false; }); }));

  /* Vale: arma el WhatsApp */
  $('[data-vale]')?.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target.elements;
    let t = `Hola Corralón Bertoli! Soy ${f.nombre.value.trim()}. Necesito: ${f.que.value.trim()}.`;
    if (f.donde.value.trim()) t += ` La obra es en ${f.donde.value.trim()}.`;
    if (f.cuando.value.trim()) t += ` Para ${f.cuando.value.trim()}.`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(t)}`, '_blank', 'noopener');
  });

  /* Compartir */
  $('[data-share]')?.addEventListener('click', async () => {
    const data = { title: 'Corralón Bertoli', text: 'Corralón de materiales en Coronel Pringles', url: location.href.split('#')[0] };
    if (navigator.share) { try { await navigator.share(data); } catch (e) {} return; }
    try { await navigator.clipboard.writeText(data.url); $('[data-share]').textContent = 'Link copiado'; } catch (e) { location.href = `https://wa.me/?text=${encodeURIComponent(data.url)}`; }
  });
})();
