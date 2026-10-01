/*
 * RF Band Calculator — 介面邏輯 (app.js)
 * 依賴 core.js（window.RFCore）。狀態儲存在 localStorage，僅存於本機。
 */
(function () {
  'use strict';

  const APP_VERSION = '1.5.0';
  const CACHE_NAME = 'rfcalc-' + APP_VERSION;
  const R = window.RFCore;
  const { fmt } = R;

  // 無印風格低彩度主色：[淺色模式, 深色模式]
  const THEME = {
    LTE: ['#4E6D7F', '#8FB0C2'], NR: ['#6A6488', '#A9A3C9'], WIFI: ['#5A7867', '#9BBFA9'],
    GNSS: ['#93733F', '#D1AF79'], CABLE: ['#8A605C', '#C99C97'], FSPL: ['#6F7748', '#AEB784'],
  };
  const TAB_THEME = { CELL: 'LTE', WIFI: 'WIFI', GNSS: 'GNSS', CABLE: 'CABLE', FSPL: 'FSPL' };
  const darkMQ = window.matchMedia('(prefers-color-scheme: dark)');

  // ------------------------------------------------------------ 語言
  const I18N = window.RF_I18N || {};
  let lang = (() => {
    try { const v = localStorage.getItem('rfcalc.lang'); if (v === 'zh' || v === 'en') return v; } catch (e) { /* 忽略 */ }
    return /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
  })();
  const PUNCT = [[/（/g, ' ('], [/）/g, ')'], [/，/g, ', '], [/；/g, '; '], [/、/g, ', '], [/：/g, ': '], [/　/g, '  '],
    [/／/g, ' / '], [/。/g, '.'], [/「/g, '"'], [/」/g, '"'], [/＋/g, '+'], [/！/g, '!']];
  let phraseRE = null;
  /** 中文 → 英文：以片語字典替換（長字串優先），再轉換全形標點 */
  function tr(s) {
    if (lang !== 'en' || s === null || s === undefined) return s;
    s = String(s);
    if (!/[\u3000-\u9fff\uff00-\uffef]/.test(s)) return s;
    if (!phraseRE) {
      const keys = Object.keys(I18N).sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      phraseRE = new RegExp(keys.join('|'), 'g');
    }
    let t = s.replace(phraseRE, (m) => I18N[m]);
    for (const [re, v] of PUNCT) t = t.replace(re, v);
    return t.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\s+([,.;:])/g, '$1').replace(/^\s+|\s+$/g, '').replace(/ {3,}/g, '  ');
  }
  window.RF_tr = tr;   // 供測試使用
  const TITLES = { WIFI: 'Wi-Fi', GNSS: 'GNSS', CABLE: 'Cable Loss', FSPL: 'FSPL' };

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ------------------------------------------------------------ 狀態
  const STORE_KEY = 'rfcalc.state.v1';
  const DEFAULTS = {
    tool: 'CELL',
    tech: 'LTE',
    cell: { LTE: { band: 3 }, NR: { band: 78 } },
    wifi: { band: '5 GHz', ch: 36, bw: '80 MHz' },
    gnss: { sys: 0, sig: 0 },
    cable: { cable: '1.13 mm Normal', a1: '2', a6: '5.3', len: '100', unit: 'mm', freq: '2400', other: '0', pin: '' },
    fspl: { dist: '10', unit: 'm', freq: '2400', tx: '20', rx: '-80', gt: '0', gr: '0' },
  };
  function loadState() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (s && typeof s === 'object') return Object.assign(structuredClone(DEFAULTS), s);
    } catch (e) { /* 讀取失敗時使用預設值 */ }
    return structuredClone(DEFAULTS);
  }
  const S = loadState();
  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* 私密瀏覽等情況忽略 */ }
  }

  let message = null;          // { text, kind }
  let lastGood = {};           // Cable / FSPL 的上一筆有效結果
  let lastOut = null;

  // ------------------------------------------------------------ 主題
  const accentOf = (key) => THEME[key][darkMQ.matches ? 1 : 0];
  function applyTheme(key) {
    const acc = accentOf(key);
    const root = document.documentElement.style;
    root.setProperty('--accent', acc);
    root.setProperty('--accent-soft', acc + '1F');
    document.querySelectorAll('.tab').forEach((t) => t.style.setProperty('--tab-color', accentOf(TAB_THEME[t.dataset.tool])));
  }
  const themeKey = () => (S.tool === 'CELL' ? S.tech : S.tool);

  // ------------------------------------------------------------ DOM 小工具
  function h(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (k === 'text') n.textContent = tr(v);
      else if (k === 'aria-label') n.setAttribute(k, tr(v));
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c !== null && c !== undefined) n.append(typeof c === 'string' ? tr(c) : c);
    return n;
  }
  function field(label, sub, ...ctl) {
    return h('div', { class: 'field' },
      h('label', {}, label, sub ? h('small', { text: sub }) : null),
      h('div', { class: 'ctl' }, ...ctl));
  }
  function select(options, value, onchange, aria) {
    const s = h('select', { 'aria-label': aria, onchange: (e) => onchange(e.target.value) });
    for (const [v, label] of options) s.append(h('option', { value: String(v), text: label }));
    s.value = String(value);
    return s;
  }
  function seg(options, value, onpick) {
    return h('div', { class: 'seg', role: 'group' }, options.map(([v, label]) =>
      h('button', { type: 'button', 'aria-pressed': String(v === value), onclick: () => onpick(v), text: label })));
  }
  function numInput(value, opts) {
    const i = h('input', {
      type: 'text', inputmode: opts.mode || 'decimal', value, autocomplete: 'off', enterkeyhint: 'done',
      'aria-label': opts.aria, disabled: opts.disabled || null,
      style: opts.width ? `width:${opts.width}px` : null,
    });
    if (opts.oninput) i.addEventListener('input', () => opts.oninput(i.value, i));
    if (opts.oncommit) i.addEventListener('change', () => opts.oncommit(i.value, i));
    i.addEventListener('keydown', (e) => { if (e.key === 'Enter') i.blur(); });
    return i;
  }
  /** ± 按鈕：iPhone 數字鍵盤沒有負號 */
  function signBtn(input) {
    return h('button', { type: 'button', class: 'stepbtn', 'aria-label': '切換正負號', text: '±', onclick: () => {
      const v = input.value.trim();
      input.value = v.startsWith('-') ? v.slice(1) : (v ? '-' + v : '-');
      input.dispatchEvent(new Event('input'));
    } });
  }
  function parseNum(text) {
    const t = String(text).trim().replace(/[，,]/g, '.').replace(/[−－]/g, '-');
    if (t === '' || t === '-' || t === '.') return NaN;
    return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t) ? Number(t) : NaN;
  }

  // ============================================================ LTE / NR
  function cellState() {
    const tech = S.tech;
    const st = S.cell[tech] || (S.cell[tech] = {});
    const bands = R.Cell.bands(tech);
    let b = bands.find((x) => x.num === st.band) || bands.find((x) => x.num === (tech === 'LTE' ? 3 : 78));
    st.band = b.num;
    const scsOpts = R.Cell.scsOptions(b);
    if (tech === 'LTE') st.scs = 15;
    else if (!scsOpts.includes(st.scs)) st.scs = R.Cell.defaultScs(b);
    const bwOpts = R.Cell.bwOptions(b, st.scs);
    if (!bwOpts.includes(st.bw)) st.bw = R.Cell.defaultBw(b, st.scs);
    const [lo, hi] = R.Cell.bandChRange(b, st.scs);
    if (typeof st.ch !== 'number' || st.ch < lo || st.ch > hi) st.ch = R.Cell.defaultCh(b, st.bw, st.scs);
    return { tech, st, b };
  }
  function cellSetBand(num) {
    const st = S.cell[S.tech];
    const b = R.Cell.bands(S.tech).find((x) => x.num === num);
    st.band = num;
    st.scs = R.Cell.defaultScs(b);
    st.bw = R.Cell.defaultBw(b, st.scs);
    st.ch = R.Cell.defaultCh(b, st.bw, st.scs);
    message = null;
    renderTool();
  }

  function buildCellInputs(box) {
    const { tech, st, b } = cellState();
    box.append(seg([['LTE', '4G LTE'], ['NR', '5G NR']], tech, (v) => { S.tech = v; message = null; renderTool(); }));

    const bands = R.Cell.bands(tech);
    box.append(field('頻段', null, select(bands.map((x) => [x.num, `${x.name}  ${x.alias}`]), b.num,
      (v) => cellSetBand(Number(v)), '頻段')));

    if (tech === 'NR') {
      box.append(field('子載波間隔', 'SCS', select(R.Cell.scsOptions(b).map((s) => [s, `${s} kHz`]), st.scs, (v) => {
        const oldBw = st.bw;
        st.scs = Number(v);
        const opts = R.Cell.bwOptions(b, st.scs);
        if (!opts.includes(st.bw)) st.bw = R.Cell.defaultBw(b, st.scs);
        st.ch = R.Cell.snap(b, st.bw, st.scs, st.ch);
        message = oldBw !== st.bw ? { kind: 'warn', text: `此 SCS 不支援 ${fmt(oldBw)} MHz，已改為 ${fmt(st.bw)} MHz。` } : null;
        renderTool();
      }, 'SCS')));
    }

    box.append(field('通道頻寬', null, select(R.Cell.bwOptions(b, st.scs).map((x) => [x, `${fmt(x)} MHz`]), st.bw, (v) => {
      st.bw = Number(v);
      const old = st.ch;
      st.ch = R.Cell.snap(b, st.bw, st.scs, old);
      message = old !== st.ch ? { kind: 'warn', text: `頻道已依新頻寬調整：${old} → ${st.ch}` } : null;
      renderTool();
    }, '通道頻寬')));

    const step = R.Cell.step(b, st.scs);
    const chName = R.Cell.chName(tech);
    const fdd = b.duplex === 'FDD';
    const err = (text) => { message = { kind: 'err', text }; renderTool(); };
    /** 以 DL 通道號設定（共用：DL / UL 輸入最後都換算為 DL） */
    const applyDl = (n, info) => {
      const [lo, hi] = R.Cell.bandChRange(b, st.scs);
      if (n < lo || n > hi) return err(`${chName} ${n} 不在此頻段範圍 ${lo} – ${hi}。`);
      const a = R.Cell.align(b, st.scs, n);
      st.ch = a;
      message = a !== n ? { kind: 'warn', text: `已對齊通道柵格：${n} → ${a}` } : info || null;
      renderTool();
    };
    const num = (val, what) => { const v = parseNum(val); if (Number.isNaN(v)) { err(`「${val}」不是有效的${what}。`); return null; } return v; };
    const onDlCh = (val) => { const v = num(val, ` ${chName}`); if (v !== null) applyDl(Math.trunc(v)); };
    const onDlFreq = (val) => {
      const v = num(val, '頻率'); if (v === null) return;
      const [plo, phi] = R.Cell.primary(b)[1];
      if (v < plo || v > phi) return err(`${fmt(v)} MHz 不在此頻段 ${fmt(plo)} – ${fmt(phi)} MHz 內。`);
      const [lo, hi] = R.Cell.bandChRange(b, st.scs);
      const n = Math.min(Math.max(R.Cell.freqToCh(b, v, st.scs), lo), hi);
      const f2 = R.Cell.chToFreq(b, n);
      applyDl(n, Math.abs(f2 - v) > 1e-6 ? { kind: 'info', text: `已換算至最近頻點 ${fmt(f2)} MHz` } : null);
    };
    const onUlCh = (val) => {
      const v = num(val, ` UL ${chName}`); if (v === null) return;
      const r = R.Cell.dlFromUlCh(b, Math.trunc(v), st.scs);
      if (typeof r === 'string') return err(r);
      applyDl(r);
    };
    const onUlFreq = (val) => {
      const v = num(val, '頻率'); if (v === null) return;
      const r = R.Cell.dlFromUlFreq(b, v, st.scs);
      if (typeof r === 'string') return err(r);
      applyDl(r);
    };

    const f = R.Cell.chToFreq(b, st.ch);
    const ul = fdd ? R.Cell.ulOf(b, st.bw, st.ch) : null;
    const head = fdd ? ['DL', 'UL'] : [{ TDD: 'DL / UL', SUL: 'UL', SDL: 'DL' }[b.duplex] || 'DL'];
    const grid = h('div', { class: 'dual' + (fdd ? '' : ' single') }, h('span'), head.map((t) => h('span', { class: 'dual-head', text: t })));
    grid.append(h('label', {}, chName, h('small', { text: `步進 ${step}` })));
    grid.append(numInput(String(st.ch), { mode: 'numeric', aria: fdd ? `DL ${chName}` : chName, oncommit: onDlCh }));
    if (fdd) grid.append(numInput(ul ? String(ul.n) : '—', { mode: 'numeric', aria: `UL ${chName}`, disabled: !ul, oncommit: onUlCh }));
    grid.append(h('label', {}, '中心頻率', h('small', { text: 'MHz' })));
    grid.append(numInput(fmt(f), { aria: fdd ? 'DL 中心頻率' : '中心頻率', oncommit: onDlFreq }));
    if (fdd) grid.append(numInput(ul ? fmt(ul.f) : '—', { aria: 'UL 中心頻率', disabled: !ul, oncommit: onUlFreq }));
    box.append(h('div', { class: 'field' }, grid));
    if (fdd && !ul) box.append(h('div', { class: 'note', text: '此 DL 頻點無對應 UL（僅能作為 CA 下行）。' }));

    const stepper = (d) => h('button', { type: 'button', class: 'stepbtn', 'aria-label': d > 0 ? '下一個頻點' : '上一個頻點',
      text: d > 0 ? '+' : '−', onclick: () => {
        const [lo, hi] = R.Cell.bandChRange(b, st.scs);
        st.ch = Math.min(Math.max(st.ch + d * step, lo), hi);
        message = null;
        renderTool();
      } });
    box.append(field('微調頻點', `步進 ${step}`, stepper(-1), stepper(1)));

    const p = R.Cell.lmh(b, st.bw, st.scs);
    if (p) box.append(field('測試頻點', 'L / M / H', lmhButtons((k) => p[k].n === st.ch, (k) => { st.ch = p[k].n; message = null; renderTool(); })));
  }

  /** L / M / H 快速設定按鈕 */
  function lmhButtons(isOn, onPick) {
    return h('div', { class: 'lmh', role: 'group' }, ['L', 'M', 'H'].map((k) =>
      h('button', { type: 'button', 'aria-pressed': String(isOn(k)), 'aria-label': { L: '低頻點', M: '中頻點', H: '高頻點' }[k],
        onclick: () => onPick(k), text: k })));
  }

  function computeCell() {
    const { tech, st, b } = cellState();
    return { out: R.Cell.compute(b, st.bw, st.ch, st.scs), title: tech === 'LTE' ? '4G LTE' : '5G NR' };
  }

  // ============================================================ Wi-Fi
  function buildWifiInputs(box) {
    const w = S.wifi;
    const info = R.WiFi.bands[w.band] || R.WiFi.bands['5 GHz'];
    if (!info.channels.includes(w.ch)) w.ch = info.defCh;
    if (!info.bws.includes(w.bw)) w.bw = info.defBw;
    box.append(seg(Object.keys(R.WiFi.bands).map((k) => [k, k]), w.band, (v) => {
      if (v !== w.band) { w.band = v; w.ch = R.WiFi.bands[v].defCh; w.bw = R.WiFi.bands[v].defBw; }
      renderTool();
    }));
    const stepper = (d) => h('button', { type: 'button', class: 'stepbtn', 'aria-label': d > 0 ? '下一個通道' : '上一個通道',
      text: d > 0 ? '+' : '−', onclick: () => {
        const c = info.channels, i = c.indexOf(w.ch);
        w.ch = c[Math.min(Math.max(i + d, 0), c.length - 1)];
        renderTool();
      } });
    box.append(field('主通道', 'UL / DL 同頻（TDD）', stepper(-1),
      select(info.channels.map((c) => [c, `${c}  (${fmt(R.WiFi.freq(w.band, c))})`]), w.ch, (v) => { w.ch = Number(v); renderTool(); }, '主通道'),
      stepper(1)));
    const fIn = numInput(fmt(R.WiFi.freq(w.band, w.ch)), { aria: '中心頻率', width: 112, oncommit: (val) => {
      const v = parseNum(val);
      if (Number.isNaN(v)) { message = { kind: 'err', text: `「${val}」不是有效的頻率。` }; return renderTool(); }
      let best = info.channels[0];
      for (const c of info.channels) if (Math.abs(R.WiFi.freq(w.band, c) - v) < Math.abs(R.WiFi.freq(w.band, best) - v)) best = c;
      const fb = R.WiFi.freq(w.band, best);
      w.ch = best;
      message = Math.abs(fb - v) > 1e-6 ? { kind: 'info', text: `已換算至最近通道 CH ${best}（${fmt(fb)} MHz）` } : null;
      renderTool();
    } });
    box.append(field('中心頻率', 'UL / DL 同頻（主通道）', fIn, h('span', { class: 'unit', text: 'MHz' })));
    box.append(field('通道頻寬', null, select(info.bws.map((x) => [x, x]), w.bw, (v) => { w.bw = v; renderTool(); }, '通道頻寬')));
    const p = R.WiFi.lmh(w.band, w.bw);
    if (p) {
      box.append(field('測試通道', 'L / M / H', lmhButtons((k) => p[k].members.includes(w.ch),
        (k) => { w.ch = p[k].members[0]; renderTool(); })));
    }
  }

  // ============================================================ GNSS
  function buildGnssInputs(box) {
    const g = S.gnss;
    const systems = R.GNSS.systems;
    if (!systems[g.sys]) g.sys = 0;
    if (!systems[g.sys].signals[g.sig]) g.sig = 0;
    box.append(field('衛星系統', null, select(systems.map((s, i) => [i, s.name]), g.sys,
      (v) => { g.sys = Number(v); g.sig = 0; renderTool(); }, '衛星系統')));
    box.append(field('訊號頻段', null, select(systems[g.sys].signals.map((s, i) => [i, `${s.name}  (${fmt(s.fc, 4)})`]), g.sig,
      (v) => { g.sig = Number(v); renderTool(); }, '訊號頻段')));
  }

  // ============================================================ Cable Loss
  function buildCableInputs(box) {
    const c = S.cable;
    const custom = c.cable === R.Cable.customName;
    const names = R.Cable.cables.map((x) => x.name).concat([R.Cable.customName]);
    if (!names.includes(c.cable)) c.cable = '1.13 mm Normal';
    box.append(field('線材', null, select(names.map((n) => [n, n]), c.cable, (v) => {
      c.cable = v;
      const k = R.Cable.cables.find((x) => x.name === v);
      if (k) { c.a1 = fmt(k.a1); c.a6 = fmt(k.a6); }
      renderTool();
    }, '線材')));
    const live = (key) => (val) => { c[key] = val; update(); };
    box.append(field('衰減 @ 1 GHz', custom ? '輸入規格書數值' : '典型值',
      numInput(c.a1, { aria: '1 GHz 衰減', width: 96, disabled: !custom, oninput: live('a1') }), h('span', { class: 'unit', text: 'dB/m' })));
    box.append(field('衰減 @ 6 GHz', null,
      numInput(c.a6, { aria: '6 GHz 衰減', width: 96, disabled: !custom, oninput: live('a6') }), h('span', { class: 'unit', text: 'dB/m' })));
    box.append(field('長度', null, numInput(c.len, { aria: '長度', width: 96, oninput: live('len') }),
      select(Object.keys(R.Cable.lenUnits).map((u) => [u, u]), c.unit, (v) => { c.unit = v; update(); }, '長度單位')));
    box.append(field('頻率', null, numInput(c.freq, { aria: '頻率', width: 112, oninput: live('freq') }), h('span', { class: 'unit', text: 'MHz' })));
    box.append(field('其他損耗', '連接器等，選填', numInput(c.other, { aria: '其他損耗', width: 96, oninput: live('other') }), h('span', { class: 'unit', text: 'dB' })));
    const pin = numInput(c.pin, { aria: '輸入功率', width: 96, oninput: live('pin') });
    box.append(field('輸入功率', '選填', signBtn(pin), pin, h('span', { class: 'unit', text: 'dBm' })));
    box.append(h('div', { class: 'note', text: '內建值為常見典型值，實際請以線材規格書為準；選擇「自訂」可輸入規格書數值。' }));
  }

  function readNum(key, val, name, { allowEmpty = false, positive = false } = {}) {
    const t = String(val).trim();
    if (t === '') { if (allowEmpty) return null; throw { key, msg: `請輸入${name}。` }; }
    const v = parseNum(t);
    if (Number.isNaN(v)) throw { key, msg: `${name}「${t}」不是有效數值。` };
    if (positive && v <= 0) throw { key, msg: `${name}必須大於 0。` };
    return v;
  }

  function computeCable() {
    const c = S.cable;
    const a1 = readNum('a1', c.a1, '1 GHz 衰減', { positive: true });
    const a6 = readNum('a6', c.a6, '6 GHz 衰減', { positive: true });
    const len = readNum('len', c.len, '長度', { positive: true }) * R.Cable.lenUnits[c.unit];
    const f = readNum('freq', c.freq, '頻率', { positive: true });
    const other = readNum('other', c.other, '其他損耗', { allowEmpty: true }) || 0;
    const pin = readNum('pin', c.pin, '輸入功率', { allowEmpty: true });
    return R.Cable.compute(c.cable, a1, a6, len, f, other, pin);
  }

  // ============================================================ FSPL
  function buildFsplInputs(box) {
    const p = S.fspl;
    const live = (key) => (val) => { p[key] = val; update(); };
    box.append(field('距離', null, numInput(p.dist, { aria: '距離', width: 112, oninput: live('dist') }),
      select(Object.keys(R.FSPL.distUnits).map((u) => [u, u]), p.unit, (v) => { p.unit = v; update(); }, '距離單位')));
    box.append(field('頻率', null, numInput(p.freq, { aria: '頻率', width: 112, oninput: live('freq') }), h('span', { class: 'unit', text: 'MHz' })));
    const tx = numInput(p.tx, { aria: '發射端功率', width: 90, oninput: live('tx') });
    box.append(field('發射端功率', 'Tx', signBtn(tx), tx, h('span', { class: 'unit', text: 'dBm' })));
    const rx = numInput(p.rx, { aria: '接收端功率', width: 90, oninput: live('rx') });
    box.append(field('接收端功率', 'Rx，靈敏度或實測值', signBtn(rx), rx, h('span', { class: 'unit', text: 'dBm' })));
    const gt = numInput(p.gt, { aria: '發射天線增益', width: 90, oninput: live('gt') });
    box.append(field('發射天線增益', 'Gt，選填', signBtn(gt), gt, h('span', { class: 'unit', text: 'dBi' })));
    const gr = numInput(p.gr, { aria: '接收天線增益', width: 90, oninput: live('gr') });
    box.append(field('接收天線增益', 'Gr，選填', signBtn(gr), gr, h('span', { class: 'unit', text: 'dBi' })));
  }

  function computeFspl() {
    const p = S.fspl;
    const d = readNum('dist', p.dist, '距離', { positive: true }) * R.FSPL.distUnits[p.unit];
    const f = readNum('freq', p.freq, '頻率', { positive: true });
    const tx = readNum('tx', p.tx, '發射端功率');
    const rx = readNum('rx', p.rx, '接收端功率');
    const gt = readNum('gt', p.gt, '發射天線增益', { allowEmpty: true }) || 0;
    const gr = readNum('gr', p.gr, '接收天線增益', { allowEmpty: true }) || 0;
    return R.FSPL.compute(d, f, tx, rx, gt, gr);
  }

  // ============================================================ 渲染
  const BUILDERS = { CELL: buildCellInputs, WIFI: buildWifiInputs, GNSS: buildGnssInputs, CABLE: buildCableInputs, FSPL: buildFsplInputs };

  function renderTool() {
    applyTheme(themeKey());
    $('title').textContent = S.tool === 'CELL' ? (S.tech === 'LTE' ? '4G LTE' : '5G NR') : TITLES[S.tool];
    const rt = { CABLE: '損耗曲線', FSPL: '接收功率曲線' }[S.tool] || '頻譜示意';
    $('readoutTitle').dataset.zh = rt;
    $('readoutBox').open = !S.fold[`${S.tool}|__readout`];
    applyLangStatic();
    document.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tool === S.tool)));
    const box = $('inputs');
    const active = document.activeElement;
    const focusLabel = active && active.getAttribute ? active.getAttribute('aria-label') : null;
    box.replaceChildren();
    BUILDERS[S.tool](box);
    if (focusLabel && active.tagName === 'SELECT') {   // 重建後保留下拉選單焦點
      const again = box.querySelector(`[aria-label="${focusLabel}"]`);
      if (again) again.focus({ preventScroll: true });
    }
    update();
  }

  function update() {
    let out, title, err = null;
    document.querySelectorAll('#inputs input.invalid').forEach((i) => i.classList.remove('invalid'));
    try {
      if (S.tool === 'CELL') ({ out, title } = computeCell());
      else if (S.tool === 'WIFI') { out = R.WiFi.compute(S.wifi.band, S.wifi.ch, S.wifi.bw); title = 'Wi-Fi'; }
      else if (S.tool === 'GNSS') { out = R.GNSS.compute(S.gnss.sys, S.gnss.sig); title = 'GNSS'; }
      else if (S.tool === 'CABLE') { out = computeCable(); title = 'Cable Loss'; }
      else { out = computeFspl(); title = 'FSPL'; }
      lastGood[S.tool] = { out, title };
    } catch (e) {
      if (!e || !e.msg) throw e;
      err = e.msg;
      const map = { a1: '1 GHz 衰減', a6: '6 GHz 衰減', len: '長度', freq: '頻率', other: '其他損耗', pin: '輸入功率',
        dist: '距離', tx: '發射端功率', rx: '接收端功率', gt: '發射天線增益', gr: '接收天線增益' };
      const bad = document.querySelector(`#inputs input[aria-label="${map[e.key]}"]`);
      if (bad) bad.classList.add('invalid');
      ({ out, title } = lastGood[S.tool] || { out: null, title: '' });
    }
    lastOut = out ? { out, title } : null;

    // 訊息：輸入錯誤 > 計算警告 > 操作提示
    const m = $('msg');
    let msg = null;
    if (err) msg = { kind: 'err', text: err };
    else if (out && out.warns.length) {
      const w = out.warns[0];
      msg = { kind: /無法|不在/.test(w) ? 'err' : 'warn', text: w };
    } else if (message) msg = message;
    if (msg) { m.className = 'msg ' + msg.kind; m.textContent = (msg.kind === 'err' ? '✕ ' : msg.kind === 'warn' ? '⚠ ' : '') + tr(msg.text); m.hidden = false; }
    else { m.hidden = true; m.textContent = ''; }

    if (out) {
      out = Object.assign({}, out, { rows: visibleRows(out.rows) });
      lastOut = { out, title };
      renderReadout(out.spec);
      renderResults(out.rows);
    }
    saveState();
  }

  // 行動網路 / Wi-Fi 不顯示的區段（資訊已整合至輸入區與頻譜圖）
  const HIDDEN = { CELL: ['頻道計算', 'L / M / H'], WIFI: ['L / M / H'] };
  function visibleRows(rows) {
    const hide = HIDDEN[S.tool] || [];
    if (!hide.length) return rows;
    const out = [];
    let skip = false;
    for (const r of rows) {
      if (r[1] === null) skip = hide.some((p) => r[0].startsWith(p));
      if (!skip) out.push(r);
    }
    return out;
  }

  /** 摺疊狀態：以「分頁 + 區段名稱（去除括號內容）」為鍵，記憶於本機 */
  if (!S.fold || typeof S.fold !== 'object') S.fold = {};
  const foldKey = (title) => `${S.tool}|${String(title).replace(/（[^）]*）/g, '').trim()}`;

  function renderResults(rows) {
    let html = '';
    let open = false;
    for (const [k, v] of rows) {
      if (v === null) {
        if (open) html += '</dl></details>';
        const key = foldKey(k);
        html += `<details class="group" data-fold="${esc(key)}"${S.fold[key] ? '' : ' open'}><summary><h2>${esc(tr(k))}</h2></summary><dl>`;
        open = true;
      } else {
        html += `<div class="row"><dt>${esc(tr(k))}</dt><dd>${esc(tr(v))}</dd></div>`;
      }
    }
    if (open) html += '</dl></details>';
    $('results').innerHTML = html;
  }

  function setAllFolds(collapsed) {
    document.querySelectorAll('#results details.group').forEach((d) => {
      S.fold[d.dataset.fold] = collapsed;
      d.open = !collapsed;
    });
    const rk = `${S.tool}|__readout`;
    S.fold[rk] = collapsed;
    $('readoutBox').open = !collapsed;
    saveState();
  }

  // ------------------------------------------------------------ 頻譜 / 曲線（SVG）
  let DK = {};
  function panelColors() {
    const cs = getComputedStyle(document.documentElement);
    const v = (n) => cs.getPropertyValue(n).trim();
    DK = { text: v('--p-text'), muted: v('--p-muted'), bar: v('--p-bar'), slot: v('--p-slot'), grid: v('--p-grid'),
      other: v('--p-other'), red: v('--p-red'), redText: v('--p-red-text'), amber: v('--p-amber'), acc: v('--accent') };
  }

  function readoutWidth() { return Math.max(260, $('readout').clientWidth - 24); }

  function renderReadout(spec) {
    if (!spec || !spec.length) { $('readout').innerHTML = ''; return; }
    if (!$('readoutBox').open) return;   // 收合時不重繪，展開時再繪製
    panelColors();
    $('readout').innerHTML = spec[0].type === 'curve' ? curveSVG(spec[0]) : spectrumSVG(spec);
  }

  function spectrumSVG(rows) {
    const W = readoutWidth();
    const RH = 90;
    const acc = DK.acc;
    const parts = [];
    const T = (x, y, s, { size = 11, weight = 400, fill = DK.text, anchor = 'start' } = {}) =>
      parts.push(`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`);
    const RECT = (x, y, w, h, fill, extra = '') => parts.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(w, 0).toFixed(1)}" height="${h.toFixed(1)}" fill="${fill}" ${extra}/>`);
    const LINE = (x1, y1, x2, y2, stroke, w = 1) => parts.push(`<line x1="${x1.toFixed(1)}" y1="${y1}" x2="${x2.toFixed(1)}" y2="${y2}" stroke="${stroke}" stroke-width="${w}"/>`);

    let yAcc = 0;
    rows.forEach((r) => {
      const y = yAcc;
      const extra = (r.ticks && r.ticks.length && r.centerText) ? 16 : 0;
      yAcc += RH + extra;
      const x0 = 0, x1 = W;
      const span = (r.hi - r.lo) || 1;
      const X = (f) => x0 + (Math.min(Math.max(f, r.lo), r.lo + span) - r.lo) / span * (x1 - x0);
      T(x0, y + 12, tr(`${r.label}  ${fmt(r.lo)} – ${fmt(r.hi)} MHz`), { size: 12, weight: 600 });
      if (r.chan) T(x0, y + 27, tr(r.chanText || `頻道 ${fmt(r.chan[0])} – ${fmt(r.chan[1])} MHz`), { fill: acc, weight: 600 });
      const by0 = y + 46, by1 = y + 64;
      // L / M / H 標記（位置相近時合併顯示）
      const marks = [];
      for (const [f, k] of r.marks || []) {
        const xm = X(f), near = marks.find((q) => Math.abs(q.x - xm) < 16);
        if (near) near.k += '/' + k; else marks.push({ x: xm, k });
      }
      for (const q of marks) {
        parts.push(`<path d="M${(q.x - 4).toFixed(1)} ${by0 - 7} L${(q.x + 4).toFixed(1)} ${by0 - 7} L${q.x.toFixed(1)} ${by0 - 2} Z" fill="${DK.muted}"/>`);
        T(Math.min(Math.max(q.x, 8), x1 - 8), by0 - 10, q.k, { size: 9, weight: 700, fill: DK.muted, anchor: 'middle' });
      }
      RECT(x0, by0, x1 - x0, by1 - by0, DK.bar, 'rx="3"');
      for (const [a, b] of r.slots || []) RECT(X(a) + 0.5, by0 + 3, X(b) - X(a) - 1, by1 - by0 - 6, DK.slot);
      const placedZ = [];
      for (const [a, b, lbl] of (r.zones || []).slice().sort((p, q) => (q[1] - q[0]) - (p[1] - p[0]))) {
        RECT(X(a), by0 + 2, X(b) - X(a), by1 - by0 - 4, DK.red, `fill-opacity="0.28" stroke="${DK.red}" stroke-opacity="0.7" stroke-width="0.6"`);
        const xm = (X(a) + X(b)) / 2;
        if (X(b) - X(a) > 28 && placedZ.every((p) => Math.abs(p - xm) > 34)) {
          placedZ.push(xm);
          T(xm, (by0 + by1) / 2 + 3.5, tr(lbl), { size: 9, weight: 700, fill: DK.redText, anchor: 'middle' });
        }
      }
      if (r.chan) {
        const out = r.chan[0] < r.lo - 1e-9 || r.chan[1] > r.hi + 1e-9;
        const c = out ? DK.red : acc;
        RECT(X(r.chan[0]), by0 - 3, Math.max(X(r.chan[1]) - X(r.chan[0]), 2), by1 - by0 + 6, c,
          `fill-opacity="${out ? 0.5 : 0.28}" stroke="${c}" stroke-width="1" rx="2"`);
      }
      if (r.primary) RECT(X(r.primary[0]), by0, Math.max(X(r.primary[1]) - X(r.primary[0]), 2), by1 - by0, acc);
      const ticks = r.ticks || [];
      if (r.center !== undefined && !ticks.length) {
        const xc = X(r.center);
        const label = r.centerText || fmt(r.center);
        const half = label.length * 3.3 + 6;                       // 估計文字半寬
        const xl = Math.min(Math.max(xc, x0 + half), x1 - half);    // 靠邊時往內移，避免被裁切
        LINE(xc, by0 - 6, xc, by1 + 6, acc, 2);
        T(xl, by1 + 18, label, { fill: acc, weight: 700, anchor: 'middle' });
        if (xl - half - x0 > 34) T(x0, by1 + 18, fmt(r.lo), { size: 10, fill: DK.muted });
        if (x1 - (xl + half) > 34) T(x1, by1 + 18, fmt(r.hi), { size: 10, fill: DK.muted, anchor: 'end' });
      }
      if (ticks.length) {
        const placed = [];
        const ordered = ticks.slice().sort((p, q) => (p[2] === 'primary' ? 0 : 1) - (q[2] === 'primary' ? 0 : 1));
        for (const [f, t, kind] of ordered) {
          const xt = X(f);
          const col = kind === 'normal' ? DK.muted : acc;
          LINE(xt, by1, xt, by1 + 5, col);
          if (placed.every((p) => Math.abs(xt - p) >= 6 + 6 * t.length)) {
            placed.push(xt);
            T(xt, by1 + 16, t, { size: 9, weight: kind === 'normal' ? 400 : 700, fill: col, anchor: 'middle' });
          }
        }
      }
      if (ticks.length && r.centerText && r.center !== undefined) {   // Wi-Fi：刻度下方再顯示中心頻率與通道
        const half = r.centerText.length * 3.3 + 6;
        const xl = Math.min(Math.max(X(r.center), x0 + half), x1 - half);
        T(xl, by1 + 32, r.centerText, { fill: acc, weight: 700, anchor: 'middle' });
      }
      if (!r.chan && !r.primary) T((x0 + x1) / 2, (by0 + by1) / 2 + 4, tr('無對應頻道'), { size: 10, fill: DK.muted, anchor: 'middle' });
    });
    const H = yAcc;
    return `<svg viewBox="0 -2 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(tr('頻譜示意圖'))}" font-family="inherit">${parts.join('')}</svg>`;
  }

  function curveSVG(r) {
    const W = readoutWidth(), H = 232;
    const L = 46, Rm = 8, T0 = 44, B = 24;
    const x0 = L, x1 = W - Rm, y0 = T0, y1 = H - B;
    const acc = DK.acc;
    const [xmin, xmax] = r.xrange;
    const ys = r.series.flatMap((s) => s.ys).concat(r.point ? [r.point[1]] : [], r.hline ? [r.hline[0]] : []);
    let ymin = Math.min(...ys), ymax = Math.max(...ys);
    if (ymax - ymin < 1e-9) { ymin -= 1; ymax += 1; }
    const raw = (ymax - ymin) / 5, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((v) => v >= raw);
    ymin = Math.floor(ymin / step) * step; ymax = Math.ceil(ymax / step) * step;
    const X = r.xlog
      ? (x) => x0 + (Math.log10(x) - Math.log10(xmin)) / (Math.log10(xmax) - Math.log10(xmin)) * (x1 - x0)
      : (x) => x0 + (x - xmin) / (xmax - xmin) * (x1 - x0);
    const Y = (y) => y1 - (y - ymin) / (ymax - ymin) * (y1 - y0);
    const p = [];
    const txt = (x, y, s, o = {}) => p.push(`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${o.size || 10}" font-weight="${o.weight || 400}" fill="${o.fill || DK.muted}" text-anchor="${o.anchor || 'start'}">${esc(tr(s))}</text>`);

    txt(0, 13, r.title, { size: 12, weight: 600, fill: DK.text });
    for (let y = ymin; y <= ymax + 1e-9; y += step) {
      p.push(`<line x1="${x0}" y1="${Y(y).toFixed(1)}" x2="${x1}" y2="${Y(y).toFixed(1)}" stroke="${DK.grid}"/>`);
      txt(x0 - 6, Y(y) + 3.5, fmt(y, 2), { anchor: 'end' });
    }
    for (const [xv, lbl] of r.xticks || []) {
      const xt = X(xv);
      p.push(`<line x1="${xt.toFixed(1)}" y1="${y0}" x2="${xt.toFixed(1)}" y2="${y1}" stroke="${DK.grid}"/>`);
      // 靠近左右邊緣的刻度文字改為靠邊對齊，避免被裁切
      const anchor = xt > W - 24 ? 'end' : (xt < 24 ? 'start' : 'middle');
      txt(anchor === 'end' ? Math.min(xt, W) : xt, y1 + 15, lbl, { anchor });
    }
    for (const s of r.series.filter((q) => !q.main).concat(r.series.filter((q) => q.main))) {
      const d = s.xs.map((xv, i) => `${i ? 'L' : 'M'}${X(xv).toFixed(1)} ${Y(s.ys[i]).toFixed(1)}`).join('');
      p.push(`<path d="${d}" fill="none" stroke="${s.main ? acc : DK.other}" stroke-width="${s.main ? 2.6 : 1}" stroke-linejoin="round"/>`);
    }
    if (r.hline) {
      const [hy, hl] = r.hline;
      p.push(`<line x1="${x0}" y1="${Y(hy).toFixed(1)}" x2="${x1}" y2="${Y(hy).toFixed(1)}" stroke="${DK.red}" stroke-dasharray="4 3"/>`);
      txt(x1 - 2, Y(hy) - 5, hl, { anchor: 'end', fill: DK.redText, weight: 600 });
    }
    if (r.vline) {
      const [vx, vl] = r.vline;
      p.push(`<line x1="${X(vx).toFixed(1)}" y1="${y0}" x2="${X(vx).toFixed(1)}" y2="${y1}" stroke="${DK.amber}" stroke-dasharray="4 3"/>`);
      const right = X(vx) > (x0 + x1) * 0.62;
      txt(X(vx) + (right ? -4 : 4), y0 + 12, vl, { anchor: right ? 'end' : 'start', fill: DK.amber, weight: 600 });
    }
    if (r.point) {
      const [px, py, pl] = r.point;
      if (px >= xmin && px <= xmax) {
        p.push(`<circle cx="${X(px).toFixed(1)}" cy="${Y(py).toFixed(1)}" r="5" fill="${acc}" stroke="${getComputedStyle(document.documentElement).getPropertyValue('--p-bg').trim()}" stroke-width="2"/>`);
        const right = X(px) > (x0 + x1) / 2;
        txt(X(px) + (right ? -9 : 9), Y(py) - 8, pl, { anchor: right ? 'end' : 'start', fill: DK.text, weight: 700, size: 12 });
      }
    }
    // 圖例（標題下方一列，靠左）
    let lx = 0;
    for (const [name, kind] of r.legend || []) {
      p.push(`<line x1="${lx}" y1="27" x2="${lx + 16}" y2="27" stroke="${kind === 'main' ? acc : DK.other}" stroke-width="${kind === 'main' ? 3 : 1.5}"/>`);
      txt(lx + 21, 30.5, name, { size: 10 });
      lx += 21 + [...tr(name)].reduce((w, ch) => w + (ch.charCodeAt(0) > 255 ? 10 : 6), 0) + 16;
    }
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(tr(r.title))}" font-family="inherit">${p.join('')}</svg>`;
  }

  // ============================================================ 底部面板
  let sheetOpen = false;
  function openSheet(title, note, body) {
    $('sheetTitle').textContent = tr(title);
    $('sheetNote').textContent = tr(note || '');
    $('sheetNote').hidden = !note;
    $('sheetBody').replaceChildren(body);
    $('backdrop').hidden = false; $('sheet').hidden = false;
    requestAnimationFrame(() => { $('backdrop').classList.add('open'); $('sheet').classList.add('open'); });
    sheetOpen = true;
    $('sheetClose').focus({ preventScroll: true });
  }
  function closeSheet() {
    if (!sheetOpen) return;
    $('backdrop').classList.remove('open'); $('sheet').classList.remove('open');
    setTimeout(() => { $('backdrop').hidden = true; $('sheet').hidden = true; }, 250);
    sheetOpen = false;
  }

  function openTable() {
    let t, title, pick;
    if (S.tool === 'CELL') {
      t = R.Tables.cell(S.tech); title = S.tech === 'LTE' ? '4G LTE 頻段總表' : '5G NR 頻段總表';
      pick = (id) => cellSetBand(Number(id));
    } else if (S.tool === 'WIFI') {
      t = R.Tables.wifi(); title = 'Wi-Fi 通道總表';
      pick = (id) => {
        const [band, ch] = id.split('|');
        if (band !== S.wifi.band) { S.wifi.band = band; S.wifi.bw = R.WiFi.bands[band].defBw; }
        S.wifi.ch = Number(ch); renderTool();
      };
    } else if (S.tool === 'GNSS') {
      t = R.Tables.gnss(); title = 'GNSS 訊號總表';
      pick = (id) => { const [a, b] = id.split('|').map(Number); S.gnss.sys = a; S.gnss.sig = b; renderTool(); };
    } else if (S.tool === 'CABLE') {
      t = R.Tables.cable(); title = '線材總表';
      pick = (id) => { const k = R.Cable.cables.find((x) => x.name === id); S.cable.cable = id; S.cable.a1 = fmt(k.a1); S.cable.a6 = fmt(k.a6); renderTool(); };
    } else {
      t = R.Tables.fspl(); title = 'FSPL 速查表';
      pick = (id) => { S.fspl.freq = fmt(Number(id), 3); renderTool(); };
    }
    const table = h('table', { class: 'dtable' },
      h('thead', {}, h('tr', {}, t.cols.map((c) => h('th', { text: c })))),
      h('tbody', {}, t.rows.map(([id, cells]) => h('tr', { onclick: () => { closeSheet(); pick(id); } },
        cells.map((c) => h('td', { text: c }))))));
    openSheet(title, '點選任一列即可帶入計算。' + (t.note || ''), table);
  }

  async function openAbout() {
    let ready = false;
    try { ready = !!(window.caches && await caches.has(CACHE_NAME)); } catch (e) { /* 忽略 */ }
    const body = h('div', { class: 'about' },
      h('div', { class: 'status' }, h('span', { class: 'dot' + (ready ? ' ready' : '') }),
        ready ? '已下載到此裝置，沒有網路時也能使用' : '尚未完成下載，請在有網路時開啟一次'),
      h('p', {}, h('strong', { text: 'RF Band Calculator ' }), `版本 ${APP_VERSION}`),
      h('p', { text: '功能：4G LTE / 5G NR 頻道與 ARFCN 計算、Wi-Fi 通道綁定、GNSS 頻段查詢與共存評估、微型同軸線損耗、自由空間路徑損耗與鏈路預算。' }),
      h('p', { text: '輸入的數值只儲存在這支手機上，不會傳送到任何地方。' }),
      h('p', { text: '計算結果僅供工程參考；實際可用頻段、通道與發射功率依各國法規而定，線材內建值為典型值。' }),
      h('p', { text: '更新方式：在有網路時開啟本 App，新版本會自動下載，下次開啟即生效。' }));
    openSheet('關於', '', body);
  }

  // ============================================================ 分享 / 提示
  let toastTimer = null;
  function toast(text) {
    const t = $('toast');
    t.textContent = tr(text);
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  async function share() {
    if (!lastOut) return;
    const text = R.plainText(lastOut.title, lastOut.out).split('\n').map(tr).join('\n');
    if (navigator.share) {
      try { await navigator.share({ title: 'RF Band Calculator', text }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(text); toast('已複製計算結果'); }
    catch (e) { toast('無法分享，請長按結果文字複製'); }
  }

  function setupInstallTip() {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone = navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    let dismissed = false;
    try { dismissed = localStorage.getItem('rfcalc.tipDismissed') === '1'; } catch (e) { /* 忽略 */ }
    if (isIOS && !standalone && !dismissed) $('installTip').hidden = false;
    $('installTipClose').addEventListener('click', () => {
      $('installTip').hidden = true;
      try { localStorage.setItem('rfcalc.tipDismissed', '1'); } catch (e) { /* 忽略 */ }
    });
  }

  function setupServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready).then(async () => {
      let first = false;
      try { first = localStorage.getItem('rfcalc.cached') !== CACHE_NAME; } catch (e) { /* 忽略 */ }
      if (first && window.caches && await caches.has(CACHE_NAME)) {
        toast('已下載到此裝置，沒有網路時也能使用');
        try { localStorage.setItem('rfcalc.cached', CACHE_NAME); } catch (e) { /* 忽略 */ }
      }
    }).catch(() => { /* file:// 或不支援時略過 */ });
  }

  // ============================================================ 語言切換
  /** 套用靜態文字（HTML 內標記 data-i18n 的元素） */
  function applyLangStatic() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant';
    $('btnLang').textContent = lang === 'en' ? '中' : 'EN';
    $('btnLang').setAttribute('aria-label', lang === 'en' ? '切換為中文' : 'Switch to English');
    document.querySelectorAll('[data-i18n]').forEach((n) => {
      if (!n.dataset.zh) n.dataset.zh = n.textContent;
      n.textContent = tr(n.dataset.zh);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((n) => {
      if (!n.dataset.zhAria) n.dataset.zhAria = n.getAttribute('aria-label');
      n.setAttribute('aria-label', tr(n.dataset.zhAria));
    });
  }
  function setLang(v) {
    lang = v;
    try { localStorage.setItem('rfcalc.lang', v); } catch (e) { /* 忽略 */ }
    closeSheet();
    $('toast').classList.remove('show');
    $('toast').textContent = '';
    renderTool();
  }

  // ============================================================ 啟動
  document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => {
    if (S.tool === t.dataset.tool) return;
    S.tool = t.dataset.tool;
    message = null;
    renderTool();
    window.scrollTo({ top: 0 });
  }));
  $('btnTable').addEventListener('click', openTable);
  $('btnLang').addEventListener('click', () => setLang(lang === 'en' ? 'zh' : 'en'));
  // 摺疊 / 展開（toggle 事件不冒泡，使用 capture 監聽）
  $('results').addEventListener('toggle', (e) => {
    const d = e.target;
    if (d.dataset && d.dataset.fold) { S.fold[d.dataset.fold] = !d.open; saveState(); }
  }, true);
  $('readoutBox').addEventListener('toggle', () => {
    S.fold[`${S.tool}|__readout`] = !$('readoutBox').open;
    saveState();
    if ($('readoutBox').open && lastOut) renderReadout(lastOut.out.spec);
  });
  $('btnCollapseAll').addEventListener('click', () => setAllFolds(true));
  $('btnExpandAll').addEventListener('click', () => setAllFolds(false));
  darkMQ.addEventListener('change', () => renderTool());
  $('btnShare').addEventListener('click', share);
  $('btnAbout').addEventListener('click', openAbout);
  $('sheetClose').addEventListener('click', closeSheet);
  $('backdrop').addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => lastOut && renderReadout(lastOut.out.spec), 120);
  });

  if (!BUILDERS[S.tool]) S.tool = 'CELL';
  if (!['LTE', 'NR'].includes(S.tech)) S.tech = 'LTE';
  renderTool();
  setupInstallTip();
  setupServiceWorker();
})();
