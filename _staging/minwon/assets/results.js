// 결과확인 · 전체 조회 공용 (사무실 결과확인 탭, 관리자 전체 조회 탭)
//   민원 × 팀 한 줄씩 (R-58): 접수번호·종류·주소·담당·수거자(차량)·수거일시·수거 여부·사진(전/후)·메모
//   표 / 지도 보기, 사진 누르면 크게, 엑셀 내려받기
(function () {
  const TYPE_COL = { '생활': '#16a34a', '재활용': '#2563eb', '음식물': '#facc15', '공용용기': '#a16207', '특수마대': '#db2777', '대형': '#7c3aed', '기타': '#64748b' };
  const pill = (x, label) => '<b class="rs-ty" style="background:' + (TYPE_COL[x] || '#64748b') + (x === '음식물' ? ';color:#3b2a00' : '') + '">' + MW.esc(label || x) + '</b>';
  const pad = n => String(n).padStart(2, '0');
  const md = t => { const d = new Date(t); return (d.getMonth() + 1) + '/' + d.getDate(); };
  const mdhm = t => t ? md(t) + ' ' + pad(new Date(t).getHours()) + ':' + pad(new Date(t).getMinutes()) : '';
  const addD = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  const CSS = `
  .rs-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px}
  .rs-bar .f{display:flex;flex-direction:column;gap:5px}
  .rs-bar .f label{font-size:12px;font-weight:800;color:var(--ink-2)}
  .rs-bar .in{min-height:40px;padding:8px 11px;font-size:14px;width:auto}
  .rs-bar .chips .chip{min-height:38px;padding:7px 13px;font-size:13px}
  .rs-sum{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
  .rs-sum span{background:#f3f6fa;border-radius:999px;padding:5px 12px;font-size:13px;font-weight:800}
  .rs-sum b{font-size:15px}
  .rs-ty{display:inline-block;color:#fff;border-radius:999px;font-size:12px;font-weight:900;padding:2px 8px;margin:1px 2px 1px 0;white-space:nowrap}
  .rs-tbl td{font-size:13px}
  .rs-tbl .btn{white-space:nowrap}
  .rs-tbl tr.rw{cursor:pointer;user-select:none} .rs-tbl tr.rw:hover td{background:#eef6f7}
  .rs-ed{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:850;display:none;align-items:center;justify-content:center;padding:16px}
  .rs-ed.on{display:flex}
  .rs-ed .bx{background:#fff;border-radius:18px;padding:22px;width:min(620px,100%);max-height:92vh;overflow:auto}
  .rs-ed h3{font-size:19px;font-weight:900;margin-bottom:4px}
  .rs-ed .er{display:grid;grid-template-columns:96px 1fr;gap:12px;align-items:center;padding:9px 0;border-bottom:1px solid #f0f3f7}
  .rs-ed .er:last-of-type{border-bottom:none}
  .rs-ed .er label{font-size:13px;font-weight:800;color:var(--ink-2)}
  .rs-ed .er .in{min-height:42px}
  .rs-ed .er textarea.in{min-height:76px;resize:vertical;line-height:1.5}
  .rs-ed .ev{min-height:42px;display:flex;align-items:center;flex-wrap:wrap;gap:4px}
  .rs-ed .tk{border:1px solid var(--line);border-radius:12px;padding:10px 12px}
  .rs-ed .tk.cur{border-color:var(--acc);background:#f3fafa}
  .rs-ed .tk .h{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-weight:800}
  .rs-ed .asx{display:none;margin-top:10px;gap:8px;flex-wrap:wrap;align-items:flex-end}
  .rs-ed .asx.on{display:flex}
  .rs-ed .asx .in{width:auto;min-height:40px;padding:8px 10px}
  .rs-tbl td.ad{font-weight:800;font-size:14px;white-space:nowrap}
  .rs-st{display:inline-block;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:900;white-space:nowrap}
  .rs-st.done{background:var(--ok-bg);color:var(--ok)} .rs-st.open{background:var(--bad-bg);color:var(--bad)}
  .rs-ph{display:flex;gap:4px}
  .rs-ph .t{position:relative;width:52px;height:52px;border-radius:8px;overflow:hidden;background:#eef2f6;cursor:pointer;flex:0 0 auto}
  .rs-ph .t img{width:100%;height:100%;object-fit:cover;display:block}
  .rs-ph .t i{position:absolute;left:2px;top:2px;font-style:normal;font-size:10px;font-weight:900;color:#fff;background:rgba(0,0,0,.55);border-radius:5px;padding:0 4px}
  .rs-cp{border:none;background:none;cursor:pointer;font-size:13px;opacity:.6;padding:0 2px}
  .rs-cp:hover{opacity:1}
  .rs-map{height:620px;border-radius:12px;background:#dde3ea}
  .rs-pin{position:relative;padding:5px 10px;border-radius:10px;color:#fff;font-weight:900;font-size:13px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);cursor:pointer;white-space:nowrap}
  .rs-pin .ty{position:absolute;top:-13px;right:-16px;display:flex;gap:2px}
  .rs-pin .ty b{color:#fff;border:1.5px solid #fff;border-radius:999px;font-size:11px;font-weight:900;padding:1px 7px;line-height:1.3}
  .rs-pop .item{padding:6px 0;border-top:1px solid #eef2f6}
  .rs-pop .item:first-of-type{border-top:none}
  .rs-pop{background:#fff;border-radius:12px;padding:10px 12px;box-shadow:0 6px 20px rgba(0,0,0,.25);font-size:13px;min-width:220px;max-width:280px;line-height:1.5}
  .rs-big{position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:900;display:none;align-items:center;justify-content:center;flex-direction:column}
  .rs-big.on{display:flex}
  .rs-big img{max-width:94vw;max-height:80vh;border-radius:6px}
  .rs-big .cap{color:#fff;font-weight:800;margin-top:10px;font-size:14px;text-align:center}
  .rs-big .nav{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.18);color:#fff;border:none;border-radius:50%;width:52px;height:52px;font-size:24px;cursor:pointer}
  .rs-big .pv{left:16px}.rs-big .nx{right:16px}
  .rs-big .tools{position:absolute;top:14px;right:14px;display:flex;gap:8px}
  /* [11_5] 상습 민원 */
  .rs-pin .ty b.cnt{background:#c2410c;min-width:22px;text-align:center;border-width:2px}
  .rs-pin.hot{font-size:15px;padding:7px 13px}
  .rs-hot{display:inline-block;background:#fdecdf;color:#c2410c;font-weight:900;border-radius:999px;padding:2px 10px;font-size:13px}
  .rs-grp{margin-bottom:14px}
  .rs-grp .g{border:1px solid var(--line);border-radius:12px;background:#fff;overflow:hidden;margin-bottom:10px}
  .rs-grp .gh{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:11px 14px;background:#e6f4ef}
  .rs-grp .gh .c{margin-left:auto;font-size:13px;font-weight:800;color:#c2410c}
  .rs-it{display:grid;grid-template-columns:64px minmax(0,1fr) auto auto;gap:10px;align-items:center;padding:9px 14px;border-top:1px solid #f0f3f7;font-size:13px}
  .rs-it .d{color:var(--ink-2);font-variant-numeric:tabular-nums}
  .rs-it small{display:block;color:var(--ink-2);font-size:12px}
  .rs-hist{border:1px solid var(--line);border-radius:12px;overflow:hidden;margin:8px 0 12px}
  .rs-hist .rs-it{cursor:pointer} .rs-hist .rs-it:first-child{border-top:none}
  .rs-hist .rs-it.on{background:#e6f4ef}
  .rs-st.fl{background:#ede9fe;color:#6d28d9}
  @media (max-width:560px){ .rs-it{grid-template-columns:56px minmax(0,1fr) auto} .rs-it .act{grid-column:2/-1;justify-self:start} }
  `;

  function mount(root, opt) {
    opt = opt || {};
    const { esc, cref, ymd } = MW;
    const admin = !!opt.admin;
    if (!document.getElementById('rs-css')) { const st = document.createElement('style'); st.id = 'rs-css'; st.textContent = CSS; document.head.appendChild(st); }
    const today = ymd(new Date());
    root.innerHTML =
      '<div class="rs-bar">'
      + '<div class="f"><label>기간</label><div class="chips" data-r="per">'
      + ['오늘', '어제', '7일', '30일', '1년'].map((x, i) => '<button class="chip' + (i === (admin ? 2 : 0) ? ' on' : '') + '" data-p="' + x + '">' + x + '</button>').join('') + '</div></div>'
      + '<div class="f"><label>시작</label><input class="in" type="date" data-r="from"></div>'
      + '<div class="f"><label>끝</label><input class="in" type="date" data-r="to"></div>'
      + '<div class="f"><label>담당 팀</label><select class="in" data-r="team"><option value="">전체</option></select></div>'
      + '<div class="f"><label>종류</label><select class="in" data-r="type"><option value="">전체</option></select></div>'
      + '<div class="f"><label>처리 여부</label><select class="in" data-r="st"><option value="">전체</option><option value="open">미처리</option><option value="done">처리</option></select></div>'
      + '<div class="f"><label>유형</label><select class="in" data-r="kind"><option value="">전체</option><option>개인</option><option>기관</option></select></div>'
      + '<div class="f" style="flex:1;min-width:160px"><label>찾기 (주소·접수번호·전화)</label><input class="in" data-r="q" placeholder="예: 본 199-3 · 삼 64-8 · 트리 320-1203 · 1023-4 (접수번호)" style="width:100%"></div>'
      + '<div class="f"><label>&nbsp;</label><div class="chips" data-r="view"><button class="chip on" data-v="tbl">📋 표</button><button class="chip" data-v="map">🗺 지도</button></div></div>'
      + '<div class="f"><label>&nbsp;</label><button class="btn" data-r="hot">🔥 상습지역만</button></div>'
      + '<div class="f"><label>&nbsp;</label><button class="btn primary" data-r="xls">📥 엑셀 내려받기</button></div>'
      + '</div>'
      + '<div class="rs-grp" data-r="grp" style="display:none"></div>'
      + '<div class="rs-sum" data-r="sum"></div><div class="muted" style="margin:-4px 0 8px">줄을 <b>더블클릭</b>하면 수정창이 열립니다' + (opt.canAssign ? ' (미처리 건은 수정창에서 🔁 담당 변경)' : '') + '</div>'
      + '<div data-r="tblv"><div class="tbl-wrap"><table class="tbl rs-tbl"><thead><tr>'
      + '<th>접수번호</th><th>접수</th><th>종류</th><th>주소</th><th>유형</th><th>전화</th><th>담당</th><th>수거자(차량)</th><th>처리일시</th><th>처리 여부</th><th>사진 (전·후)</th><th>메모</th><th>접수자</th>'
      + (admin ? '<th>주무관</th>' : '') + '</tr></thead><tbody data-r="body"><tr><td colspan="15" class="muted">불러오는 중…</td></tr></tbody></table></div></div>'
      + '<div data-r="mapv" style="display:none"><div class="rs-map" data-r="map"></div><p class="muted" style="margin-top:6px">핀 색: 미처리 빨강 · 처리 초록 — 핀을 누르면 내용·사진</p></div>';
    const $r = k => root.querySelector('[data-r="' + k + '"]');
    let S = MW_SEED, M = {}, T = {}, rows = [], view = 'tbl';
    const team = k => (S.teams && S.teams[k]) || { name: k || '-', color: '#94a3b8' };

    // ── [11_5] 상습 민원: 같은 주소 최근 1년 민원 묶음 (시안 v1105) ──
    //   같은 주소 = 주소 글자에서 '서울(특별시)·송파구·띄어쓰기'를 뺀 것이 같으면 (동·호까지 같아야 같은 곳)
    const addrKey = s => String(s || '').replace(/서울(특별시)?|송파구|\s+/g, '');
    let YM = {}, YT = {}, ytAt = 0;
    const yearFrom = () => Date.now() - 365 * 864e5;
    // ── [11_10] 부장님 앱(예전 민원·견적 접수, minwon-c29c2 minwon/recs) 기록도 같이 보기 — 읽기만, 고치지 않음 ──
    const BOSS_URL = 'https://minwon-c29c2-default-rtdb.asia-southeast1.firebasedatabase.app/minwon/recs.json';
    const BOSS_TN = { m: '민원', t: '특수마대', c: '공용용기', y: '용기', g: '견적' };
    let BOSS = null;
    const bossTime = (dt, at) => {   // '2026-09-01' + '오전 09:51'
      const d = new Date(String(dt) + 'T00:00'); if (isNaN(d)) return 0;
      const mm = String(at || '').match(/(오전|오후)?\s*(\d{1,2}):(\d{2})/);
      if (mm) { let hh = +mm[2] % 12; if (mm[1] === '오후') hh += 12; if (!mm[1] && +mm[2] === 12) hh = 12; d.setHours(hh, +mm[3]); }
      return d.getTime();
    };
    const bossDone = (s, dt) => {   // '9. 1. 오후 04:02' (연도는 접수일 연도)
      const mm = String(s || '').match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(오전|오후)?\s*(\d{1,2}):(\d{2})/); if (!mm) return 0;
      let hh = +mm[4] % 12; if (mm[3] === '오후') hh += 12;
      return new Date(+String(dt).slice(0, 4), +mm[1] - 1, +mm[2], hh, +mm[5]).getTime();
    };
    function bossRow(x) {
      const lat = parseFloat(x.lat), lng = parseFloat(x.lng);
      const m = { no: '부장님앱', recvAt: bossTime(x.dt, x.at), types: [BOSS_TN[x.tp] || '기타'],
        addr: { text: x.jibun || x.road || x.raw || '', lat: isFinite(lat) ? lat : null, lng: isFinite(lng) ? lng : null },
        tel: x.tel || '', content: x.content || '', place: x.co || '', staff: x.staff || '', kind: '개인', boss: x };
      const t = { state: x.status === '미완료' ? 'open' : 'done', doneAt: bossDone(x.doneAt, x.dt), team: '부장님앱',
        memo: [x.result, x.note].filter(Boolean).join(' / '), bossSt: x.status || '' };
      return { mid: 'boss_' + x.id, tid: null, m, t, boss: true };
    }
    function bossLoad() {
      if (BOSS) return Promise.resolve(BOSS);
      return fetch(BOSS_URL).then(r => r.ok ? r.json() : null).then(d => {
        const arr = !d ? [] : Array.isArray(d) ? d : Object.values(d);
        BOSS = arr.filter(x => x && !x.del && x.dt).map(bossRow); return BOSS;
      }).catch(() => (BOSS = []));
    }
    bossLoad().then(() => { if (typeof build === 'function') build(); });
    cref('minwon').orderByChild('recvAt').startAt(yearFrom()).on('value', s => { YM = s.val() || {}; if (view === 'map' || grpOn()) draw(); });
    async function loadYT(force) {
      if (!force && Date.now() - ytAt < 60000) return YT;
      const s = await cref('tasks').orderByChild('workDate').startAt(ymd(new Date(yearFrom()))).once('value');
      YT = s.val() || {}; ytAt = Date.now(); return YT;
    }
    function yearOf(key) {   // 그 주소의 최근 1년 민원 [{mid, m}] 최근 순 ([11_10] 부장님 앱 기록 포함)
      return Object.entries(YM).filter(([, m]) => m && addrKey(m.addr && m.addr.text) === key && (m.recvAt || 0) >= yearFrom())
        .map(([mid, m]) => ({ mid, m })).concat((BOSS || []).filter(r => addrKey(r.m.addr.text) === key && r.m.recvAt >= yearFrom()).map(r => ({ mid: r.mid, m: r.m, r })))
        .sort((a, b) => (b.m.recvAt || 0) - (a.m.recvAt || 0));
    }
    const yearCount = key => key ? yearOf(key).length : 0;
    // 민원 한 건의 처리 결과 (팀이 여럿이면 모아서): 처리완료 / 미처리(없음) / 미처리
    function resultOf(m, TT) {
      const ts = Object.keys(m.tasks || {}).map(k => TT[k] || T[k] || EXT[k]).filter(Boolean);
      if (!ts.length) return { txt: '-', cls: 'open', teams: '' };
      const teams = ts.map(t => team(t.team).name).join('·');
      if (ts.every(t => t.state === 'done')) return { txt: '처리완료', cls: 'done', teams };
      if (ts.every(t => t.state === 'done' || t.state === 'fail')) return { txt: '미처리(없음)', cls: 'done', teams };
      return { txt: '미처리', cls: 'open', teams };
    }
    let hotOnly = false;
    const grpOn = () => hotOnly || !!($r('q') && $r('q').value.trim());

    cref('settings').once('value').then(s => {
      if (s.val()) S = MW_withSeed(s.val());
      $r('team').innerHTML = '<option value="">전체</option>' + Object.entries(S.teams).sort((a, b) => (a[1].order || 0) - (b[1].order || 0)).map(([k, t]) => '<option value="' + k + '">' + esc(t.name) + '</option>').join('');
      $r('type').innerHTML = '<option value="">전체</option>' + (S.types || []).map(t => '<option>' + esc(t) + '</option>').join('');
    });

    // 기간
    function setPer(p) {
      const n = new Date();
      const f = p === '오늘' ? n : p === '어제' ? addD(n, -1) : p === '7일' ? addD(n, -6) : p === '1년' ? addD(n, -364) : addD(n, -29);
      const t = p === '어제' ? addD(n, -1) : n;
      $r('from').value = ymd(f); $r('to').value = ymd(t);
      $r('per').querySelectorAll('.chip').forEach(b => b.classList.toggle('on', b.dataset.p === p));
      load();
    }
    $r('per').querySelectorAll('.chip').forEach(b => b.onclick = () => setPer(b.dataset.p));
    // [11_5] 🔥 상습지역만 (최근 1년 같은 주소 2건 이상) / 주소 찾기 → 같은 주소 민원 묶음
    $r('hot').onclick = () => { hotOnly = !hotOnly; $r('hot').classList.toggle('primary', hotOnly); draw(); };
    let grpSeq = 0;
    async function drawGroups() {
      const box = $r('grp'), q = addrKey($r('q').value.trim());
      if (!grpOn()) { box.style.display = 'none'; box.innerHTML = ''; return; }
      const g = {};
      Object.entries(YM).forEach(([mid, m]) => {
        if (!m || (m.recvAt || 0) < yearFrom()) return;
        const k = addrKey(m.addr && m.addr.text); if (!k) return;
        if (q && k.indexOf(q) < 0 && k.replace(/-/g, '').indexOf(q.replace(/-/g, '')) < 0) return;
        (g[k] = g[k] || { a: (m.addr && m.addr.text) || '', items: [] }).items.push({ mid, m });
      });
      (BOSS || []).forEach(r => {   // [11_10]
        if (r.m.recvAt < yearFrom()) return;
        const k = addrKey(r.m.addr.text); if (!k) return;
        if (q && k.indexOf(q) < 0 && k.replace(/-/g, '').indexOf(q.replace(/-/g, '')) < 0) return;
        (g[k] = g[k] || { a: r.m.addr.text, items: [] }).items.push({ mid: r.mid, m: r.m, r });
      });
      let gs = Object.values(g).filter(x => !hotOnly || x.items.length >= 2).sort((x, y) => y.items.length - x.items.length || x.a.localeCompare(y.a, 'ko', { numeric: true }));
      box.style.display = '';
      if (!gs.length) { box.innerHTML = '<div class="muted" style="padding:14px">' + (hotOnly ? '최근 1년 같은 주소에 2건 이상 들어온 곳이 없습니다' : '찾는 주소의 최근 1년 민원이 없습니다') + '</div>'; return; }
      gs = gs.slice(0, 60);
      const my = ++grpSeq; const TT = await loadYT(); if (my !== grpSeq) return;
      box.innerHTML = '<div class="muted" style="margin-bottom:6px">최근 1년 · 같은 주소 묶음' + (hotOnly ? ' (2건 이상만)' : '') + '</div>' + gs.map(x => {
        x.items.sort((a, b) => (b.m.recvAt || 0) - (a.m.recvAt || 0));
        return '<div class="g"><div class="gh"><b>📍 ' + esc(x.a) + '</b>' + (x.items.length >= 2 ? '<span class="rs-hot">🔥 상습 ' + x.items.length + '건</span>' : '') + '<span class="c">' + x.items.length + '건</span></div>'
          + x.items.map(({ mid, m, r }) => { const rs = r ? { txt: (r.t.state === 'open' ? '미처리 · ' : '') + r.t.bossSt, cls: r.t.state, teams: '부장님앱' } : resultOf(m, TT);
            return '<div class="rs-it"><span class="d">' + esc(md(m.recvAt)) + '</span><span>' + (m.types || []).map(t => esc(t)).join('·') + ' · ' + esc(m.content || '') + '<small>' + esc(rs.teams) + '</small></span>'
              + '<span class="rs-st ' + rs.cls + '">' + rs.txt + '</span><button class="btn sm act" data-mid="' + esc(mid) + '">✏️ 확인·수정</button></div>'; }).join('') + '</div>';
      }).join('');
      box.querySelectorAll('[data-mid]').forEach(b => b.onclick = () => { const br = /^boss_/.test(b.dataset.mid) && (BOSS || []).find(r => r.mid === b.dataset.mid); br ? openBoss(br) : openById(b.dataset.mid); });
    }
    ['from', 'to'].forEach(k => $r(k).onchange = () => { $r('per').querySelectorAll('.chip').forEach(b => b.classList.remove('on')); load(); });
    ['team', 'type', 'st', 'kind'].forEach(k => $r(k).onchange = draw);
    $r('q').oninput = draw;
    $r('view').querySelectorAll('.chip').forEach(b => b.onclick = () => {
      view = b.dataset.v;
      $r('view').querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b));
      $r('tblv').style.display = view === 'tbl' ? '' : 'none'; $r('mapv').style.display = view === 'map' ? '' : 'none';
      draw();
    });
    // 엑셀 내려받기: 먼저 종류를 고른다 (전체 · 생활 · 재활용 · 음식물 · 공용용기 · 특수마대 · 기타 …)
    $r('xls').onclick = () => {
      let pk = document.getElementById('rs-xpick');
      if (!pk) { pk = document.createElement('div'); pk.id = 'rs-xpick'; pk.className = 'rs-ed'; document.body.appendChild(pk); }
      const kinds = ['전체'].concat((S.types || []).filter(x => x !== '대형')).concat((S.types || []).indexOf('대형') >= 0 ? ['대형'] : []);
      pk.innerHTML = '<div class="bx" style="width:min(460px,100%)"><h3>📥 엑셀 내려받기</h3>'
        + '<div class="muted" style="margin-bottom:12px">' + esc($r('from').value) + ' ~ ' + esc($r('to').value) + ' · 어떤 종류를 내려받을까요?</div>'
        + '<div class="chips">' + kinds.map(k => '<button class="chip" data-k="' + esc(k) + '">' + (k === '전체' ? '전체' : pill(k)) + '</button>').join('') + '</div>'
        + '<div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn" data-x="1">닫기</button></div></div>';
      pk.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { pk.classList.remove('on'); excel(b.dataset.k); });
      pk.querySelector('[data-x]').onclick = () => pk.classList.remove('on');
      pk.onclick = e => { if (e.target === pk) pk.classList.remove('on'); };
      pk.classList.add('on');
    };

    // 불러오기: 접수일시 기간의 민원 + 그 작업들 (실시간)
    let offs = [];
    function load() {
      offs.forEach(f => f()); offs = [];
      const from = new Date($r('from').value + 'T00:00').getTime(), to = new Date($r('to').value + 'T00:00').getTime() + 864e5;
      const qm = cref('minwon').orderByChild('recvAt').startAt(from).endAt(to - 1);
      const qt = cref('tasks').orderByChild('workDate').startAt($r('from').value).endAt(ymd(addD(new Date(to), 14)));
      const hm = s => { M = s.val() || {}; build(); }, ht = s => { T = s.val() || {}; build(); };
      qm.on('value', hm); qt.on('value', ht);
      offs.push(() => qm.off('value', hm), () => qt.off('value', ht));
    }
    // 처리 여부는 두 가지뿐: 처리 / 미처리 (예전 '처리불가' 기록은 처리로 본다)
    const stateOf = t => t && (t.state === 'done' || t.state === 'fail') ? 'done' : 'open';
    function build() {
      rows = [];
      Object.entries(M).forEach(([mid, m]) => {
        Object.keys(m.tasks || {}).forEach(tid => rows.push({ mid, tid, m, t: T[tid] || null }));
      });
      if (BOSS && $r('from').value) {   // [11_10]
        const f0 = new Date($r('from').value + 'T00:00').getTime(), t0 = new Date($r('to').value + 'T00:00').getTime() + 864e5;
        BOSS.forEach(r => { if (r.m.recvAt >= f0 && r.m.recvAt < t0) rows.push(r); });
      }
      rows.sort((a, b) => (b.m.recvAt || 0) - (a.m.recvAt || 0));
      draw();
    }
    function filtered() {
      const tm = $r('team').value, ty = $r('type').value, st = $r('st').value, kd = $r('kind').value, q = $r('q').value.trim();
      return rows.filter(r => {
        const t = r.t || {}, m = r.m;
        if (tm && t.team !== tm) return false;
        if (ty && (t.types || m.types || []).indexOf(ty) < 0) return false;
        if (st && stateOf(r.t) !== st) return false;
        if (kd && m.kind !== kd) return false;
        if (q) {
          // 띄어쓰기는 무시 ('삼64-8' = '삼 64-8'). 본·삼을 붙여 쓰면 같은 번지라도 동이 갈림
          const sq = q.replace(/\s+/g, ''), hay = [m.no, m.addr && m.addr.text, m.tel, m.content, m.place].join('|').replace(/\s+/g, '');
          if (hay.indexOf(sq) < 0 && hay.replace(/-/g, '').indexOf(sq.replace(/-/g, '')) < 0) return false;
        }
        return true;
      });
    }
    const ST_TXT = { done: '✅ 처리', open: '미처리' };
    // [11_3] 현장 결과는 [처리완료] / [미처리(없음)] 두 가지 — 미처리(없음)도 끝난 건(처리 쪽)으로 센다
    const stTxt = t => t && t.bossSt ? (t.state === 'open' ? '미처리 · ' : '✅ ') + t.bossSt
      : t && t.state === 'fail' ? '⛔ 미처리(없음)'
      : t && (t.state === 'seen' || t.state === 'working') ? '미처리 · 👀 확인됨' : ST_TXT[stateOf(t)];
    function draw() {
      const list = filtered();
      const c = { open: 0, done: 0 };
      list.forEach(r => { c[stateOf(r.t)]++; });
      $r('sum').innerHTML = '<span>전체 <b>' + list.length + '</b></span><span style="color:var(--ok)">처리 <b>' + c.done + '</b></span>'
        + '<span style="color:var(--bad)">미처리 <b>' + c.open + '</b></span>';
      drawGroups();
      if (view === 'map') return drawMap(list);
      $r('body').innerHTML = list.map((r, i) => {
        const t = r.t || {}, m = r.m, s = stateOf(r.t), tm = team(t.team);
        const ph = Object.entries(t.photos || {}).sort((a, b) => (a[1].k === b[1].k ? (a[1].at || 0) - (b[1].at || 0) : a[1].k === 'before' ? -1 : 1));
        const by = t.doneBy ? esc(t.doneBy) + (t.proxy ? ' <span class="badge b-warn">대신</span>' : '') : (t.claimBy ? '<span class="muted">' + esc(t.claimBy) + '</span>' : '-');
        return '<tr data-i="' + i + '" class="rw"' + (r.boss ? ' style="background:#faf7ff" title="부장님 앱 기록 · 더블클릭: 보기"' : ' title="더블클릭: 수정"') + '>'
          + '<td style="white-space:nowrap"><b>' + esc(m.no) + '</b><button class="rs-cp" data-cp="' + esc(m.no) + '" title="복사">📋</button></td>'
          + '<td style="white-space:nowrap">' + esc(mdhm(m.recvAt)) + '</td>'
          + '<td>' + (t.types || m.types || []).map(x => pill(x, x === '공용용기' && m.contReason ? x + '(' + m.contReason + ')' : x)).join('') + '</td>'
          + '<td class="ad">' + esc(m.addr && m.addr.text) + (m.place ? '<div class="muted" style="font-weight:600;white-space:normal">' + esc(m.place) + '</div>' : '') + '</td>'
          + '<td style="white-space:nowrap">' + esc(m.kind === '기관' ? '기관(' + m.agency + ')' : '개인') + '</td>'
          + '<td style="white-space:nowrap">' + (m.tel ? esc(m.telHidden ? '미공개·구청 ' + m.tel : m.tel) + '<button class="rs-cp" data-cp="' + esc(m.tel) + '" title="복사">📋</button>' : (m.telHidden ? '민원인 미공개' : '-')) + '</td>'
          + '<td style="white-space:nowrap"><span style="color:' + esc(tm.color) + '">●</span> ' + esc(tm.name) + '<div class="muted">' + esc(t.workDate ? md(t.workDate + 'T00:00') + (t.shift === 'night' ? ' 밤' : '') : '') + '</div></td>'
          + '<td style="white-space:nowrap">' + by + '</td>'
          + '<td style="white-space:nowrap">' + esc(mdhm(t.doneAt)) + '</td>'
          + '<td><span class="rs-st ' + s + '">' + stTxt(r.t) + '</span></td>'
          + '<td><div class="rs-ph">' + ph.map(([pid, v], j) => '<div class="t" data-ph="' + i + ':' + j + '" data-pid="' + esc(pid) + '" data-m="' + esc(v.m) + '"><img alt=""><i>' + (v.k === 'before' ? '전' : '후') + '</i></div>').join('') + (ph.length ? '' : '<span class="muted">-</span>') + '</div></td>'
          + '<td style="max-width:220px">' + esc(t.memo || '') + '</td>'
          + '<td style="white-space:nowrap">' + esc(m.staff || '') + '</td>'
          + (admin ? '<td style="white-space:nowrap">' + esc(m.officer || '') + '</td>' : '')
          + '</tr>';
      }).join('') || '<tr><td colspan="15" class="muted" style="text-align:center;padding:24px">해당하는 민원이 없습니다</td></tr>';
      root.querySelectorAll('.rs-cp').forEach(b => b.onclick = () => { navigator.clipboard && navigator.clipboard.writeText(b.dataset.cp); MW.toast('📋 복사했습니다: ' + b.dataset.cp); });
      root.querySelectorAll('.rs-ph .t').forEach(el => { thumb(el); el.onclick = () => { const [i, j] = el.dataset.ph.split(':').map(Number); openBig(list[i], j); }; });
      // 더블클릭 → 수정창 (사진·복사 버튼은 제외)
      root.querySelectorAll('tr.rw').forEach(tr => tr.ondblclick = e => { if (e.target.closest('.rs-ph,.rs-cp')) return; openEdit(list[+tr.dataset.i]); });
    }

    // ── 수정창: 기본정보(전화·주소·위치 설명·내용·기관·주무관) + 미처리 건 담당 변경 ──
    let ed = document.getElementById('rs-ed');
    if (!ed) { ed = document.createElement('div'); ed.id = 'rs-ed'; ed.className = 'rs-ed'; document.body.appendChild(ed); }
    ed.onclick = e => { if (e.target === ed) ed.classList.remove('on'); };
    // 다른 화면(접수 탭 '최근 접수')에서 접수번호로 바로 여는 경우: 그 민원과 작업을 새로 읽어 온다
    const EXT = {};
    async function openById(mid) {
      const m = (await cref('minwon/' + mid).once('value')).val(); if (!m) { MW.toast('민원을 찾지 못했습니다'); return; }
      const tids = Object.keys(m.tasks || {});
      const ts = await Promise.all(tids.map(tid => cref('tasks/' + tid).once('value')));
      tids.forEach((tid, i) => { EXT[tid] = ts[i].val(); });
      openEdit({ mid, m, ext: true });
    }
    function openBoss(r) {   // [11_10] 부장님 앱 기록 보기 (읽기만)
      const x = r.m.boss || {}, ph = [].concat(x.before || []).map(s => ['전', s]).concat([].concat(x.after || []).map(s => ['후', s]));
      const row = (k, v) => v ? '<div class="er"><b>' + k + '</b><div>' + esc(v) + '</div></div>' : '';
      ed.innerHTML = '<div class="bx"><h3>📒 부장님 앱 기록</h3><div class="muted" style="margin-bottom:8px">예전 앱에서 접수한 건입니다. 여기서는 보기만 하고 고치지 않습니다.</div>'
        + row('접수', mdhm(r.m.recvAt)) + row('종류', (r.m.types || []).join('·')) + row('주소', r.m.addr.text) + row('입력 원문', x.raw)
        + row('도로명', x.road) + row('연락처', x.tel) + row('위치·비고', x.co) + row('내용', x.content) + row('상태', x.status)
        + row('처리', x.doneAt) + row('결과·메모', [x.result, x.note].filter(Boolean).join(' / ')) + row('담당', x.staff)
        + (ph.length ? '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">' + ph.map(([k, s]) => /^data:image\//.test(String(s)) ? '<figure style="margin:0;text-align:center"><img src="' + esc(s) + '" style="width:140px;height:140px;object-fit:cover;border-radius:10px"><figcaption class="muted">' + k + '</figcaption></figure>' : '').join('') + '</div>' : '')
        + '<div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn" data-x="1">닫기</button></div></div>';
      ed.querySelector('[data-x]').onclick = () => ed.classList.remove('on');
      ed.classList.add('on');
    }
    function openEdit(r) {
      if (r && r.boss) return openBoss(r);
      const m = r.m, mid = r.mid, a = m.addr || {};
      const tids = Object.keys(m.tasks || {});
      const TK = k => (r.ext && EXT[k]) || T[k];
      const TS = firebase.database.ServerValue.TIMESTAMP;
      // 순서: 주소 → 민원인번호 → 민원종류 → 기관(세부)·주무관 / 개인 → 위치 설명 → 민원내용 → 담당·처리 → 닫기·수정 저장
      const row = (label, html) => '<div class="er"><label>' + label + '</label><div>' + html + '</div></div>';
      ed.innerHTML = '<div class="bx">'
        + '<h3>' + esc(m.no) + '</h3><div class="muted" style="margin-bottom:6px">접수 ' + esc(mdhm(m.recvAt)) + ' · ' + esc(m.staff || '') + '</div>'
        + '<div data-e="hist"></div>'
        + row('주소', '<input class="in" data-e="addr" lang="ko" value="' + esc(a.text || '') + '" placeholder="본 199 · 삼 64-8 · 트리 320-1203">')
        + row(m.telHidden ? '구청번호' : '민원인번호', '<input class="in" data-e="tel" value="' + esc(m.tel || '') + '">' + (m.telHidden ? '<div class="muted">민원인 미공개</div>' : ''))
        + row('민원종류', '<div class="ev">' + (m.types || []).map(x => pill(x, x === '공용용기' && m.contReason ? x + '(' + m.contReason + ')' : x)).join('') + '</div>')
        + (m.kind === '기관'
          ? row('기관', '<select class="in" data-e="agency">' + (S.agencies || []).map(g => '<option' + (g === m.agency ? ' selected' : '') + '>' + esc(g) + '</option>').join('') + '</select>')
            + row('주무관', '<input class="in" data-e="officer" lang="ko" value="' + esc(m.officer || '') + '">')
          : row('민원유형', '<div class="ev"><b>개인</b></div>'))
        + row('위치 설명', '<input class="in" data-e="place" lang="ko" value="' + esc(m.place || '') + '" placeholder="예: 정문 옆 전봇대 아래">')
        + row('민원내용', '<textarea class="in" data-e="content" lang="ko">' + esc(m.content || '') + '</textarea>')
        + row('메모', '<input class="in" data-e="note" lang="ko" value="' + esc(m.note || '') + '" placeholder="예: 3번째 반복, 구청 계도 요청">')
        + row('담당·처리', tids.map(tid => {
          const t = TK(tid) || {}, s = stateOf(TK(tid)), tm = team(t.team);
          return '<div class="tk" data-tid="' + esc(tid) + '"><div class="h"><span style="color:' + esc(tm.color) + '">●</span>' + esc(tm.name)
            + ' <span class="muted">' + esc(t.workDate ? md(t.workDate + 'T00:00') + (t.shift === 'night' ? ' 밤' : '') : '') + '</span>'
            + '<span class="rs-st ' + s + '">' + stTxt(t) + '</span>'
            + (t.doneBy ? '<span class="muted">' + esc(t.doneBy) + ' ' + esc(mdhm(t.doneAt)) + '</span>' : '')
            + (opt.canAssign && s === 'open' ? '<button class="btn sm primary" data-as="' + esc(tid) + '" style="margin-left:auto">🔁 담당 변경</button>' : '') + '</div>'
            + (opt.canAssign && s === 'open' ? '<div class="asx"><div><div class="lbl" style="margin-top:0">새 담당 팀</div><select class="in" data-k="team">'
              + Object.entries(S.teams).sort((x, y) => (x[1].order || 0) - (y[1].order || 0)).map(([k, v]) => '<option value="' + k + '"' + (k === t.team ? ' selected' : '') + '>' + esc(v.name) + '</option>').join('') + '</select></div>'
              + '<div><div class="lbl" style="margin-top:0">근무일</div><input class="in" type="date" data-k="date" value="' + esc(t.workDate || today) + '"></div>'
              + '<div style="flex:1;min-width:140px"><div class="lbl" style="margin-top:0">사유 (선택)</div><input class="in" data-k="why" lang="ko" style="width:100%" placeholder="예: 차량 고장"></div>'
              + '<button class="btn primary" data-go="' + esc(tid) + '">변경 저장</button></div>' : '')
            + '</div>';
        }).join(''))
        + '<div class="err" data-e="err"></div>'
        + '<div class="row" style="margin-top:4px">' + (opt.canDelete ? '<button class="btn danger" data-e="del">🗑 민원 삭제</button>' : '')
        + '<span style="flex:1"></span><button class="btn" data-e="x">닫기</button><button class="btn primary" data-e="save">💾 수정 저장</button></div></div>';
      const q = k => ed.querySelector('[data-e="' + k + '"]');
      q('x').onclick = () => ed.classList.remove('on');
      // 민원 삭제 (관리자만): 민원·현장 작업·사진을 함께 지우고, 무엇을 지웠는지 기록에 남김
      if (q('del')) q('del').onclick = async () => {
        if (!confirm(m.no + ' · ' + (a.text || '') + ' 민원을 삭제할까요?\n현장 폰에서도 사라지고, 사진도 함께 지워집니다.')) return;
        if (!confirm('정말 삭제할까요? 되돌릴 수 없습니다.')) return;
        const bp = 'c/' + MW.C.company + '/', up = {};
        let bytes = 0, cnt = 0;
        up[bp + 'minwon/' + mid] = null;
        tids.forEach(tid => {
          up[bp + 'tasks/' + tid] = null;
          Object.entries(((TK(tid) || {}).photos) || {}).forEach(([pid, v]) => {
            up[bp + 'photoData/' + v.m + '/' + pid] = null; up[bp + 'photoThumb/' + v.m + '/' + pid] = null; bytes += v.size || 0; cnt++;
          });
        });
        up[bp + 'logs/' + cref('logs').push().key] = { kind: 'delete', at: TS, by: (opt.me && opt.me.label) || '', no: m.no,
          what: { addr: a.text || '', types: m.types || [], kind: m.kind || '', agency: m.agency || '', content: m.content || '', recvAt: m.recvAt || 0, staff: m.staff || '', photos: cnt } };
        try {
          await MW.db.ref().update(up);
          tids.forEach(tid => MW.db.ref(bp + 'unseen/' + tid).remove().catch(() => {}));   // [11_2] 수거앱 깜빡임 표시도 지움
          if (bytes || cnt) { cref('usage/photoBytes').transaction(v => Math.max(0, (v || 0) - bytes)); cref('usage/photoCount').transaction(v => Math.max(0, (v || 0) - cnt)); }
          MW.toast('🗑 ' + m.no + ' 민원을 삭제했습니다'); ed.classList.remove('on');
        } catch (e) { alert('삭제하지 못했습니다: ' + (e.message || e)); }
      };
      ed.querySelectorAll('[data-as]').forEach(b => b.onclick = () => b.closest('.tk').querySelector('.asx').classList.toggle('on'));
      // 담당 변경 (관리자, 미처리 건만 — R-79)
      ed.querySelectorAll('[data-go]').forEach(b => b.onclick = async () => {
        const tid = b.dataset.go, box = b.closest('.tk'), t = TK(tid) || {};
        const nt = box.querySelector('[data-k="team"]').value, nd = box.querySelector('[data-k="date"]').value;
        if (!nd) { alert('근무일을 골라 주세요'); return; }
        if (nt === t.team && nd === t.workDate) { box.querySelector('.asx').classList.remove('on'); return; }
        const bp = 'c/' + MW.C.company + '/', up = {};
        up[bp + 'tasks/' + tid + '/team'] = nt; up[bp + 'tasks/' + tid + '/shift'] = team(nt).shift; up[bp + 'tasks/' + tid + '/workDate'] = nd;
        if (t.state === 'seen') up[bp + 'tasks/' + tid + '/state'] = 'sent';   // 새 팀이 다시 '새 민원'으로 보게
        up[bp + 'logs/' + cref('logs').push().key] = { kind: 'assign', at: TS, by: (opt.me && opt.me.label) || '', no: m.no, taskId: tid,
          from: { team: t.team || '', workDate: t.workDate || '' }, to: { team: nt, workDate: nd }, why: box.querySelector('[data-k="why"]').value.trim() };
        try { await MW.db.ref().update(up);
          // [11_4] 미처리 건이면 수거앱 알림 칸(unseen = 미처리 민원)도 새 팀·근무일로
          if (t.state !== 'done' && t.state !== 'fail') MW.db.ref(bp + 'unseen/' + tid).set({ team: nt, shift: team(nt).shift || '', workDate: nd, recvAt: t.recvAt || m.recvAt || 0 }).catch(() => {});
          MW.toast('🔁 담당을 바꿨습니다'); if (r.ext) openById(mid); else setTimeout(() => openEdit(Object.assign({}, r, { t: TK(tid) })), 400); }
        catch (e) { alert('바꾸지 못했습니다: ' + (e.message || e)); }
      });
      // 기본정보 수정 → 민원 + 현장에 보낸 요약까지 함께 고침
      q('save').onclick = async () => {
        const err = q('err'); err.textContent = '';
        const tel = q('tel').value.trim(), place = q('place') ? q('place').value.trim() : (m.place || ''), content = q('content').value.trim(), at = q('addr').value.trim();
        if (!content) { err.textContent = '민원내용을 입력해 주세요'; return; }
        let addr = null;
        if (at !== (a.text || '')) {
          const pa = window.MW_ADDR && MW_ADDR.parseShort(at);
          if (!pa) { err.textContent = '주소를 알아보지 못했습니다 — 본 199 · 삼 64-8 · 트리 320-1203 처럼 써 주세요'; return; }
          if (!pa.ours && !confirm((pa.reason || '담당 구역이 아닌 주소입니다') + '\n그래도 바꿀까요?')) return;
          let c = MW_ADDR.coordOf(pa);
          if (!c) c = await MW_ADDR.geocode(pa, MW.C.kakao.restKey);
          addr = Object.assign({}, a, { text: pa.text, kind: pa.kind, hdong: pa.hdong || '', ours: !!pa.ours, apt: pa.apt || '', aptDong: pa.aptDong || '', ho: pa.ho || '',
            law: pa.law || '', jibun: pa.jibun || '', special: pa.special || '', road: '', jibunFull: '', lat: c ? c.lat : null, lng: c ? c.lng : null, exact: !!(c && c.exact !== false), fixed: false });
        }
        const bp = 'c/' + MW.C.company + '/', up = {}, mp = bp + 'minwon/' + mid + '/';
        up[mp + 'tel'] = tel; up[mp + 'place'] = place; up[mp + 'content'] = content; up[mp + 'editedAt'] = TS; up[mp + 'editedBy'] = (opt.me && opt.me.label) || '';
        up[mp + 'note'] = q('note') ? q('note').value.trim() : (m.note || '');   // [11_5] 관리 메모
        let kindLabel = '개인';
        if (m.kind === '기관') { up[mp + 'agency'] = q('agency').value; up[mp + 'officer'] = q('officer').value.trim(); kindLabel = '기관(' + q('agency').value + ')'; }
        if (addr) up[mp + 'addr'] = addr;
        tids.forEach(tid => {
          if (!TK(tid)) return;
          const sp = bp + 'tasks/' + tid + '/summary/';
          up[sp + 'tel'] = m.telHidden ? '민원인 미공개' + (tel ? ' · 구청 ' + tel : '') : tel;
          up[sp + 'place'] = place; up[sp + 'content'] = content; up[sp + 'kindLabel'] = kindLabel;
          if (addr) { up[sp + 'addrText'] = addr.text; up[sp + 'lat'] = addr.lat; up[sp + 'lng'] = addr.lng; up[sp + 'exact'] = addr.exact; }
        });
        // [11_5] 저장해도 창은 닫지 않는다 — 고친 내용으로 다시 연다 (같은 주소 내역도 그대로)
        try { await MW.db.ref().update(up); MW.toast('✅ 수정했습니다'); openById(mid); }
        catch (e) { err.textContent = '저장하지 못했습니다: ' + (e.message || e); }
      };
      ed.classList.add('on');
      // [11_5] 위쪽: 이 주소 최근 1년 민원 내역 (최근 순) — 줄을 누르면 아래에서 그 건 확인·수정
      (async () => {
        const key = addrKey(a.text), hx = q('hist'); if (!hx || !key) return;
        const list = yearOf(key);
        if (!list.some(x => x.mid === mid) && (m.recvAt || 0) >= yearFrom()) list.unshift({ mid, m });
        if (list.length < 2) { hx.innerHTML = ''; return; }
        const TT = await loadYT(); if (q('hist') !== hx) return;
        list.sort((x, y) => (y.m.recvAt || 0) - (x.m.recvAt || 0));
        hx.innerHTML = '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b>📍 ' + esc(a.text || '') + '</b><span class="rs-hot">🔥 이 주소 민원 ' + list.length + '건</span></div>'
          + '<div class="muted" style="margin-top:4px">이 주소로 접수됐던 민원 (최근 1년, 최근 순) — 줄을 누르면 아래에서 확인·수정</div>'
          + '<div class="rs-hist">' + list.map(x => { const rs = resultOf(x.m, TT);
            return '<div class="rs-it' + (x.mid === mid ? ' on' : '') + '" data-hm="' + esc(x.mid) + '"><span class="d">' + esc(md(x.m.recvAt)) + '</span><span>' + (x.m.types || []).map(t => esc(t)).join('·') + ' · ' + esc(x.m.content || '') + '<small>' + esc(rs.teams) + '</small></span>'
              + '<span class="rs-st ' + rs.cls + '">' + rs.txt + '</span><span></span></div>'; }).join('') + '</div>';
        hx.querySelectorAll('[data-hm]').forEach(el => el.onclick = () => { if (el.dataset.hm !== mid) openById(el.dataset.hm); });
      })();
    }

    // 사진: 미리보기는 보이는 줄의 것만, 원본은 누를 때 1장씩 (설계 §5-2)
    const thumbs = {}, fulls = {};
    async function thumb(el) {
      const pid = el.dataset.pid;
      if (!(pid in thumbs)) { const v = (await cref('photoThumb/' + el.dataset.m + '/' + pid).once('value')).val(); thumbs[pid] = v && v.jpg || ''; }
      if (thumbs[pid]) el.querySelector('img').src = thumbs[pid];
    }
    let big = document.getElementById('rs-big'), bigList = [], bigI = 0, bigRow = null;
    if (!big) {
      big = document.createElement('div'); big.id = 'rs-big'; big.className = 'rs-big';
      big.innerHTML = '<img alt=""><div class="cap"></div><button class="nav pv">‹</button><button class="nav nx">›</button>'
        + '<div class="tools"><button class="btn sm" data-b="save">💾 저장</button><button class="btn sm" data-b="x">닫기 ✕</button></div>';
      document.body.appendChild(big);
    }
    function openBig(r, j) {
      bigRow = r;
      bigList = Object.entries((r.t || {}).photos || {}).sort((a, b) => (a[1].k === b[1].k ? (a[1].at || 0) - (b[1].at || 0) : a[1].k === 'before' ? -1 : 1));
      bigI = j; showBig(); big.classList.add('on');
    }
    async function showBig() {
      const [pid, v] = bigList[bigI] || [];
      if (!pid) return;
      const img = big.querySelector('img');
      img.src = thumbs[pid] || '';
      big.querySelector('.cap').textContent = bigRow.m.no + ' · ' + (bigRow.m.addr && bigRow.m.addr.text) + ' · 처리 ' + (v.k === 'before' ? '전' : '후') + ' (' + (bigI + 1) + '/' + bigList.length + ')';
      if (!fulls[pid]) { const d = (await cref('photoData/' + v.m + '/' + pid).once('value')).val(); fulls[pid] = d && d.jpg || ''; }
      if (bigList[bigI] && bigList[bigI][0] === pid && fulls[pid]) img.src = fulls[pid];
    }
    big.querySelector('.pv').onclick = () => { bigI = (bigI - 1 + bigList.length) % bigList.length; showBig(); };
    big.querySelector('.nx').onclick = () => { bigI = (bigI + 1) % bigList.length; showBig(); };
    big.querySelector('[data-b="x"]').onclick = () => big.classList.remove('on');
    big.querySelector('[data-b="save"]').onclick = () => {
      const [pid, v] = bigList[bigI] || []; if (!pid) return;
      const a = document.createElement('a'); a.href = fulls[pid] || thumbs[pid];
      // 사진 파일 이름: 날짜_주소_처리전1.jpg (부장님 앱 방식)
      a.download = ymd(new Date(bigRow.m.recvAt)) + '_' + String((bigRow.m.addr && bigRow.m.addr.text) || '').replace(/[\\/:*?"<>|\s]+/g, '') + '_처리' + (v.k === 'before' ? '전' : '후') + (bigI + 1) + '.jpg';
      a.click();
    };
    document.addEventListener('keydown', e => {
      if (!big.classList.contains('on')) return;
      if (e.key === 'Escape') big.classList.remove('on');
      if (e.key === 'ArrowLeft') big.querySelector('.pv').click();
      if (e.key === 'ArrowRight') big.querySelector('.nx').click();
    });

    // 지도 (결과와 함께 — R-105)
    let map = null, ovs = [], pop = null;
    const ST_COL = { open: '#dc2626', done: '#16a34a' };
    function drawMap(list) {
      if (!window.kakao || !kakao.maps || !kakao.maps.Map) {
        if (!document.getElementById('kakao-sdk')) {
          const sc = document.createElement('script'); sc.id = 'kakao-sdk';
          sc.src = 'https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=' + MW.C.kakao.jsKey;
          sc.onload = () => kakao.maps.load(() => drawMap(filtered()));
          document.head.appendChild(sc);
        }
        return;
      }
      if (!map) {
        map = new kakao.maps.Map($r('map'), { center: new kakao.maps.LatLng(37.5068, 127.0885), level: 5 });
        kakao.maps.event.addListener(map, 'click', () => { if (pop) { pop.setMap(null); pop = null; } });
      } else map.relayout();
      ovs.forEach(o => o.setMap(null)); ovs = []; if (pop) { pop.setMap(null); pop = null; }
      const b = new kakao.maps.LatLngBounds(); let n = 0;
      // 같은 자리는 핀 하나로 (×건수), 오른쪽 위에 민원성상 꼬리표 (현장앱과 같음)
      const spots = {};
      list.forEach(r => { const a = r.m.addr || {}; if (!a.lat) return; const k = a.lat.toFixed(5) + ',' + a.lng.toFixed(5); (spots[k] = spots[k] || []).push(r); });
      Object.values(spots).forEach(rs => {
        const a = rs[0].m.addr, ll = new kakao.maps.LatLng(a.lat, a.lng);
        const s = rs.some(r => stateOf(r.t) === 'open') ? 'open' : 'done';
        const types = Array.from(new Set([].concat.apply([], rs.map(r => (r.t && r.t.types) || r.m.types || []))))
          .sort((x, y) => (S.types || []).indexOf(x) - (S.types || []).indexOf(y));
        const el = document.createElement('div');
        // [11_5] 같은 주소 최근 1년 민원이 2건 이상이면 오른쪽 위 건수 배지, 3건 이상이면 핀을 조금 크게
        const yc = yearCount(addrKey(a.text));
        el.className = 'rs-pin' + (yc >= 3 ? ' hot' : ''); el.style.background = ST_COL[s];
        el.innerHTML = esc(String(a.text || '').replace(/\s*\d+호$/, '')) + (rs.length > 1 ? ' ×' + rs.length : '')
          + '<span class="ty">' + (yc >= 2 ? '<b class="cnt" title="최근 1년 같은 주소 민원">' + yc + '</b>' : '') + types.map(x => '<b style="background:' + (TYPE_COL[x] || '#64748b') + (x === '음식물' ? ';color:#3b2a00' : '') + '">' + esc(x) + '</b>').join('') + '</span>';
        // [11_5] 핀을 누르면 수정창 — 위쪽에 그 주소 최근 1년 민원 내역
        el.onclick = () => { const rr = rs.slice().sort((x, y) => (y.m.recvAt || 0) - (x.m.recvAt || 0))[0]; openEdit(rr); };
        el.oncontextmenu = e => {   // (예전 작은 창: 오른쪽 클릭) 내용·사진
          e.preventDefault();
          if (pop) pop.setMap(null);
          const d = document.createElement('div'); d.className = 'rs-pop';
          d.innerHTML = '<b>' + esc(a.text) + '</b>' + rs.map((r, i) => {
            const t = r.t || {}, st = stateOf(r.t);
            return '<div class="item"><b>' + esc(r.m.no) + '</b> ' + (t.types || r.m.types || []).map(x => pill(x)).join('')
              + '<br>담당 ' + esc(team(t.team).name) + ' · <b>' + ST_TXT[st] + '</b>' + (t.doneBy ? '<br>수거 ' + esc(t.doneBy) + ' ' + esc(mdhm(t.doneAt)) : '')
              + (t.memo ? '<br>메모: ' + esc(t.memo) : '') + '<div class="rs-ph" data-i="' + i + '" style="margin-top:6px"></div></div>';
          }).join('');
          rs.forEach((r, i) => {
            const box = d.querySelector('.rs-ph[data-i="' + i + '"]');
            Object.entries((r.t || {}).photos || {}).forEach(([pid, v], j) => {
              const th = document.createElement('div'); th.className = 't'; th.dataset.pid = pid; th.dataset.m = v.m;
              th.innerHTML = '<img alt=""><i>' + (v.k === 'before' ? '전' : '후') + '</i>'; th.onclick = () => openBig(r, j);
              box.appendChild(th); thumb(th);
            });
          });
          d.onclick = e => e.stopPropagation();
          pop = new kakao.maps.CustomOverlay({ position: ll, content: d, yAnchor: 1.15, zIndex: 9 }); pop.setMap(map);
        };
        const o = new kakao.maps.CustomOverlay({ position: ll, content: el, yAnchor: 1, zIndex: s === 'done' ? 1 : 3 });
        o.setMap(map); ovs.push(o); b.extend(ll); n++;
      });
      if (n > 1) map.setBounds(b, 40, 40, 40, 40); else if (n === 1) map.setCenter(b.getCenter());
    }

    // 엑셀 내려받기
    async function excel(kindPick) {
      if (!window.XLSX) {
        await new Promise((ok, no) => { const sc = document.createElement('script'); sc.src = 'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js'; sc.onload = ok; sc.onerror = no; document.head.appendChild(sc); })
          .catch(() => alert('엑셀 도구를 불러오지 못했습니다'));
        if (!window.XLSX) return;
      }
      // 접수번호 순 (날짜 → 순번), 날짜는 연도까지
      const full = ts => ts ? ymd(new Date(ts)) + ' ' + pad(new Date(ts).getHours()) + ':' + pad(new Date(ts).getMinutes()) : '';
      const noKey = no => { const m = String(no || '').match(/(\d{4})-(\d+)/); return m ? m[1] + String(m[2]).padStart(4, '0') : ''; };
      const list = filtered().filter(r => !kindPick || kindPick === '전체' || ((r.t && r.t.types) || r.m.types || []).indexOf(kindPick) >= 0).sort((a, b) => (a.m.recvAt || 0) - (b.m.recvAt || 0) || noKey(a.m.no).localeCompare(noKey(b.m.no)));
      const head = ['접수번호', '접수일시', '종류', '주소', '위치 설명', '유형', '기관', '주무관', '전화', '민원내용', '담당 팀', '배정일', '처리 여부', '수거자(차량)', '대신 처리', '처리일시', '수거자 메모', '사진 수', '접수자'];
      const data = [head].concat(list.map(r => {
        const t = r.t || {}, m = r.m, s = stateOf(r.t);
        return [m.no, full(m.recvAt), (t.types || m.types || []).join('·') + (m.contReason ? ' (용기 ' + m.contReason + ')' : ''), m.addr && m.addr.text, m.place || '',
          m.kind, m.agency || '', admin ? (m.officer || '') : '', m.telHidden ? '미공개' + (m.tel ? ' (구청 ' + m.tel + ')' : '') : (m.tel || ''), m.content || '',
          team(t.team).name, t.workDate || '', t.state === 'fail' ? '미처리(없음)' : s === 'done' ? '처리' : '미처리', t.doneBy || '', t.proxy ? '대신' : '', full(t.doneAt),
          [t.failReason, t.memo].filter(Boolean).join(' / '), Object.keys(t.photos || {}).length, m.staff || ''];
      }));
      if (!admin) { data.forEach((row, i) => { if (i) row.splice(7, 1); }); head.splice(7, 1); }   // 주무관은 관리자 파일에만 ([10_27] data[0] 이 head 와 같은 배열이라 머리줄이 두 번 잘리던 것 고침)
      const ws = XLSX.utils.aoa_to_sheet(data);
      ws['!cols'] = head.map(h => ({ wch: /민원내용|수거자 메모/.test(h) ? 34 : /주소|위치 설명/.test(h) ? 18 : /접수일시|처리일시|전화|수거자\(차량\)|종류/.test(h) ? 17 : /접수번호|배정일/.test(h) ? 13 : 9 }));
      ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: data.length - 1, c: head.length - 1 } }) };
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };   // 머리줄 고정
      const thin = { style: 'thin', color: { rgb: 'D5DCE5' } }, border = { top: thin, bottom: thin, left: thin, right: thin };
      for (let r = 0; r < data.length; r++) for (let c = 0; c < head.length; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c })]; if (!cell) continue;
        const wrap = /민원내용|수거자 메모|주소|위치 설명/.test(head[c]);
        cell.s = r === 0 ? { font: { bold: true, color: { rgb: '1E3A5F' } }, fill: { fgColor: { rgb: 'E4EDF8' } }, alignment: { horizontal: 'center', vertical: 'center' }, border }
          : { alignment: { vertical: 'center', wrapText: wrap, horizontal: wrap ? 'left' : 'center' }, border,
              font: head[c] === '처리 여부' ? { bold: true, color: { rgb: data[r][c] === '처리' ? '15803D' : 'DC2626' } } : undefined };
      }
      ws['!rows'] = [{ hpt: 22 }];
      // [10_27] 출력 양식을 부장님 앱(민원·사고재해예방 관리대장)에 맞춘다.
      //   1장 '관리대장' = 부장님 앱 인쇄 양식 (제목 · 구분/기간/총건수 줄 · 구분별 묶음 · 10칸)
      //   2장 '목록'     = 부장님 앱 엑셀(CSV)과 같은 15칸 순서
      //   3장 '상세'     = 예전 민원앱 엑셀 그대로 (기관·주무관·배정일·사진 수 등 구청 보고용)
      const dOf = ts => ts ? ymd(new Date(ts)) : '';
      const hmOf = ts => ts ? pad(new Date(ts).getHours()) + ':' + pad(new Date(ts).getMinutes()) : '';
      const typesOf = r => ((r.t && r.t.types) || r.m.types || []);
      const addrOf = m => ((m.addr && m.addr.text) || '') + (m.place ? ' (' + m.place + ')' : '');
      const whoOf = m => m.kind === '기관' ? (m.agency || '기관') + (admin && m.officer ? ' ' + m.officer : '') : '개인';
      const telOf = m => m.telHidden ? '미공개' + (m.tel ? ' (구청 ' + m.tel + ')' : '') : (m.tel || '');
      const resOf = t => [t.failReason, t.memo].filter(Boolean).join(' / ');
      const actOf = (t, st) => st === 'done' ? ('처리 ' + full(t.doneAt) + (t.doneBy ? ' · ' + t.doneBy : '') + (t.proxy ? ' (대신)' : '')) : '';
      const stOf = st => st === 'done' ? '처리완료' : '미처리';
      const thinL = { style: 'thin', color: { rgb: '9AA5B1' } }, bL = { top: thinL, bottom: thinL, left: thinL, right: thinL };

      // ── 1장: 관리대장 ──
      const LH = ['번호', '일자', '구분', '주소', '내용구분', '상세내용', '점검·확인결과', '조치내용', '상태', '담당자'];
      const order = (S.types || []);
      const groups = {};
      list.forEach(r => { const k = typesOf(r)[0] || '기타'; (groups[k] = groups[k] || []).push(r); });
      const gkeys = Object.keys(groups).sort((a, b) => { let ia = order.indexOf(a), ib = order.indexOf(b); if (ia < 0) ia = 99; if (ib < 0) ib = 99; return (ia - ib) || a.localeCompare(b); });
      const tally = gkeys.map(k => k + ' ' + groups[k].length).join(' · ');
      const who = (opt.me && opt.me.label) || '';
      const L = [['민원 관리대장'], ['구분: ' + (kindPick || '전체') + '  |  기간: ' + $r('from').value + ' ~ ' + $r('to').value + '  |  총 ' + list.length + '건' + (tally ? ' (' + tally + ')' : '') + '  |  출력일: ' + ymd(new Date()) + (who ? '  |  출력자: ' + who : '')], []];
      const kindRow = {}, merges = [{ s: { r: 0, c: 0 }, e: { r: 0, c: LH.length - 1 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: LH.length - 1 } }];
      gkeys.forEach(k => {
        kindRow[L.length] = 'group'; merges.push({ s: { r: L.length, c: 0 }, e: { r: L.length, c: LH.length - 1 } });
        L.push([k + '   ' + groups[k].length + '건']);
        kindRow[L.length] = 'head'; L.push(LH.slice());
        groups[k].forEach(r => {
          const t = r.t || {}, m = r.m, st = stateOf(r.t);
          kindRow[L.length] = 'data';
          L.push([m.no || '', dOf(m.recvAt), typesOf(r).join('·'), addrOf(m), m.kind === '기관' ? (m.agency || '기관') : '개인', m.content || '', resOf(t), actOf(t, st), stOf(st), team(t.team).name || '']);
        });
        L.push([]);
      });
      const ws1 = XLSX.utils.aoa_to_sheet(L);
      ws1['!merges'] = merges;
      ws1['!cols'] = [13, 11, 10, 26, 12, 38, 26, 26, 9, 10].map(w => ({ wch: w }));
      ws1['!margins'] = { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 };
      const rowsH = [{ hpt: 30 }, { hpt: 20 }];
      for (let r = 0; r < L.length; r++) {
        if (r === 0) { const c0 = ws1['A1']; if (c0) c0.s = { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center', vertical: 'center' } }; continue; }
        if (r === 1) { const c1 = ws1['A2']; if (c1) c1.s = { font: { sz: 10, color: { rgb: '475569' } }, alignment: { horizontal: 'center', vertical: 'center' } }; continue; }
        const kr = kindRow[r]; if (!kr) continue;
        for (let c = 0; c < LH.length; c++) {
          const ref = XLSX.utils.encode_cell({ r, c });
          if (!ws1[ref]) ws1[ref] = { t: 's', v: '' };
          const cell = ws1[ref];
          if (kr === 'group') cell.s = { font: { bold: true, sz: 12, color: { rgb: '1E3A5F' } }, fill: { fgColor: { rgb: 'DCE6F2' } }, alignment: { vertical: 'center' }, border: bL };
          else if (kr === 'head') cell.s = { font: { bold: true }, fill: { fgColor: { rgb: 'F1F4F8' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: bL };
          else {
            const wrapC = c >= 3 && c <= 7;
            cell.s = { alignment: { vertical: 'center', horizontal: wrapC ? 'left' : 'center', wrapText: wrapC }, border: bL,
                       font: c === 8 ? { bold: true, color: { rgb: cell.v === '처리완료' ? '15803D' : 'DC2626' } } : undefined };
          }
        }
        if (kr === 'group') rowsH[r] = { hpt: 20 };
      }
      ws1['!rows'] = rowsH;

      // ── 2장: 목록 (부장님 앱 엑셀 15칸) ──
      const CH = ['구분', '번호', '날짜', '시간', '주소', '폐기물구분', '민원내용', '처리상태', '민원인', '연락처', '접수경로', '방문결과', '조치내용', '담당자', '등록일시'];
      const C2 = [CH].concat(list.map(r => {
        const t = r.t || {}, m = r.m, st = stateOf(r.t);
        return ['민원', m.no || '', dOf(m.recvAt), hmOf(m.recvAt), addrOf(m), typesOf(r).join('·'), m.content || '', stOf(st), whoOf(m), telOf(m), m.kind || '', resOf(t), actOf(t, st), team(t.team).name || '', full(m.recvAt)];
      }));
      const ws2 = XLSX.utils.aoa_to_sheet(C2);
      ws2['!cols'] = [6, 13, 11, 6, 26, 10, 36, 9, 14, 16, 8, 24, 24, 10, 16].map(w => ({ wch: w }));
      ws2['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: C2.length - 1, c: CH.length - 1 } }) };
      for (let c = 0; c < CH.length; c++) { const cell = ws2[XLSX.utils.encode_cell({ r: 0, c })]; if (cell) cell.s = { font: { bold: true, color: { rgb: '1E3A5F' } }, fill: { fgColor: { rgb: 'E4EDF8' } }, alignment: { horizontal: 'center' }, border }; }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws1, '관리대장');
      XLSX.utils.book_append_sheet(wb, ws2, '목록');
      XLSX.utils.book_append_sheet(wb, ws, '상세');
      if (list.length === 0 && !confirm((kindPick || '전체') + ' 민원이 이 기간에 없습니다. 빈 파일이라도 내려받을까요?')) return;
      XLSX.writeFile(wb, '민원결과_' + (kindPick && kindPick !== '전체' ? kindPick + '_' : '') + $r('from').value + '~' + $r('to').value + '.xlsx');
    }

    if (opt.st) $r('st').value = opt.st;
    setPer(opt.per || (admin ? '7일' : '오늘'));
    return { reload: load, rows: () => rows, stateOf, openById };
  }

  window.MW_RESULTS = { mount, TYPE_COL, pill };
})();
