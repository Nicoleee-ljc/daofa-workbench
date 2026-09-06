/* ===== 默认数据与本地存储 ===== */

const DEFAULT_CLASSES = ['三1', '三2', '三5', '五1', '五2', '五3', '五8', '五9'];

const GRADE_MAP = {
  '三1': '三年级', '三2': '三年级', '三5': '三年级',
  '五1': '五年级', '五2': '五年级', '五3': '五年级', '五8': '五年级', '五9': '五年级'
};

// 课表数据版本（课表更新时递增，自动覆盖旧的占位课表）
const SCHEDULE_VERSION = 2;

// 默认课表（已根据老师提供的真实课表设置）
const DEFAULT_SCHEDULE = [
  // 星期一
  { day: 1, period: 3, time: '10:45', endTime: '11:30', className: '三2' },
  { day: 1, period: 4, time: '12:50', endTime: '13:30', className: '三1' },
  { day: 1, period: 6, time: '14:55', endTime: '15:35', className: '五9' },
  // 星期二
  { day: 2, period: 3, time: '10:45', endTime: '11:30', className: '五1' },
  { day: 2, period: 4, time: '12:50', endTime: '13:30', className: '三5' },
  { day: 2, period: 6, time: '14:55', endTime: '15:35', className: '五8' },
  // 星期三
  { day: 3, period: 2, time: '09:55', endTime: '10:35', className: '三1' },
  { day: 3, period: 4, time: '12:50', endTime: '13:30', className: '五2' },
  { day: 3, period: 5, time: '13:40', endTime: '14:25', className: '五3' },
  { day: 3, period: 6, time: '14:55', endTime: '15:35', className: '五1' },
  // 星期四
  { day: 4, period: 3, time: '10:45', endTime: '11:30', className: '三5' },
  { day: 4, period: 5, time: '13:40', endTime: '14:25', className: '五2' },
  { day: 4, period: 6, time: '14:55', endTime: '15:35', className: '五9' },
  // 星期五
  { day: 5, period: 3, time: '10:45', endTime: '11:30', className: '三2' },
  { day: 5, period: 4, time: '12:50', endTime: '13:30', className: '五8' },
  { day: 5, period: 5, time: '13:40', endTime: '14:25', className: '五3' },
];

// 教学计划版本（更新时递增，自动覆盖旧的占位计划，保留授课进度）
const PLAN_VERSION = 2;

// 三年级上册教学计划（三1、三2、三5）
const PLAN_GRADE3 = [
  '开学适应课',
  '第1课 学习伴我成长',
  '第2课 我学习，我快乐',
  '第3课 学习有方法',
  '第4课 科技力量大',
  '第4课 科技力量大',
  '第5课 走近科学家',
  '第6课 从小爱科学',
  '第7课 走近我们的老师',
  '第8课 同学相伴',
  '第9课 让我们的学校更美好',
  '第10课 公共场所的文明素养',
  '第10课 公共场所的文明素养',
  '第11课 我们都是热心人',
  '第12课 生活离不开规则',
  '第13课 安全记心上',
  '全册知识梳理 专项复习',
  '期末综合复习 模拟练习',
  '期末综合复习 查漏补缺',
  '期末综合素养评价 学期总结',
  '寒假',
];

// 五年级上册教学计划（五1、五2、五3、五8、五9）
const PLAN_GRADE5 = [
  '开学第1课 第1课 开天辟地的大事变',
  '第1课 开天辟地的大事变；第2课 探索中国革命道路',
  '第2课 探索中国革命道路；第3课 抗日战争的中流砥柱',
  '第3课 抗日战争的中流砥柱；第4课 夺取胜利的解放战争',
  '第4课 夺取胜利的解放战争；第一单元复习',
  '第4课 夺取胜利的解放战争；第一单元复习',
  '第5课 中国人民站起来了',
  '第6课 人民当家作主',
  '第7课 社会主义好',
  '第二单元复习；第8课 改革开放展宏图',
  '第8课 改革开放展宏图',
  '第9课 综合国力日益提升',
  '第9课 综合国力日益提升',
  '第10课 祖国统一大业不断推进；第三单元复习',
  '第11课 走进新时代',
  '第12课 历史性成就',
  '第13课 开启新征程',
  '第四单元复习',
  '期末专项复习：史实脉络梳理',
  '期末专项复习：核心素养提升',
  '期末检测 学期总结',
];

// 默认教学计划
const DEFAULT_PLAN = {
  '三1': [...PLAN_GRADE3],
  '三2': [...PLAN_GRADE3],
  '三5': [...PLAN_GRADE3],
  '五1': [...PLAN_GRADE5],
  '五2': [...PLAN_GRADE5],
  '五3': [...PLAN_GRADE5],
  '五8': [...PLAN_GRADE5],
  '五9': [...PLAN_GRADE5],
};

const DEFAULT_LINKS = [
  { name: '国家智慧教育公共服务平台', url: 'https://www.smartedu.cn', icon: '🏛️' },
  { name: '苏州线上教育中心', url: 'https://szxsjy.jssndu.cn', icon: '📺' },
  { name: '人民教育出版社', url: 'https://www.pep.com.cn', icon: '📚' },
  { name: '教育部官网', url: 'http://www.moe.gov.cn', icon: '🎓' },
  { name: '中国教研网', url: 'http://www.zgjiaoyan.com', icon: '🔬' },
  { name: '学习强国', url: 'https://www.xuexi.cn', icon: '⭐' },
];

const STORAGE_KEY = 'moral_edu_workbench_v1';

/* ===== 校历数据 ===== */
// 学期第一周的周一（2026年8月31日）
const SEMESTER_START = new Date(2026, 7, 31);

// 周次中文名
const WEEK_NAMES = ['一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','二十一','二十二'];

// 假期（含周末调休）
const HOLIDAYS = [
  { name: '中秋节', start: '2026-09-25', end: '2026-09-27', color: 'gold' },
  { name: '国庆节', start: '2026-10-01', end: '2026-10-07', color: 'gold' },
  { name: '苏E秋假', start: '2026-11-16', end: '2026-11-18', color: 'pink' },
  { name: '元旦', start: '2027-01-01', end: '2027-01-03', color: 'gold' },
  { name: '寒假', start: '2027-01-27', end: '2027-02-28', color: 'gold' },
];

// 重要节点（按周次）
const WEEK_EVENTS = [
  { name: '中小学期中考试', week: 11 },
  { name: '中小学期末考试', week: 21 },
];
const SPECIAL_DAYS = [
  { name: '休业式', date: '2027-01-26' },
];

// 计算某日期是第几周（第一周从 SEMESTER_START 周一开始）
function getWeekNumber(date) {
  const start = new Date(SEMESTER_START);
  start.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diffMs = d - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 0;
  return Math.floor(diffDays / 7) + 1;
}

// 获取某日期所在假期
function getHolidayOn(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  for (const h of HOLIDAYS) {
    const s = new Date(h.start);
    const e = new Date(h.end);
    s.setHours(0,0,0,0); e.setHours(0,0,0,0);
    if (d >= s && d <= e) return h;
  }
  return null;
}

// 获取下一个即将到来的假期（含今天）
function getNextHoliday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  let upcoming = null;
  for (const h of HOLIDAYS) {
    const e = new Date(h.end);
    e.setHours(0,0,0,0);
    if (e >= d) { upcoming = h; break; }
  }
  return upcoming;
}

// 获取某周的事件
function getWeekEvent(weekNum) {
  return WEEK_EVENTS.find(e => e.week === weekNum) || null;
}

// 格式化日期为 "9月25日"
function formatDateCN(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

// 计算距某日期还有几天
function daysUntil(dateStr, fromDate) {
  const target = new Date(dateStr);
  target.setHours(0,0,0,0);
  const from = new Date(fromDate);
  from.setHours(0,0,0,0);
  return Math.round((target - from) / (1000 * 60 * 60 * 24));
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      // 课表版本检查
      const scheduleVersion = data.scheduleVersion || 1;
      const schedule = (scheduleVersion < SCHEDULE_VERSION) ? DEFAULT_SCHEDULE : (data.schedule || DEFAULT_SCHEDULE);
      // 教学计划版本检查：更新计划但保留已标记的授课进度
      const planVersion = data.planVersion || 1;
      const plan = (planVersion < PLAN_VERSION) ? DEFAULT_PLAN : (data.plan || DEFAULT_PLAN);
      return {
        classes: data.classes || DEFAULT_CLASSES,
        schedule: schedule,
        scheduleVersion: SCHEDULE_VERSION,
        plan: plan,
        planVersion: PLAN_VERSION,
        progress: data.progress || {},
        resources: data.resources || { '三年级': { '教案': [], '课件': [], '资料': [] }, '五年级': { '教案': [], '课件': [], '资料': [] } },
        links: data.links || DEFAULT_LINKS,
        papers: data.papers || [],
      };
    }
  } catch (e) { console.warn('读取本地数据失败', e); }
  return {
    classes: DEFAULT_CLASSES,
    schedule: DEFAULT_SCHEDULE,
    scheduleVersion: SCHEDULE_VERSION,
    plan: DEFAULT_PLAN,
    planVersion: PLAN_VERSION,
    progress: {},
    resources: { '三年级': { '教案': [], '课件': [], '资料': [] }, '五年级': { '教案': [], '课件': [], '资料': [] } },
    links: DEFAULT_LINKS,
    papers: [],
  };
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 文件转 base64（用于本地存储）
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  const map = {
    pdf: '📕', doc: '📘', docx: '📘', ppt: '📙', pptx: '📙',
    xls: '📗', xlsx: '📗', mp4: '🎬', avi: '🎬', mov: '🎬',
    mp3: '🎵', jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
    zip: '🗜️', rar: '🗜️', txt: '📄', md: '📄', html: '🌐', htm: '🌐',
  };
  return map[ext] || '📎';
}
