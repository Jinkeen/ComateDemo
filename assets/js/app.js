(function () {
  const app = document.querySelector('#app')
  const recruiterNav = [['创建岗位','recruiter/job'],['简历筛选','recruiter/screening'],['候选人','recruiter/candidates'],['面试安排','recruiter/interview'],['面试报告','recruiter/report']]

  function go(route) { location.hash = route }
  function rolePortal() {
    app.innerHTML = `<main class="portal"><section class="portal-copy"><span class="eyebrow">AI HR 协作招聘平台</span><h1>让招聘与求职，从理解开始</h1><p>请选择体验身份，进入对应的演示流程。</p></section><section class="role-grid"><article class="card role-card"><span class="role-icon">企</span><h2>我是招聘方</h2><p>创建岗位、筛选人才、组织面试并查看评估报告。</p><button data-route="recruiter/job">进入招聘工作台</button></article><article class="card role-card"><span class="role-icon cyan">人</span><h2>我是候选人</h2><p>管理人才名片，让更多机会看见完整的你。</p><a class="portal-link" href="candidate/profile.html">进入候选人空间</a></article></section></main>`
  }
  function workspace(route) {
    const title = recruiterNav.find(item => item[1] === route)?.[0] || '招聘工作台'
    app.innerHTML = `<div class="shell"><aside class="sidebar"><div class="brand">Comate AI</div><div class="role-label">招聘工作台</div><nav>${recruiterNav.map(([label,target]) => `<a href="#${target}" class="${target === route ? 'active' : ''}">${label}</a>`).join('')}</nav><button class="secondary" data-route="">切换身份</button></aside><main class="content"><header class="page-heading"><div><span class="eyebrow">招聘方 Demo</span><h1>${title}</h1></div><span class="badge">HTML 页面已就绪</span></header>${pageContent(route)}</main></div>`
  }
  function pageContent(route) {
    if (route === 'recruiter/candidates') return `<section class="card"><h2>推荐候选人</h2><div class="candidate-list">${window.COMATE_MOCK.candidates.map(item => `<article class="candidate"><div><strong>${item.name}</strong><p>${item.title}</p><div>${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div></div><div class="score">${item.score}<small>匹配分</small></div></article>`).join('')}</div></section>`
    if (route === 'recruiter/screening') return `<section class="card"><h2>Agent 协作进度</h2>${window.COMATE_MOCK.agentEvents.map(event => `<div class="event"><div><strong>${event.agent}</strong><p>${event.action}</p></div><span class="badge">${event.status}</span></div>`).join('')}</section>`
    return `<section class="card empty"><h2>模块开发入口</h2><p>公共页面、导航、样式与 Mock 数据已经接好。</p><button>开始体验</button></section>`
  }
  function render() { const route = location.hash.replace(/^#\/?/,''); if (!route) rolePortal(); else workspace(route); document.querySelectorAll('[data-route]').forEach(element => element.addEventListener('click',() => go(element.dataset.route))) }
  window.addEventListener('hashchange',render); render()
}())
