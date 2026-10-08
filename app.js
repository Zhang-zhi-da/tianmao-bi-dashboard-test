// BI 看板起步模板 —— 从 data/sales.json 拉取数据并用 ECharts 渲染
// 部署到 GitHub Pages 后，浏览器直接读取仓库里的数据文件（raw 链接带 CORS 头）。
// 本地用 file:// 双击打开时 fetch 会被浏览器拦截，此时自动回退到下方内置示例数据。

const DATA_URL = 'data/sales.json';

// 内置示例数据：仅当无法读取 DATA_URL 时作为本地预览兜底
const FALLBACK_DATA = {
  updated: '2026-10-08（示例）',
  monthly: [
    { month: '1月', sales: 128, profit: 32 },
    { month: '2月', sales: 96,  profit: 24 },
    { month: '3月', sales: 145, profit: 38 },
    { month: '4月', sales: 162, profit: 44 },
    { month: '5月', sales: 178, profit: 49 },
    { month: '6月', sales: 203, profit: 57 },
    { month: '7月', sales: 191, profit: 52 },
    { month: '8月', sales: 214, profit: 61 },
    { month: '9月', sales: 236, profit: 68 }
  ],
  categories: [
    { name: '酱油',       value: 420 },
    { name: '食醋',       value: 260 },
    { name: '辣椒酱',     value: 310 },
    { name: '味精/鸡精',  value: 180 },
    { name: '复合调料',   value: 240 },
    { name: '其他',       value: 90  }
  ],
  regions: [
    { name: '华东', value: 480 },
    { name: '华南', value: 360 },
    { name: '华北', value: 300 },
    { name: '西南', value: 210 },
    { name: '华中', value: 190 },
    { name: '东北', value: 120 },
    { name: '西北', value: 90  }
  ]
};

const CHARCOAL = '#36454F';
const SOFT = '#5F7C8A';
const PALETTE = ['#36454F', '#5F7C8A', '#9DB2BD', '#C7D3DA', '#E3E9EC', '#A8B5BC'];

async function loadData() {
  try {
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    hideBanner();
    return json;
  } catch (e) {
    showBanner('当前为本地示例数据（无法读取 ' + DATA_URL + '）。请用本地服务器打开，或部署到 GitHub Pages 后自动加载最新数据。');
    return FALLBACK_DATA;
  }
}

function showBanner(msg) {
  const b = document.getElementById('banner');
  b.textContent = msg;
  b.style.display = 'block';
}
function hideBanner() {
  document.getElementById('banner').style.display = 'none';
}

function renderKpis(data) {
  const totalSales = data.monthly.reduce((s, d) => s + d.sales, 0);
  const totalProfit = data.monthly.reduce((s, d) => s + d.profit, 0);
  const margin = ((totalProfit / totalSales) * 100).toFixed(1);
  const peak = data.monthly.reduce((m, d) => (d.sales > m.sales ? d : m), data.monthly[0]);

  const cards = [
    { label: '累计销售额', value: totalSales, unit: '万元' },
    { label: '累计利润',   value: totalProfit, unit: '万元' },
    { label: '平均毛利率', value: margin, unit: '%' },
    { label: '月度峰值',   value: peak.sales, unit: '万元 · ' + peak.month }
  ];
  document.getElementById('kpiGrid').innerHTML = cards.map(c => `
    <div class="kpi">
      <div class="label">${c.label}</div>
      <div class="value">${c.value}<span class="unit">${c.unit}</span></div>
    </div>`).join('');

  document.getElementById('updated').textContent = '数据更新时间：' + data.updated;
}

function renderMonthly(data) {
  const chart = echarts.init(document.getElementById('chartMonthly'));
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['销售额', '利润'], top: 0 },
    grid: { left: 40, right: 40, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: data.monthly.map(d => d.month), axisLine: { lineStyle: { color: SOFT } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#E3E9EC' } } },
    series: [
      { name: '销售额', type: 'bar', data: data.monthly.map(d => d.sales), itemStyle: { color: CHARCOAL }, barWidth: '45%' },
      { name: '利润', type: 'line', smooth: true, data: data.monthly.map(d => d.profit), itemStyle: { color: SOFT }, lineStyle: { width: 3 } }
    ]
  });
  return chart;
}

function renderCategory(data) {
  const chart = echarts.init(document.getElementById('chartCategory'));
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 万元 ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '68%'],
      center: ['50%', '46%'],
      data: data.categories,
      color: PALETTE,
      label: { formatter: '{b}\n{d}%' }
    }]
  });
  return chart;
}

function renderRegion(data) {
  const sorted = [...data.regions].sort((a, b) => a.value - b.value);
  const chart = echarts.init(document.getElementById('chartRegion'));
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 50, right: 30, top: 20, bottom: 20 },
    xAxis: { type: 'value', splitLine: { lineStyle: { color: '#E3E9EC' } } },
    yAxis: { type: 'category', data: sorted.map(d => d.name), axisLine: { lineStyle: { color: SOFT } } },
    series: [{ type: 'bar', data: sorted.map(d => d.value), itemStyle: { color: SOFT }, barWidth: '55%' }]
  });
  return chart;
}

(async function main() {
  const data = await loadData();
  renderKpis(data);
  const charts = [renderMonthly(data), renderCategory(data), renderRegion(data)];
  window.addEventListener('resize', () => charts.forEach(c => c.resize()));
})();
