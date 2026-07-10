/* Albion Stat - static market stats site (data exported from private tracker) */

const CITY = {
  7: 'Thetford', 1002: 'Lymhurst', 2004: 'Bridgewatch', 3005: 'Caerleon',
  3008: 'Martlock', 4002: 'Fort Sterling', 5003: 'Brecilien', 3003: 'Black Market',
};
const CITY_ORDER = [3008, 2004, 1002, 4002, 7, 3005, 5003, 3003];
const CITY_COLORS = {
  3008: '#7fb4e0', 2004: '#e0b97f', 1002: '#8fd9a0', 4002: '#c8cdd6',
  7: '#c39fe0', 3005: '#e09090', 5003: '#e0d17f', 3003: '#9aa1ab',
};

const CATS = [
  { key: 'raw',       label: 'วัตถุดิบดิบ',        ico: '⛏️', re: /^T\d_(ORE|WOOD|HIDE|FIBER|ROCK)(_LEVEL\d+)?(@\d)?$/ },
  { key: 'refined',   label: 'ของแปรรูป',          ico: '\u{1F9F1}', re: /^T\d_(METALBAR|PLANKS|LEATHER|CLOTH|STONEBLOCK)(_LEVEL\d+)?(@\d)?$/ },
  { key: 'tools',     label: 'เครื่องมือเก็บของ',   ico: '\u{1F528}', re: /_TOOL/ },
  { key: 'weapons',   label: 'อาวุธ',              ico: '⚔️', re: /^T\d_(MAIN|2H)_/ },
  { key: 'offhand',   label: 'ออฟแฮนด์/โล่',       ico: '\u{1F6E1}️', re: /^T\d_OFF_/ },
  { key: 'armor',     label: 'ชุดเกราะ',           ico: '\u{1F455}', re: /^T\d_(ARMOR|HEAD|SHOES)_/ },
  { key: 'accessory', label: 'กระเป๋า/ผ้าคลุม',     ico: '\u{1F392}', re: /^T\d_(BAG|CAPE)/ },
  { key: 'mount',     label: 'สัตว์ขี่',            ico: '\u{1F40E}', re: /_MOUNT/ },
  { key: 'food',      label: 'อาหาร',              ico: '\u{1F372}', re: /^T\d_MEAL/ },
  { key: 'potion',    label: 'ยา/น้ำยา',           ico: '\u{1F9EA}', re: /^T\d_POTION/ },
  { key: 'fishing',   label: 'ตกปลา',              ico: '\u{1F41F}', re: /FISH|SEAWEED/ },
  { key: 'farm',      label: 'ฟาร์ม/เมล็ด',        ico: '\u{1F331}', re: /^T\d_FARM_|_SEED|_BABY|_GROWN/ },
  { key: 'artifact',  label: 'อาร์ติแฟกต์/วัสดุ',   ico: '\u{1F48E}', re: /ARTEFACT|RUNE|SOUL|RELIC|SHARD|ESSENCE/ },
  { key: 'furniture', label: 'เฟอร์นิเจอร์',        ico: '\u{1FA91}', re: /FURNITURE/ },
  { key: 'other',     label: 'อื่น ๆ',             ico: '\u{1F4E6}', re: /./ },
];

// subcategories per category: first matching regex wins, otherwise "อื่น ๆ"
const SUBCATS = {
  raw: [
    ['แร่', /_ORE/], ['ไม้', /_WOOD/], ['หนังดิบ', /_HIDE/], ['ใยพืช', /_FIBER/], ['หิน', /_ROCK/],
  ],
  refined: [
    ['แท่งโลหะ', /METALBAR/], ['ไม้กระดาน', /PLANKS/], ['หนังฟอก', /LEATHER/], ['ผ้า', /CLOTH/], ['บล็อกหิน', /STONEBLOCK/],
  ],
  tools: [
    ['อีเต้อขุดแร่', /_PICK/], ['ขวานตัดไม้', /TOOL_AXE/], ['มีดถลกหนัง', /KNIFE/], ['เคียวเกี่ยวใย', /SICKLE/],
    ['ค้อนสกัดหิน', /TOOL_HAMMER/], ['เบ็ดตกปลา', /FISHINGROD/], ['ค้อนรื้อถอน', /DEMOLITION/],
  ],
  weapons: [
    ['หน้าไม้', /CROSSBOW|BOLTCASTERS|SIEGEBOW/], ['ธนู', /BOW/],
    ['ดาบ', /SWORD|CLAYMORE|SCIMITAR|CLARENT|GALATINE|KINGMAKER/],
    ['ขวาน', /AXE|HALBERD|SCYTHE|CARRIONCALLER/],
    ['กระบอง', /MACE|FLAIL|CAMLANN|OATHKEEPERS/], ['ค้อน', /HAMMER|GROVEKEEPER/],
    ['ถุงมือต่อสู้', /KNUCKLES|FISTS/], ['หอก', /SPEAR|PIKE|GLAIVE|HARPOON|TRIDENT/],
    ['มีดสั้น', /DAGGER|RAPIER|CLAWS|BLOODLETTER|DEATHGIVERS/],
    ['พลอง', /QUARTERSTAFF|DOUBLEBLADED|IRONCLADED|COMBATSTAFF|TWINSCYTHE|GRAILSEEKER/],
    ['ไม้เท้าไฟ', /FIRE|INFERNO|BRIMSTONE|BLAZING|DAWNSONG/],
    ['ไม้เท้าน้ำแข็ง', /FROST|ICICLE|GLACIAL|PERMAFROST|CHILLHOWL|ICEBLOCK/],
    ['ไม้เท้าอาร์เคน', /ARCANE|ENIGMATIC|WITCHWORK|OCCULT|MALEVOLENT|EVENSONG|MISTPIERCER/],
    ['ไม้เท้าคำสาป', /CURSE|DEMONIC|SKULLORB|DAMNATION|SHADOWCALLER|CRYPTCANDLE/],
    ['ไม้เท้าฮีล', /HOLY|DIVINE|LIFETOUCH|FALLEN|REDEMPTION|HALLOWFALL|EXALTED/],
    ['ไม้เท้าธรรมชาติ', /NATURE|DRUIDIC|WILDSTAFF|RAMPANT|IRONROOT|BLIGHT|FORGEBARK/],
    ['แปลงร่าง', /SHAPESHIFTER/],
  ],
  offhand: [
    ['โล่', /SHIELD|SARCOPHAGUS|CAITIFF|FACEBREAKER|ASTRAL/], ['ตำราเวท', /BOOK|ORB|CENSER|EYE|MUISAK/],
    ['คบเพลิง', /TORCH|MISTCALLER|LEERING|CRYPTCANDLE|SACRED/], ['เขาสัตว์/อื่น ๆ', /HORN|TOTEM|JESTER|TALISMAN/],
  ],
  armor: [
    ['เกราะผ้า', /_(ARMOR|HEAD|SHOES)_CLOTH/], ['เกราะหนัง', /_(ARMOR|HEAD|SHOES)_LEATHER/],
    ['เกราะเหล็ก', /_(ARMOR|HEAD|SHOES)_PLATE/], ['ชุดเก็บของ/ตกปลา', /GATHERER|FISHING/],
  ],
  accessory: [['กระเป๋า', /_BAG/], ['ผ้าคลุม', /_CAPE/]],
  mount: [
    ['ม้า', /HORSE/], ['วัว/ล่อขนของ', /_OX|MULE|DONKEY/], ['สัตว์ขี่พิเศษ', /./],
  ],
  food: [
    ['ซุป', /SOUP/], ['สลัด', /SALAD/], ['พาย', /PIE/], ['ย่าง', /ROAST/],
    ['สตูว์', /STEW/], ['แซนด์วิช', /SANDWICH/], ['ออมเล็ต', /OMELETTE/],
  ],
  potion: [
    ['ฟื้นฟูเลือด', /HEAL/], ['พลังงาน', /ENERGY/], ['ร่างยักษ์', /GIGANTIFY/],
    ['ต้านทาน', /RESISTANCE/], ['ล้างสถานะ', /CLEANSE/], ['สตันฟิลด์', /STONESKIN|SLOWFIELD/],
  ],
  fishing: [['ปลา', /^T\d_FISH/], ['เหยื่อตกปลา', /BAIT/], ['ซอส/ของแปรรูป', /FISHSAUCE|SEAWEED|FISHCHOPS/]],
  farm: [['เมล็ดพืช', /_SEED/], ['ลูกสัตว์', /_BABY/], ['สัตว์โตแล้ว', /_GROWN/], ['ผลผลิต', /./]],
  artifact: [
    ['รูน', /RUNE/], ['โซล', /SOUL/], ['เรลิก', /RELIC/], ['เศษอวาโลเนียน', /SHARD/],
    ['อาร์ติแฟกต์', /ARTEFACT/], ['เอสเซนส์', /ESSENCE/],
  ],
};
const SUB_OTHER = 'อื่น ๆ';
function subOf(catKey, id) {
  const defs = SUBCATS[catKey];
  if (!defs) return SUB_OTHER;
  const hit = defs.find(([, re]) => re.test(id));
  return hit ? hit[0] : SUB_OTHER;
}

let NAMES = {}, LATEST = [], DAILY = [], META = {};
// list-view filter state
let fType = 0, fTier = '', fEnch = '', fQual = 0, fSub = '', lastCat = null;
// detail-view state
let dType = 0, dQual = 0;
const MAX_ROWS = 300;

const $ = sel => document.querySelector(sel);
const fmt = n => n == null ? '-' : n.toLocaleString('en-US');
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function nameOf(id) {
  const base = id.split('@')[0];
  const ench = id.includes('@') ? ' .' + id.split('@')[1] : '';
  return (NAMES[id] || NAMES[base] || base) + ench;
}
function catOf(id) { return CATS.find(c => c.re.test(id)).key; }
function tierOf(id) { const m = id.match(/^T(\d)_/); return m ? 'T' + m[1] : ''; }
function enchOf(id) { const m = id.match(/@(\d)$/); return m ? m[1] : '0'; }
function ageTh(iso) {
  let m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return ['เมื่อกี้นี้', 'fresh'];
  const cls = m < 1440 ? 'fresh' : (m < 10080 ? '' : 'old');
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const mm = m % 60;
  const parts = [];
  if (d) parts.push(d + ' วัน');
  if (h) parts.push(h + ' ชม.');
  if (mm && !d) parts.push(mm + ' นาที'); // minutes not useful once it's days old
  return [parts.join(' ') + 'ก่อน', cls];
}

/* ---------- data loading ---------- */
async function boot() {
  try {
    const [names, latest, daily, meta] = await Promise.all([
      fetch('item-names.json').then(r => r.json()),
      fetch('data/latest.json').then(r => r.json()),
      fetch('data/daily.json').then(r => r.json()),
      fetch('data/meta.json').then(r => r.json()),
    ]);
    NAMES = names;
    LATEST = latest.rows.map(r => ({ id: r[0], loc: r[1], q: r[2], type: r[3], price: r[4], count: r[5], amount: r[6], ts: r[7] }));
    DAILY = daily.rows.map(r => ({ d: r[0], id: r[1], loc: r[2], q: r[3], type: r[4], avg: r[5], min: r[6], max: r[7], n: r[8] }));
    META = meta;
    $('#updated').textContent = 'ข้อมูลล่าสุด ' + new Date(META.generated).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
    route();
  } catch (e) {
    $('#app').innerHTML = '<div class="hint">โหลดข้อมูลไม่สำเร็จ: ' + esc(e.message) + '</div>';
  }
}

/* ---------- router ---------- */
function route() {
  const h = decodeURIComponent(location.hash);
  window.scrollTo(0, 0);
  if (h.startsWith('#i/')) return renderDetail(h.slice(3));
  if (h.startsWith('#c/')) return renderList({ cat: h.slice(3) });
  if (h.startsWith('#q/')) return renderList({ query: h.slice(3) });
  if (h === '#craft') return renderCraft();
  renderHome();
}
window.addEventListener('hashchange', route);
$('#search').addEventListener('input', () => {
  clearTimeout(window._t);
  window._t = setTimeout(() => {
    const v = $('#search').value.trim();
    location.hash = v ? '#q/' + encodeURIComponent(v) : '';
  }, 300);
});

/* ---------- home ---------- */
function renderHome() {
  const counts = {};
  for (const r of LATEST) {
    const c = catOf(r.id);
    (counts[c] = counts[c] || new Set()).add(r.id);
  }
  let html = '<div class="grid">';
  html += `<div class="card" onclick="location.hash='#craft'">
    <div class="ico">\u{1F6E0}️</div><div class="t">คำนวณคราฟ</div>
    <div class="n">ต้นทุน กำไร ราคาคุ้มทุน</div>
    <div class="n sub">ใช้ราคาตลาดล่าสุด · บันทึกสูตรได้</div></div>`;
  for (const c of CATS) {
    const n = counts[c.key] ? counts[c.key].size : 0;
    if (c.key === 'other' && n === 0) continue;
    const subs = (SUBCATS[c.key] || []).map(s => s[0]).slice(0, 4).join(' · ');
    html += `<div class="card" onclick="location.hash='#c/${c.key}'">
      <div class="ico">${c.ico}</div><div class="t">${c.label}</div>
      <div class="n">${n ? n + ' ไอเทม' : 'ยังไม่มีข้อมูล'}</div>
      ${subs ? `<div class="n sub">${subs}${(SUBCATS[c.key] || []).length > 4 ? ' ...' : ''}</div>` : ''}</div>`;
  }
  html += '</div>';
  html += `<div class="hint">รวม ${META.items} ไอเทมจากตลาดที่เก็บมากับมือ<br>เลือกหมวด หรือพิมพ์ค้นหาด้านบนได้เลย</div>`;
  $('#app').innerHTML = html;
}

/* ---------- list view (category / search) ---------- */
function chipRow(label, defs, cur, setter) {
  return `<div class="bar"><span class="lbl">${label}</span>` + defs.map(([t, v]) =>
    `<span class="chip ${String(cur) === String(v) ? 'on' : ''}" onclick="${setter}('${v}')">${t}</span>`).join('') + '</div>';
}

function renderList(opts) {
  window._listOpts = opts;
  const cat = CATS.find(c => c.key === opts.cat);
  if ((cat ? cat.key : null) !== lastCat) { fSub = ''; lastCat = cat ? cat.key : null; }
  const query = (opts.query || '').toLowerCase();

  const match = id => {
    if (cat && catOf(id) !== cat.key) return false;
    if (query && !id.toLowerCase().includes(query) && !nameOf(id).toLowerCase().includes(query)) return false;
    if (fTier && tierOf(id) !== fTier) return false;
    if (fEnch !== '' && enchOf(id) !== fEnch) return false;
    if (cat && fSub && subOf(cat.key, id) !== fSub) return false;
    return true;
  };

  // which subcategories actually have items (within category + search only)
  const subCounts = new Map();
  if (cat && SUBCATS[cat.key]) {
    const seen = new Set();
    for (const r of LATEST) {
      if (seen.has(r.id) || catOf(r.id) !== cat.key) continue;
      if (query && !r.id.toLowerCase().includes(query) && !nameOf(r.id).toLowerCase().includes(query)) continue;
      seen.add(r.id);
      const s = subOf(cat.key, r.id);
      subCounts.set(s, (subCounts.get(s) || 0) + 1);
    }
  }

  const byItem = new Map();
  for (const r of LATEST) {
    if (r.type !== fType) continue;
    if (fQual !== 0 && r.q !== fQual) continue;
    if (!match(r.id)) continue;
    let m = byItem.get(r.id);
    if (!m) { m = {}; byItem.set(r.id, m); }
    const cur = m[r.loc];
    const better = !cur || (fType === 0 ? r.price < cur.price : r.price > cur.price);
    if (better) m[r.loc] = r;
  }

  const title = cat ? `${cat.ico} ${cat.label}` : `ผลค้นหา "${esc(opts.query || '')}"`;
  let html = `<div class="crumb"><a href="#">หน้าแรก</a> / ${title}</div>`;
  if (cat && SUBCATS[cat.key]) {
    const defs = [['ทั้งหมด', '']];
    for (const [label] of SUBCATS[cat.key]) {
      if (subCounts.has(label)) defs.push([`${label} (${subCounts.get(label)})`, label]);
    }
    if (subCounts.has(SUB_OTHER)) defs.push([`${SUB_OTHER} (${subCounts.get(SUB_OTHER)})`, SUB_OTHER]);
    if (defs.length > 2) html += chipRow('หมวดย่อย', defs, fSub, 'setSub');
  }
  html += chipRow('ประเภท', [['ราคาขาย', 0], ['รับซื้อ', 1]], fType, 'setType');
  html += chipRow('Tier', [['ทั้งหมด', ''], ...[1,2,3,4,5,6,7,8].map(t => ['T' + t, 'T' + t])], fTier, 'setTier');
  html += chipRow('Enchant', [['ทั้งหมด', ''], ['.0', '0'], ['.1', '1'], ['.2', '2'], ['.3', '3'], ['.4', '4']], fEnch, 'setEnch');
  html += chipRow('คุณภาพ', [['ดีสุดที่มี', 0], ['Normal', 1], ['Good', 2], ['Outstanding', 3], ['Excellent', 4], ['Masterpiece', 5]], fQual, 'setQual');

  const items = [...byItem.keys()].sort();
  if (!items.length) {
    html += '<div class="hint">ไม่พบข้อมูลตามตัวกรองนี้<br>ลองเปลี่ยน Tier/Enchant หรือไปเปิดตลาดหมวดนี้ในเกมก่อน</div>';
    $('#app').innerHTML = html; return;
  }

  html += '<div class="tablewrap"><table><thead><tr><th>ไอเทม</th>' +
    CITY_ORDER.map(l => `<th>${CITY[l]}</th>`).join('') + '</tr></thead><tbody>';
  for (const id of items.slice(0, MAX_ROWS)) {
    const m = byItem.get(id);
    html += `<tr onclick="location.hash='#i/${encodeURIComponent(id)}'">` +
      `<td><span class="iname">${esc(nameOf(id))}</span><br><span class="iid">${esc(id)}</span></td>` +
      CITY_ORDER.map(l => {
        const r = m[l];
        if (!r) return '<td class="na">-</td>';
        const [a, cls] = ageTh(r.ts);
        const q = fQual === 0 && r.q > 1 ? ` <span class="sub">Q${r.q}</span>` : '';
        return `<td class="${cls}">${fmt(r.price)}${q}<br><span class="sub">${a}</span></td>`;
      }).join('') + '</tr>';
  }
  html += '</tbody></table></div>';
  if (items.length > MAX_ROWS) html += `<div class="hint">แสดง ${MAX_ROWS} จาก ${items.length} ไอเทม ใช้ตัวกรองหรือค้นหาเพื่อดูที่เหลือ</div>`;
  $('#app').innerHTML = html;
}
window.setType = v => { fType = Number(v); renderList(window._listOpts); };
window.setSub = v => { fSub = v; renderList(window._listOpts); };
window.setTier = v => { fTier = v; renderList(window._listOpts); };
window.setEnch = v => { fEnch = v; renderList(window._listOpts); };
window.setQual = v => { fQual = Number(v); renderList(window._listOpts); };

/* ---------- item detail ---------- */
function renderDetail(id) {
  window._detailId = id;
  const cat = CATS.find(c => c.re.test(id));
  let html = `<div class="crumb"><a href="#">หน้าแรก</a> / <a href="#c/${cat.key}">${cat.label}</a> / ${esc(nameOf(id))}</div>`;
  html += `<div class="dhead"><h1>${esc(nameOf(id))}</h1><span class="iid">${esc(id)}</span></div>`;
  html += chipRow('ประเภท', [['ราคาขาย', 0], ['รับซื้อ', 1]], dType, 'setDType');
  html += chipRow('คุณภาพ', [['ดีสุดที่มี', 0], ['Normal', 1], ['Good', 2], ['Outstanding', 3], ['Excellent', 4], ['Masterpiece', 5]], dQual, 'setDQual');

  // current prices + averages per city
  const now = {};
  for (const r of LATEST) {
    if (r.id !== id || r.type !== dType) continue;
    if (dQual !== 0 && r.q !== dQual) continue;
    const cur = now[r.loc];
    const better = !cur || (dType === 0 ? r.price < cur.price : r.price > cur.price);
    if (better) now[r.loc] = r;
  }
  const avgOf = (loc, days) => {
    const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    let sum = 0, n = 0;
    for (const h of DAILY) {
      if (h.id !== id || h.loc !== loc || h.type !== dType || h.d < since) continue;
      if (dQual !== 0 && h.q !== dQual) continue;
      sum += h.avg * h.n; n += h.n;
    }
    return n ? Math.round(sum / n) : null;
  };

  html += '<div class="panelbox"><h2>ราคาปัจจุบัน + ค่าเฉลี่ย (' + (dType === 0 ? 'ฝั่งขาย' : 'ฝั่งรับซื้อ') + ')</h2>';
  html += '<div class="tablewrap"><table><thead><tr><th>เมือง</th><th>ราคาล่าสุด</th><th>จำนวนออเดอร์</th><th>เฉลี่ย 7 วัน</th><th>เฉลี่ย 30 วัน</th><th>อัปเดต</th></tr></thead><tbody>';
  let any = false;
  for (const loc of CITY_ORDER) {
    const r = now[loc];
    const a7 = avgOf(loc, 7), a30 = avgOf(loc, 30);
    if (!r && a30 == null) continue;
    any = true;
    const [a, cls] = r ? ageTh(r.ts) : ['-', 'na'];
    html += `<tr><td>${CITY[loc]}</td><td class="${cls}">${r ? fmt(r.price) : '-'}</td>` +
      `<td>${r ? fmt(r.count) : '-'}</td><td>${fmt(a7)}</td><td>${fmt(a30)}</td><td class="sub">${a}</td></tr>`;
  }
  html += '</tbody></table></div>';
  if (!any) html += '<div class="hint">ยังไม่มีข้อมูลฝั่งนี้ของไอเทมนี้</div>';
  html += '</div>';

  html += '<div class="panelbox"><h2>กราฟราคาเฉลี่ยรายวัน (60 วันล่าสุด)</h2><canvas id="chart"></canvas><div class="legend" id="legend"></div></div>';
  $('#app').innerHTML = html;
  drawChart(id);
}
window.setDType = v => { dType = Number(v); renderDetail(window._detailId); };
window.setDQual = v => { dQual = Number(v); renderDetail(window._detailId); };

function drawChart(id) {
  const canvas = $('#chart'), legend = $('#legend');
  const rows = DAILY.filter(h => h.id === id && h.type === dType && (dQual === 0 || h.q === dQual));
  if (!rows.length) {
    canvas.style.display = 'none';
    legend.innerHTML = '<span>ยังไม่มีประวัติราคา ข้อมูลจะสะสมเพิ่มขึ้นทุกครั้งที่เก็บราคา</span>';
    return;
  }
  // per city: date -> weighted avg
  const series = new Map();
  for (const h of rows) {
    let s = series.get(h.loc);
    if (!s) { s = new Map(); series.set(h.loc, s); }
    const cur = s.get(h.d) || { sum: 0, n: 0 };
    cur.sum += h.avg * h.n; cur.n += h.n;
    s.set(h.d, cur);
  }
  const dates = [...new Set(rows.map(h => h.d))].sort();
  let lo = Infinity, hi = -Infinity;
  const lines = [];
  for (const [loc, s] of series) {
    const pts = dates.map(d => {
      const v = s.get(d);
      return v ? Math.round(v.sum / v.n) : null;
    });
    for (const p of pts) if (p != null) { lo = Math.min(lo, p); hi = Math.max(hi, p); }
    lines.push({ loc, pts });
  }
  if (hi === lo) { lo *= 0.9; hi *= 1.1; }
  const pad = (hi - lo) * 0.1 || 1;
  lo -= pad; hi += pad;

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth || 800, H = 260;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const L = 64, R = 10, T = 10, B = 26;
  const px = i => dates.length === 1 ? L + (W - L - R) / 2 : L + (W - L - R) * (i / (dates.length - 1));
  const py = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo));

  ctx.font = '11px Segoe UI';
  ctx.strokeStyle = '#31353e'; ctx.fillStyle = '#8f96a3';
  for (let g = 0; g <= 4; g++) {
    const v = lo + (hi - lo) * g / 4, y = py(v);
    ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(W - R, y); ctx.stroke();
    ctx.fillText(fmt(Math.round(v)), 4, y + 4);
  }
  const step = Math.max(1, Math.ceil(dates.length / 6));
  ctx.textAlign = 'center';
  for (let i = 0; i < dates.length; i += step) {
    ctx.fillText(dates[i].slice(5), px(i), H - 8);
  }
  ctx.textAlign = 'left';

  legend.innerHTML = '';
  for (const line of lines) {
    const color = CITY_COLORS[line.loc] || '#d8dbe2';
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    line.pts.forEach((p, i) => {
      if (p == null) return;
      const x = px(i), y = py(p);
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      ctx.fillRect(x - 2, y - 2, 4, 4);
    });
    ctx.stroke();
    legend.innerHTML += `<span><span class="dot" style="background:${color}"></span>${CITY[line.loc] || '#' + line.loc}</span>`;
  }
}

/* ---------- craft profit calculator ---------- */
const RET_OPTS = [
  ['0.152', '15.2% - ไม่มีโบนัส'], ['0.248', '24.8% - เมืองโบนัสคราฟ'],
  ['0.367', '36.7% - Hideout + power'], ['0.435', '43.5% - ใช้ Focus'],
  ['0.539', '53.9% - Focus + เมืองโบนัส'], ['custom', 'กำหนดเอง...'],
];
let cSet = { ret: '0.248', retc: '24.8', tax: '0.04', setup: '0.025', buy: '3008', sellc: '3008', buyfee: '0', pmode: 'auto' };
try { Object.assign(cSet, JSON.parse(localStorage.craft_settings || '{}')); } catch {}
let cRecipes = [];
try { cRecipes = JSON.parse(localStorage.craft_recipes || '[]'); } catch {}
let cProd = '', cMats = [{ id: '', qty: 1, price: '' }];
let cEd = { qty: 10, sell: '', art: 0, fee: 0, name: '' };

let OFFER = null; // 'id|loc' -> { p: lowest sell offer (any quality), ts }
function offerOf(id, loc) {
  if (!OFFER) {
    OFFER = new Map();
    for (const r of LATEST) {
      if (r.type !== 0) continue;
      const k = r.id + '|' + r.loc;
      const cur = OFFER.get(k);
      if (!cur || r.price < cur.p) OFFER.set(k, { p: r.price, ts: r.ts });
    }
  }
  return OFFER.get(id + '|' + Number(loc)) || null;
}

function settVals() {
  const ret = cSet.ret === 'custom' ? (Number(cSet.retc) || 0) / 100 : Number(cSet.ret);
  return { ret, tax: Number(cSet.tax), setup: Number(cSet.setup), buy: Number(cSet.buy),
           sellc: Number(cSet.sellc), buyfee: Number(cSet.buyfee), manual: cSet.pmode === 'manual' };
}

// cost/item = returnable mats * (1 + buy-order setup fee) * (1 - return rate) + artifact + station fee
function craftCalc(mats, art, fee, sellManual, prodId) {
  const s = settVals();
  let mat = 0; const miss = [];
  for (const m of mats) {
    if (!m.id) continue;
    const auto = s.manual ? null : offerOf(m.id, s.buy);
    const p = (m.price !== '' && m.price != null) ? Number(m.price) : (auto ? auto.p : null);
    if (p == null) { miss.push(nameOf(m.id)); continue; }
    mat += (Number(m.qty) || 0) * p;
  }
  const cost = mat * (1 + s.buyfee) * (1 - s.ret) + (Number(art) || 0) + (Number(fee) || 0);
  const cut = 1 - s.tax - s.setup;
  const autoSell = (!s.manual && prodId) ? offerOf(prodId, s.sellc) : null;
  const sp = (sellManual !== '' && sellManual != null) ? Number(sellManual) : (autoSell ? autoSell.p : null);
  if (sp == null && prodId) miss.push('ราคาขาย ' + nameOf(prodId));
  const net = sp != null ? sp * cut : null;
  return { cost, sp, net, profit: net != null ? net - cost : null, be: cut > 0 ? cost / cut : null, miss };
}

function acAttach(inp, onpick) {
  let box = null;
  const close = () => { if (box) { box.remove(); box = null; } };
  inp.addEventListener('input', () => {
    close();
    const q = inp.value.trim().toLowerCase();
    if (q.length < 2) return;
    const hits = [];
    for (const id in NAMES) {
      if (id.toLowerCase().includes(q) || NAMES[id].toLowerCase().includes(q)) {
        hits.push(id);
        if (hits.length >= 15) break;
      }
    }
    const raw = inp.value.trim().toUpperCase();
    if (!hits.length && raw.includes('_')) hits.push(raw); // raw ids incl. enchants (@1)
    if (!hits.length) return;
    box = document.createElement('div'); box.className = 'aclist';
    for (const id of hits) {
      const d = document.createElement('div');
      d.innerHTML = `<b>${esc(NAMES[id] || id)}</b> <span class="iid">${esc(id)}</span>`;
      d.onmousedown = e => { e.preventDefault(); inp.value = NAMES[id] || id; onpick(id); close(); };
      box.appendChild(d);
    }
    inp.parentElement.appendChild(box);
  });
  inp.addEventListener('blur', () => setTimeout(close, 150));
}

function renderCraft() {
  const retOptions = RET_OPTS.map(([v, t]) =>
    `<option value="${v}" ${cSet.ret === v ? 'selected' : ''}>${t}</option>`).join('');
  const cityOptions = sel => CITY_ORDER.map(l =>
    `<option value="${l}" ${String(sel) === String(l) ? 'selected' : ''}>${CITY[l]}</option>`).join('');

  $('#app').innerHTML = `
  <div class="crumb"><a href="#">หน้าแรก</a> / \u{1F6E0}️ คำนวณคราฟ</div>
  <div class="panelbox"><h2>ตั้งค่าการคำนวณ</h2><div class="cform">
    <label class="cf">แหล่งราคา <select id="kPMode">
      <option value="auto" ${cSet.pmode === 'auto' ? 'selected' : ''}>อัตโนมัติจากตลาด (พิมพ์ทับได้)</option>
      <option value="manual" ${cSet.pmode === 'manual' ? 'selected' : ''}>กรอกเองทั้งหมด</option></select></label>
    <label class="cf">วิธีซื้อวัตถุดิบ <select id="kBuyFee">
      <option value="0" ${cSet.buyfee === '0' ? 'selected' : ''}>ซื้อทันทีจากที่ตั้งขาย</option>
      <option value="0.025" ${cSet.buyfee === '0.025' ? 'selected' : ''}>ตั้งรับซื้อเอง (+2.5% setup)</option></select></label>
    <label class="cf">Return rate <select id="kRet">${retOptions}</select></label>
    <label class="cf" id="kRetCW" style="display:${cSet.ret === 'custom' ? '' : 'none'}">Return rate (%)
      <input class="num" id="kRetC" type="number" step="0.1" min="0" max="90" value="${esc(String(cSet.retc))}"></label>
    <label class="cf">ภาษีขาย <select id="kTax">
      <option value="0.04" ${cSet.tax === '0.04' ? 'selected' : ''}>4% (Premium)</option>
      <option value="0.08" ${cSet.tax === '0.08' ? 'selected' : ''}>8% (ไม่มี Premium)</option></select></label>
    <label class="cf">วิธีขาย <select id="kSetup">
      <option value="0.025" ${cSet.setup === '0.025' ? 'selected' : ''}>ตั้งขาย (+2.5% setup fee)</option>
      <option value="0" ${cSet.setup === '0' ? 'selected' : ''}>ขายทันทีเข้า buy order</option></select></label>
    <label class="cf">เมืองซื้อวัตถุดิบ <select id="kBuy">${cityOptions(cSet.buy)}</select></label>
    <label class="cf">เมืองขายของ <select id="kSell">${cityOptions(cSet.sellc)}</select></label>
  </div></div>
  <div class="panelbox"><h2>สูตรคราฟ</h2>
    <div class="cform">
      <label class="cf acwrap">ไอเทมที่จะคราฟ <input id="kProd" style="width:270px" autocomplete="off"
        placeholder="พิมพ์ชื่อหรือรหัส เช่น bow, T4_2H_BOW" value="${cProd ? esc(nameOf(cProd)) : ''}"></label>
      <label class="cf">จำนวนที่คราฟ <input class="num" id="kQty" type="number" min="1" value="${esc(String(cEd.qty))}"></label>
      <label class="cf">ราคาขาย/ชิ้น <input class="num" id="kSellP" type="number" placeholder="อัตโนมัติ" value="${esc(String(cEd.sell))}"></label>
      <label class="cf">ค่า artifact/ครั้ง <input class="num" id="kArt" type="number" value="${esc(String(cEd.art))}"></label>
      <label class="cf">ค่าสถานีคราฟ/ครั้ง <input class="num" id="kFee" type="number" value="${esc(String(cEd.fee))}"></label>
    </div>
    <div id="kMats"></div>
    <div style="margin-top:12px"><button class="btn ghost" id="kAddMat">+ เพิ่มวัตถุดิบ</button></div>
    <div class="kpis" id="kOut"></div><div class="cwarn" id="kWarn"></div>
    <div style="margin-top:16px; display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap">
      <label class="cf">ชื่อสูตร <input id="kName" style="width:220px" value="${esc(String(cEd.name))}"></label>
      <button class="btn" id="kSave">บันทึกสูตร</button>
    </div>
  </div>
  <div class="panelbox"><h2>สูตรที่บันทึกไว้ (คำนวณด้วยราคาล่าสุดเสมอ)</h2><div id="kRecipes"></div></div>
  <div class="hint" style="padding:10px 20px 0">ราคาวัตถุดิบ = ราคาขายต่ำสุดในเมืองที่เลือก ณ ข้อมูลล่าสุดของเว็บ | พิมพ์ราคาเองทับได้ทุกช่อง | สูตรบันทึกไว้ในเครื่องคุณเท่านั้น</div>`;

  const S = id => document.getElementById(id);
  const saveSet = () => { localStorage.craft_settings = JSON.stringify(cSet); };

  function updateOut() {
    const s = settVals();
    // city pickers only matter when prices come from market data
    S('kBuy').parentElement.style.display = s.manual ? 'none' : '';
    S('kSell').parentElement.style.display = s.manual ? 'none' : '';
    // auto-price hints on material rows
    [...S('kMats').children].forEach((row, i) => {
      const hint = row.querySelector('.autop');
      const m = cMats[i];
      if (!hint || !m) return;
      const priceIn = row.querySelectorAll('input')[2];
      priceIn.placeholder = s.manual ? 'กรอกราคา' : 'อัตโนมัติ';
      const ap = (!s.manual && m.id) ? offerOf(m.id, s.buy) : null;
      hint.textContent = (m.id && !s.manual) ? (ap ? 'ตลาด: ' + fmt(ap.p) : 'ไม่มีราคาในข้อมูล') : '';
    });
    const apSell = (!s.manual && cProd) ? offerOf(cProd, s.sellc) : null;
    S('kSellP').placeholder = s.manual ? 'กรอกราคา' : (apSell ? fmt(apSell.p) : 'อัตโนมัติ');

    const qty = Number(cEd.qty) || 1;
    const r = craftCalc(cMats, cEd.art, cEd.fee, cEd.sell, cProd);
    const pc = v => v > 0 ? 'pos' : (v < 0 ? 'neg' : '');
    const kpi = (label, val, cls) =>
      `<label class="cf">${label} <span class="v ${cls || ''}">${val}</span></label>`;
    S('kOut').innerHTML =
      kpi('ต้นทุน/ชิ้น', fmt(Math.round(r.cost))) +
      kpi('ราคาขายที่ใช้', r.sp != null ? fmt(r.sp) : '-') +
      kpi('รับสุทธิ/ชิ้น', r.net != null ? fmt(Math.round(r.net)) : '-') +
      kpi('กำไร/ชิ้น', r.profit != null ? fmt(Math.round(r.profit)) : '-', r.profit != null ? pc(r.profit) : '') +
      kpi('กำไรรวม x' + qty, r.profit != null ? fmt(Math.round(r.profit * qty)) : '-', r.profit != null ? pc(r.profit) : '') +
      kpi('Margin', r.profit != null && r.cost > 0 ? (100 * r.profit / r.cost).toFixed(1) + '%' : '-') +
      kpi('ราคาคุ้มทุน', r.be != null ? fmt(Math.ceil(r.be)) : '-');
    S('kWarn').textContent = r.miss.length
      ? (s.manual ? 'ยังไม่ได้กรอกราคา: ' : 'ไม่มีราคาของ: ') + r.miss.join(', ') +
        (s.manual ? '' : ' (กรอกราคาเองได้)') : '';
  }

  function renderMatRows() {
    const wrap = S('kMats');
    wrap.innerHTML = '';
    cMats.forEach((m, i) => {
      const row = document.createElement('div'); row.className = 'mrow';
      row.innerHTML =
        `<label class="cf acwrap">วัตถุดิบ ${i + 1} <input style="width:250px" autocomplete="off" placeholder="พิมพ์ชื่อหรือรหัส"></label>` +
        '<label class="cf">จำนวน/ครั้ง <input class="num" type="number" min="0"></label>' +
        '<label class="cf">ราคา/หน่วย <input class="num" type="number" placeholder="อัตโนมัติ"></label>' +
        '<span class="autop"></span>' +
        '<button class="btn ghost mini">ลบ</button>';
      const [nameIn, qtyIn, priceIn] = row.querySelectorAll('input');
      nameIn.value = m.id ? nameOf(m.id) : '';
      qtyIn.value = m.qty;
      priceIn.value = m.price;
      acAttach(nameIn, id => { m.id = id; updateOut(); });
      qtyIn.addEventListener('input', () => { m.qty = qtyIn.value; updateOut(); });
      priceIn.addEventListener('input', () => { m.price = priceIn.value; updateOut(); });
      row.querySelector('button').onclick = () => { cMats.splice(i, 1); renderMatRows(); updateOut(); };
      wrap.appendChild(row);
    });
  }

  function renderRecipesTbl() {
    const el = S('kRecipes');
    if (!cRecipes.length) { el.innerHTML = '<span class="autop">ยังไม่มีสูตรที่บันทึกไว้</span>'; return; }
    let html = '<div class="tablewrap"><table><thead><tr><th>สูตร</th><th>ไอเทม</th><th>ต้นทุน/ชิ้น</th>' +
               '<th>ขาย/ชิ้น</th><th>กำไร/ชิ้น</th><th>Margin</th><th>คุ้มทุน</th><th></th></tr></thead><tbody>';
    cRecipes.forEach((rc, i) => {
      const r = craftCalc(rc.mats, rc.art, rc.fee, rc.sell, rc.prod);
      const cls = r.profit > 0 ? 'pos' : (r.profit < 0 ? 'neg' : '');
      html += `<tr><td>${esc(rc.name)}</td>` +
        `<td>${rc.prod ? esc(nameOf(rc.prod)) : '-'}</td>` +
        `<td>${fmt(Math.round(r.cost))}</td>` +
        `<td>${r.sp != null ? fmt(r.sp) : '-'}</td>` +
        `<td class="${cls}">${r.profit != null ? fmt(Math.round(r.profit)) : '-'}</td>` +
        `<td>${r.profit != null && r.cost > 0 ? (100 * r.profit / r.cost).toFixed(1) + '%' : '-'}</td>` +
        `<td>${r.be != null ? fmt(Math.ceil(r.be)) : '-'}</td>` +
        `<td><button class="btn ghost mini" data-act="load" data-i="${i}">แก้ไข</button> ` +
        `<button class="btn ghost mini" data-act="del" data-i="${i}">ลบ</button></td></tr>`;
    });
    el.innerHTML = html + '</tbody></table></div>';
  }

  const bindSet = (id, key, after) => S(id).addEventListener('input', () => {
    cSet[key] = S(id).value; saveSet();
    if (after) after();
    updateOut(); renderRecipesTbl();
  });
  bindSet('kRet', 'ret', () => { S('kRetCW').style.display = cSet.ret === 'custom' ? '' : 'none'; });
  bindSet('kRetC', 'retc'); bindSet('kTax', 'tax'); bindSet('kSetup', 'setup');
  bindSet('kBuy', 'buy'); bindSet('kSell', 'sellc');
  bindSet('kPMode', 'pmode'); bindSet('kBuyFee', 'buyfee');

  const bindEd = (id, key) => S(id).addEventListener('input', () => { cEd[key] = S(id).value; updateOut(); });
  bindEd('kQty', 'qty'); bindEd('kSellP', 'sell'); bindEd('kArt', 'art'); bindEd('kFee', 'fee');
  S('kName').addEventListener('input', () => { cEd.name = S('kName').value; });

  acAttach(S('kProd'), id => { cProd = id; updateOut(); });
  S('kAddMat').onclick = () => { cMats.push({ id: '', qty: 1, price: '' }); renderMatRows(); };
  S('kSave').onclick = () => {
    if (!cProd && !cMats.some(m => m.id)) return;
    const name = cEd.name.trim() || (cProd ? nameOf(cProd) : 'สูตร ' + (cRecipes.length + 1));
    cRecipes.push({ name, prod: cProd, sell: cEd.sell, art: cEd.art, fee: cEd.fee,
                    mats: cMats.map(m => ({ id: m.id, qty: m.qty, price: m.price })) });
    localStorage.craft_recipes = JSON.stringify(cRecipes);
    cEd.name = ''; S('kName').value = '';
    renderRecipesTbl();
  };
  S('kRecipes').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const i = Number(b.dataset.i);
    if (b.dataset.act === 'del') {
      cRecipes.splice(i, 1);
      localStorage.craft_recipes = JSON.stringify(cRecipes);
      renderRecipesTbl();
    } else if (b.dataset.act === 'load') {
      const rc = cRecipes[i];
      cProd = rc.prod;
      cEd = { qty: cEd.qty, sell: rc.sell, art: rc.art, fee: rc.fee, name: rc.name };
      cMats = rc.mats.map(m => ({ id: m.id, qty: m.qty, price: m.price }));
      renderCraft();
    }
  });

  renderMatRows();
  updateOut();
  renderRecipesTbl();
}

boot();
