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

let NAMES = {}, LATEST = [], DAILY = [], META = {};
// list-view filter state
let fType = 0, fTier = '', fEnch = '', fQual = 0;
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
  const m = (Date.now() - new Date(iso).getTime()) / 60000;
  if (m < 60) return [Math.max(1, Math.round(m)) + ' นาที', 'fresh'];
  if (m < 1440) return [Math.round(m / 60) + ' ชม.', 'fresh'];
  if (m < 10080) return [Math.round(m / 1440) + ' วัน', ''];
  return [Math.round(m / 10080) + ' สัปดาห์', 'old'];
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
  for (const c of CATS) {
    const n = counts[c.key] ? counts[c.key].size : 0;
    if (c.key === 'other' && n === 0) continue;
    html += `<div class="card" onclick="location.hash='#c/${c.key}'">
      <div class="ico">${c.ico}</div><div class="t">${c.label}</div>
      <div class="n">${n ? n + ' ไอเทม' : 'ยังไม่มีข้อมูล'}</div></div>`;
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
  const query = (opts.query || '').toLowerCase();

  const match = id => {
    if (cat && catOf(id) !== cat.key) return false;
    if (query && !id.toLowerCase().includes(query) && !nameOf(id).toLowerCase().includes(query)) return false;
    if (fTier && tierOf(id) !== fTier) return false;
    if (fEnch !== '' && enchOf(id) !== fEnch) return false;
    return true;
  };

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

boot();
