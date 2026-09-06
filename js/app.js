/* ===== 道德与法治工作台 应用逻辑 ===== */

let state = loadData();
let currentGrade = '三年级';
let currentType = '教案';
let currentPaperId = null;
let currentMarkTool = null; // 'yellow' | 'green' | 'underline'

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

/* ---------- 通用工具 ---------- */
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function openModal(title, bodyHTML, footerHTML = '') {
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = bodyHTML;
  $('#modal-footer').innerHTML = footerHTML;
  $('#modal-backdrop').hidden = false;
}
function closeModal() { $('#modal-backdrop').hidden = true; }

/* ---------- 时钟 ---------- */
function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  $('#clock').textContent = `${hh}:${mm}`;
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const dateLine = $('#date-line');
  if (dateLine) dateLine.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 周${weekdays[now.getDay()]}`;
}

/* ---------- 导航 ---------- */
function bindNav() {
  $$('.tabbar-item').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tabbar-item').forEach(b => b.classList.remove('active'));
      $$('.module').forEach(m => m.classList.remove('active'));
      btn.classList.add('active');
      $('#module-' + btn.dataset.module).classList.add('active');
      if (btn.dataset.module === 'progress') renderProgress();
      if (btn.dataset.module === 'resources') renderResources();
      if (btn.dataset.module === 'links') renderLinks();
      if (btn.dataset.module === 'papers') { renderPaperList(); showPaperList(); }
    });
  });
}

/* ---------- 周次与假期横幅 ---------- */
function renderWeekInfo() {
  const now = new Date();
  const weekNum = getWeekNumber(now);
  const weekName = weekNum > 0 && weekNum <= WEEK_NAMES.length ? `第${WEEK_NAMES[weekNum - 1]}周` : '假期';
  const todayHoliday = getHolidayOn(now);
  const nextHoliday = getNextHoliday(now);
  const weekEvent = getWeekEvent(weekNum);

  const banner = $('#week-banner');

  let leftHTML = `<span class="week-badge">${weekName}</span>`;

  let rightHTML = '';
  if (todayHoliday) {
    rightHTML = `<span class="holiday-tag holiday-${todayHoliday.color}">🎉 ${todayHoliday.name}中</span>`;
  } else if (weekEvent) {
    rightHTML = `<span class="event-tag">📌 ${weekEvent.name}</span>`;
  } else if (nextHoliday) {
    const days = daysUntil(nextHoliday.start, now);
    if (days === 0) {
      rightHTML = `<span class="holiday-tag holiday-${nextHoliday.color}">🎉 ${nextHoliday.name} 今天开始</span>`;
    } else if (days <= 7) {
      rightHTML = `<span class="soon-tag">⏳ ${nextHoliday.name}（${formatDateCN(nextHoliday.start)}）还有 ${days} 天</span>`;
    } else {
      rightHTML = `<span class="muted-tag">下一假期：${nextHoliday.name}（${formatDateCN(nextHoliday.start)}）</span>`;
    }
  }

  banner.innerHTML = `${leftHTML}<div class="week-banner-right">${rightHTML}</div>`;
}

/* ---------- 授课进度模块 ---------- */
function renderProgress() {
  renderWeekInfo();
  renderTodayReminder();
  renderClassCards();
}

function renderTodayReminder() {
  const now = new Date();
  const today = now.getDay(); // 0-6
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const todayClasses = state.schedule
    .filter(s => s.day === today)
    .sort((a, b) => a.time.localeCompare(b.time));

  const el = $('#today-reminder');
  if (todayClasses.length === 0) {
    el.innerHTML = `<div class="reminder-title">🗓️ 今日（周${['日','一','二','三','四','五','六'][today]}）暂无道德与法治课</div>`;
    return;
  }

  let html = `<div class="reminder-title">⏰ 今日课程提醒（共 ${todayClasses.length} 节）</div><div class="reminder-list">`;
  todayClasses.forEach(s => {
    const [sh, sm] = s.time.split(':').map(Number);
    const startMin = sh * 60 + sm;
    // 使用真实结束时间，没有则默认40分钟
    let endMin = startMin + 40;
    if (s.endTime) {
      const [eh, em] = s.endTime.split(':').map(Number);
      endMin = eh * 60 + em;
    }
    const progress = state.progress[s.className] || {};
    const idx = progress.completedIndex || 0;
    const plan = state.plan[s.className] || [];
    const topic = plan[idx] || '（未设置教学内容）';
    const isDone = progress.completedDates && progress.completedDates[s.time];
    const isPast = endMin < nowMin;
    const isCurrent = startMin <= nowMin && nowMin < endMin;
    const isSoon = !isPast && !isCurrent && startMin - nowMin < 30;

    let statusBadge = '';
    if (isDone) statusBadge = '<span class="reminder-done">✓ 已完成</span>';
    else if (isCurrent) statusBadge = '<span class="reminder-done" style="color:var(--seal)">● 正在上课</span>';
    else if (isSoon) statusBadge = '<span class="reminder-done" style="color:var(--gold)">即将开始</span>';
    else if (isPast) statusBadge = '<span class="reminder-done" style="color:var(--ink-mute)">已过</span>';

    html += `
      <div class="reminder-item">
        <span class="reminder-time">${s.time}${s.endTime ? '-' + s.endTime : ''}</span>
        <span class="reminder-class">${s.className}</span>
        <span class="reminder-content">${topic}</span>
        ${statusBadge}
      </div>`;
  });
  html += '</div>';
  el.innerHTML = html;
}

function renderClassCards() {
  const grid = $('#class-grid');
  grid.innerHTML = '';
  state.classes.forEach(cls => {
    const plan = state.plan[cls] || [];
    const progress = state.progress[cls] || {};
    const idx = progress.completedIndex || 0;
    const total = plan.length;
    const completed = idx;
    const pct = total ? Math.round((completed / total) * 100) : 0;
    const current = plan[idx] || '（教学计划待设置）';
    const grade = GRADE_MAP[cls] || '';

    const card = document.createElement('div');
    card.className = 'class-card';
    card.innerHTML = `
      <div class="class-card-head">
        <span class="class-name">${cls}班</span>
        <span class="class-grade-tag">${grade}</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="progress-text">
        <span>已授 ${completed} / ${total} 课</span>
        <span>${pct}%</span>
      </div>
      <div class="class-current">
        <div class="current-label">下一课内容</div>
        <div class="current-topic">${current}</div>
        <button class="btn-mark-done" data-class="${cls}" ${idx >= total ? 'disabled' : ''}>
          ${idx >= total ? '教学计划已完成' : '✓ 标记本课已授'}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  $$('.btn-mark-done').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const cls = btn.dataset.class;
      markLessonDone(cls);
    });
  });
}

function markLessonDone(cls) {
  const plan = state.plan[cls] || [];
  const progress = state.progress[cls] || { completedIndex: 0, completedDates: {} };
  if (progress.completedIndex >= plan.length) return;
  const topic = plan[progress.completedIndex];
  progress.completedIndex += 1;
  state.progress[cls] = progress;
  saveData(state);
  toast(`已记录：${cls}班 完成《${topic}》`);
  renderProgress();
}

/* ---------- 编辑课表 ---------- */
function editSchedule() {
  const days = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  let rows = state.schedule.map((s, i) => `
    <div class="schedule-row" data-idx="${i}">
      <select data-field="day">
        ${[1,2,3,4,5,6,7].map(d => `<option value="${d}" ${s.day==d?'selected':''}>${days[d]}</option>`).join('')}
      </select>
      <input type="time" data-field="time" value="${s.time}" />
      <input type="time" data-field="endTime" value="${s.endTime || ''}" placeholder="下课" />
      <select data-field="className">
        ${state.classes.map(c => `<option value="${c}" ${s.className==c?'selected':''}>${c}班</option>`).join('')}
      </select>
      <button class="schedule-del" data-del="${i}">✕</button>
    </div>
  `).join('');

  openModal('编辑课表', `
    <div class="form-group">
      <label class="form-label">设置每周的道德与法治课（星期 / 上课时间 / 下课时间 / 班级）</label>
    </div>
    <div class="schedule-editor" id="schedule-editor">${rows}</div>
    <button class="btn btn-ghost btn-sm" id="btn-add-schedule" style="margin-top:12px">＋ 添加一节课</button>
  `, `<button class="btn btn-ghost" id="modal-cancel">取消</button><button class="btn btn-primary" id="modal-save">保存</button>`);

  $('#btn-add-schedule').addEventListener('click', () => {
    const editor = $('#schedule-editor');
    const div = document.createElement('div');
    div.className = 'schedule-row';
    div.dataset.idx = 'new';
    div.innerHTML = `
      <select data-field="day">
        ${[1,2,3,4,5,6,7].map(d => `<option value="${d}">${days[d]}</option>`).join('')}
      </select>
      <input type="time" data-field="time" value="08:00" />
      <input type="time" data-field="endTime" value="08:40" placeholder="下课" />
      <select data-field="className">
        ${state.classes.map(c => `<option value="${c}">${c}班</option>`).join('')}
      </select>
      <button class="schedule-del">✕</button>
    `;
    editor.appendChild(div);
    bindScheduleDel();
  });

  function bindScheduleDel() {
    $$('.schedule-del').forEach(b => b.onclick = (e) => {
      e.target.closest('.schedule-row').remove();
    });
  }
  bindScheduleDel();

  $('#modal-cancel').onclick = closeModal;
  $('#modal-save').onclick = () => {
    const rows = $$('.schedule-row');
    const schedule = [];
    rows.forEach(r => {
      const endTime = r.querySelector('[data-field=endTime]').value;
      schedule.push({
        day: Number(r.querySelector('[data-field=day]').value),
        time: r.querySelector('[data-field=time]').value,
        endTime: endTime || undefined,
        className: r.querySelector('[data-field=className]').value,
      });
    });
    state.schedule = schedule;
    saveData(state);
    closeModal();
    toast('课表已保存');
    renderProgress();
  };
}

/* ---------- 编辑教学计划 ---------- */
function editPlan() {
  let html = '';
  state.classes.forEach(cls => {
    const plan = state.plan[cls] || [];
    html += `<h4>${cls}班</h4>`;
    html += `<div class="plan-list" data-class="${cls}">`;
    plan.forEach((t, i) => {
      html += `<div class="plan-topic"><input class="form-input" value="${t.replace(/"/g,'&quot;')}" /><button class="btn btn-ghost btn-sm" data-topic-del>删</button></div>`;
    });
    html += `</div><button class="btn btn-ghost btn-sm" data-add-topic="${cls}" style="margin-bottom:14px">＋ 添加一课</button>`;
  });

  openModal('编辑教学计划', `<div class="plan-editor">${html}</div>`,
    `<button class="btn btn-ghost" id="modal-cancel">取消</button><button class="btn btn-primary" id="modal-save">保存</button>`);

  $$('[data-add-topic]').forEach(btn => {
    btn.onclick = () => {
      const cls = btn.dataset.addTopic;
      const list = $(`.plan-list[data-class="${cls}"]`);
      const div = document.createElement('div');
      div.className = 'plan-topic';
      div.innerHTML = `<input class="form-input" placeholder="输入课题名称" /><button class="btn btn-ghost btn-sm" data-topic-del>删</button></div>`;
      list.appendChild(div);
      bindTopicDel();
    };
  });

  function bindTopicDel() {
    $$('[data-topic-del]').forEach(b => b.onclick = (e) => e.target.closest('.plan-topic').remove());
  }
  bindTopicDel();

  $('#modal-cancel').onclick = closeModal;
  $('#modal-save').onclick = () => {
    const newPlan = {};
    $$('.plan-list').forEach(list => {
      const cls = list.dataset.class;
      newPlan[cls] = $$('input', list).map(i => i.value.trim()).filter(Boolean);
    });
    state.plan = newPlan;
    saveData(state);
    closeModal();
    toast('教学计划已保存');
    renderProgress();
  };
}

/* ---------- 资料库模块 ---------- */
function renderResources() {
  $$('#resource-grade-tabs .tab').forEach(t => {
    t.classList.toggle('active', t.dataset.grade === currentGrade);
  });
  $$('#resource-type-tabs .tab').forEach(t => {
    t.classList.toggle('active', t.dataset.type === currentType);
  });
  $$('.res-col').forEach(col => {
    col.classList.toggle('active', col.dataset.type === currentType);
  });

  const cols = $$('.res-col');
  cols.forEach(col => {
    const type = col.dataset.type;
    const files = (state.resources[currentGrade] && state.resources[currentGrade][type]) || [];
    const ul = col.querySelector('.file-list');
    ul.innerHTML = '';
    if (files.length === 0) {
      ul.innerHTML = '<li style="text-align:center;color:var(--ink-mute);font-size:12px;padding:20px 0">暂无文件</li>';
      return;
    }
    files.forEach((f, i) => {
      const li = document.createElement('li');
      li.className = 'file-item';
      li.innerHTML = `
        <span class="file-ico">${getFileIcon(f.name)}</span>
        <div class="file-info">
          <div class="file-name" title="${f.name}">${f.name}</div>
          <div class="file-size">${formatSize(f.size)}</div>
        </div>
        <button class="file-del" title="删除">🗑️</button>
      `;
      li.querySelector('.file-info').onclick = () => {
        const a = document.createElement('a');
        a.href = f.data;
        a.download = f.name;
        a.click();
      };
      li.querySelector('.file-del').onclick = () => {
        if (!confirm(`确定删除「${f.name}」？`)) return;
        state.resources[currentGrade][type].splice(i, 1);
        saveData(state);
        renderResources();
      };
      ul.appendChild(li);
    });
  });
}

function bindResourceUpload() {
  $$('#resource-grade-tabs .tab').forEach(t => {
    t.onclick = () => { currentGrade = t.dataset.grade; renderResources(); };
  });
  $$('#resource-type-tabs .tab').forEach(t => {
    t.onclick = () => { currentType = t.dataset.type; renderResources(); };
  });

  $$('.upload-zone').forEach(zone => {
    zone.onclick = () => {
      const type = zone.dataset.type;
      const input = $('#file-input-res');
      input.value = '';
      input.onchange = async () => {
        const files = Array.from(input.files);
        for (const f of files) {
          const data = await fileToBase64(f);
          state.resources[currentGrade][type].push({
            name: f.name, size: f.size, data,
          });
        }
        saveData(state);
        renderResources();
        toast(`已上传 ${files.length} 个文件`);
      };
      input.click();
    };
  });
}

/* ---------- 学习网站模块 ---------- */
function renderLinks() {
  const grid = $('#link-grid');
  grid.innerHTML = '';
  state.links.forEach((l, i) => {
    const card = document.createElement('a');
    card.className = 'link-card';
    card.target = '_blank';
    card.rel = 'noopener';
    card.href = l.url;
    card.innerHTML = `
      <button class="link-del" data-del="${i}">✕</button>
      <div class="link-ico">${l.icon || '🔗'}</div>
      <div class="link-name">${l.name}</div>
      <div class="link-url">${l.url}</div>
    `;
    card.querySelector('.link-del').onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!confirm(`删除「${l.name}」？`)) return;
      state.links.splice(i, 1);
      saveData(state);
      renderLinks();
    };
    grid.appendChild(card);
  });
}

function addLink() {
  openModal('添加学习网站', `
    <div class="form-group">
      <label class="form-label">网站名称</label>
      <input class="form-input" id="link-name" placeholder="例如：国家智慧教育平台" />
    </div>
    <div class="form-group">
      <label class="form-label">网址</label>
      <input class="form-input" id="link-url" placeholder="https://..." />
    </div>
    <div class="form-group">
      <label class="form-label">图标（选填，可输入 emoji）</label>
      <input class="form-input" id="link-icon" placeholder="🏛️" />
    </div>
  `, `<button class="btn btn-ghost" id="modal-cancel">取消</button><button class="btn btn-primary" id="modal-save">添加</button>`);

  $('#modal-cancel').onclick = closeModal;
  $('#modal-save').onclick = () => {
    const name = $('#link-name').value.trim();
    let url = $('#link-url').value.trim();
    const icon = $('#link-icon').value.trim() || '🔗';
    if (!name || !url) { toast('请填写名称和网址'); return; }
    if (!/^https?:\/\//.test(url)) url = 'https://' + url;
    state.links.push({ name, url, icon });
    saveData(state);
    closeModal();
    renderLinks();
    toast('已添加');
  };
}

/* ---------- 论文阅读模块 ---------- */
function renderPaperList() {
  const list = $('#paper-list');
  list.innerHTML = '';
  if (state.papers.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:var(--ink-mute);padding:30px 10px;font-size:13px">暂无论文<br>点击"上传论文"添加</div>';
    return;
  }
  state.papers.forEach(p => {
    const item = document.createElement('div');
    item.className = 'paper-item' + (p.id === currentPaperId ? ' active' : '');
    item.innerHTML = `
      <div class="paper-item-title">${p.name}</div>
      <div class="paper-item-meta">${p.marks ? p.marks.length : 0} 处标记 · ${p.notes ? p.notes.length : 0} 字笔记</div>
    `;
    item.onclick = () => openPaper(p.id);
    list.appendChild(item);
  });
}

function openPaper(id) {
  currentPaperId = id;
  const paper = state.papers.find(p => p.id === id);
  if (!paper) return;
  paper.marks = paper.marks || [];
  paper.notes = paper.notes || '';
  renderPaperList();
  renderPaperReader();
  showPaperReader();
}

function showPaperList() {
  $('#paper-list-pane').hidden = false;
  $('#paper-reader-pane').hidden = true;
}

function showPaperReader() {
  $('#paper-list-pane').hidden = true;
  $('#paper-reader-pane').hidden = false;
}

function renderPaperReader() {
  const paper = state.papers.find(p => p.id === currentPaperId);
  const reader = $('#paper-reader');
  if (!paper) {
    reader.innerHTML = `<div class="reader-empty"><div class="empty-ico">📄</div><p>从左侧选择一篇论文开始阅读<br />或点击"上传论文"添加新论文</p></div>`;
    return;
  }
  reader.innerHTML = `
    <div class="reader-header">
      <div class="reader-title">${paper.name}</div>
      <div class="reader-tools">
        <button class="tool-btn" data-tool="yellow" title="黄色高亮">🖍️</button>
        <button class="tool-btn" data-tool="green" title="绿色高亮">🟢</button>
        <button class="tool-btn" data-tool="underline" title="下划线">✏️</button>
        <button class="tool-btn" id="btn-clear-marks" title="清除所有标记">🧹</button>
      </div>
    </div>
    <div class="reader-body" id="reader-body">${renderMarkedText(paper.content, paper.marks)}</div>
    <div class="reader-notes">
      <div class="notes-label">📝 我的阅读感受</div>
      <textarea class="notes-textarea" id="paper-notes" placeholder="在这里写下你的阅读心得、思考与感悟……">${paper.notes}</textarea>
    </div>
  `;

  // 标记工具
  $$('.tool-btn[data-tool]').forEach(b => {
    b.onclick = () => {
      $$('.tool-btn[data-tool]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      currentMarkTool = b.dataset.tool;
    };
  });

  $('#btn-clear-marks').onclick = () => {
    if (!confirm('清除这篇论文的所有标记？')) return;
    paper.marks = [];
    saveData(state);
    renderPaperReader();
    toast('已清除标记');
  };

  const body = $('#reader-body');
  body.addEventListener('mouseup', handleSelection);

  $('#paper-notes').oninput = (e) => {
    paper.notes = e.target.value;
    saveData(state);
    // 实时更新左侧列表的笔记字数
    const item = $$('.paper-item').find(it => it.classList.contains('active'));
    if (item) {
      const meta = item.querySelector('.paper-item-meta');
      if (meta) meta.textContent = `${paper.marks.length} 处标记 · ${paper.notes.length} 字笔记`;
    }
  };
}

function renderMarkedText(text, marks) {
  if (!marks || marks.length === 0) return escapeHtml(text);
  // 按 start 排序
  const sorted = [...marks].sort((a, b) => a.start - b.start);
  let html = '';
  let cursor = 0;
  // 简化：不处理重叠，跳过重叠区间
  const nonOverlap = [];
  let lastEnd = -1;
  sorted.forEach(m => {
    if (m.start >= lastEnd) { nonOverlap.push(m); lastEnd = m.end; }
  });
  nonOverlap.forEach(m => {
    if (m.start > cursor) html += escapeHtml(text.slice(cursor, m.start));
    const seg = escapeHtml(text.slice(m.start, m.end));
    if (m.type === 'yellow') html += `<mark class="hl-yellow" data-mark="${m.id}">${seg}</mark>`;
    else if (m.type === 'green') html += `<mark class="hl-green" data-mark="${m.id}">${seg}</mark>`;
    else if (m.type === 'underline') html += `<span class="hl-underline" data-mark="${m.id}">${seg}</span>`;
    cursor = m.end;
  });
  if (cursor < text.length) html += escapeHtml(text.slice(cursor));
  return html;
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function handleSelection() {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
  const selectedText = sel.toString().trim();
  if (!selectedText) return;

  const paper = state.papers.find(p => p.id === currentPaperId);
  if (!paper) return;

  // 计算选区在原文中的偏移
  const body = $('#reader-body');
  const range = sel.getRangeAt(0);
  const preRange = range.cloneRange();
  preRange.selectNodeContents(body);
  preRange.setEnd(range.startContainer, range.startOffset);
  const start = preRange.toString().length;
  const end = start + sel.toString().length;

  let tool = currentMarkTool;
  if (!tool) {
    // 没有选择工具时，弹出选择
    const type = prompt('选择标记类型：输入 1=黄色高亮, 2=绿色高亮, 3=下划线', '1');
    if (type === '1') tool = 'yellow';
    else if (type === '2') tool = 'green';
    else if (type === '3') tool = 'underline';
    else return;
  }

  paper.marks = paper.marks || [];
  paper.marks.push({ id: 'm' + Date.now(), type: tool, start, end });
  saveData(state);
  sel.removeAllRanges();
  renderPaperList();
  renderPaperReader();
  // 重新激活工具
  if (currentMarkTool) {
    const btn = $(`.tool-btn[data-tool="${currentMarkTool}"]`);
    if (btn) btn.classList.add('active');
  }
  toast('已添加标记');
}

function addPaper() {
  const input = $('#file-input-paper');
  input.value = '';
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    const text = await file.text();
    const paper = {
      id: 'p' + Date.now(),
      name: file.name.replace(/\.(txt|md|html?)$/i, ''),
      content: text,
      marks: [],
      notes: '',
    };
    state.papers.push(paper);
    saveData(state);
    currentPaperId = paper.id;
    renderPaperList();
    renderPaperReader();
    toast('论文已上传');
  };
  input.click();
}

/* ---------- 初始化 ---------- */
function init() {
  bindNav();
  bindResourceUpload();
  $('#modal-close').onclick = closeModal;
  $('#modal-backdrop').addEventListener('click', (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  });

  $('#btn-edit-schedule').onclick = editSchedule;
  $('#btn-edit-plan').onclick = editPlan;
  $('#btn-add-link').onclick = addLink;
  $('#btn-add-paper').onclick = addPaper;
  $('#reader-back').onclick = showPaperList;

  updateClock();
  setInterval(updateClock, 1000);
  renderProgress();

  // 课前提醒：每30秒检查一次
  setInterval(() => {
    if ($('#module-progress').classList.contains('active')) {
      renderTodayReminder();
    }
  }, 30000);
}

document.addEventListener('DOMContentLoaded', init);
