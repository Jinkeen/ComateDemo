(function () {
  const app = document.querySelector('#app')
  const recruiterNav = [['创建岗位','recruiter/job'],['简历筛选','recruiter/screening'],['候选人','recruiter/candidates'],['面试安排','recruiter/interview'],['面试报告','recruiter/report']]

  function go(route) { location.hash = route }
  function rolePortal() {
    app.innerHTML = `<main class="portal portal-v2">
      <header class="landing-nav"><a class="landing-brand" href="#"><span>CO</span>Comate</a><p>AI Native Talent Network</p><a href="#about">关于我们</a></header>
      <section class="portal-copy">
        <span class="eyebrow">为 AI 时代重新连接人才与项目</span>
        <h1>让好项目，遇见真正<br>能一起做事的人</h1>
        <p>用真实项目看见能力，用持续对话理解同频。<br>让每一家企业更快找到同频伙伴，也让每个个体成长为值得被看见的人才 IP。</p>
        <div class="portal-actions">
          <button class="identity-button recruiter-entry" data-route="recruiter/job"><i class="entry-icon solid-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="14" cy="14" r="8"/><path d="m20 20 6 6"/><circle cx="14" cy="12" r="2.5"/><path d="M9.5 18c.7-2.2 2.2-3.3 4.5-3.3s3.8 1.1 4.5 3.3"/></svg></i><span>我是招聘方</span><small>找到来了就能一起做事的人</small><b>进入工作台</b></button>
          <a class="identity-button candidate-entry" href="candidate/profile.html"><i class="entry-icon solid-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="7" width="22" height="19" rx="3"/><circle cx="12" cy="14" r="3"/><path d="M8 21c.6-2.5 1.9-3.8 4-3.8s3.4 1.3 4 3.8M20 14h4M20 18h3"/><path class="spark" d="m24 3 .7 1.7L26.5 5l-1.8.7L24 7.5l-.7-1.8L21.5 5l1.8-.3L24 3Z"/></svg></i><span>我是候选人</span><small>让能力、项目和潜力被看见</small><b>进入人才空间</b></a>
        </div>
        <p class="trust-line"><i></i>AI 给出建议，人完成最终判断，每一次匹配都有真实证据</p>
      </section>
      <section class="portal-story" id="about">
        <div><span>FOR TEAMS</span><strong>一句话说清需求</strong><p>AI 澄清人才画像、筛选真实项目、推荐同频候选人，并协助完成面试闭环。</p></div>
        <div><span>FOR TALENT</span><strong>从一份简历，走向人才 IP</strong><p>沉淀项目、作品与对话证据，形成持续成长、可解释的人才能力画像。</p></div>
        <div><span>OUR VISION</span><strong>围绕项目，连接协作</strong><p>让更多优秀的人因为能力被看见，因为项目而连接，因为协作创造价值。</p></div>
      </section>
      <div class="signal-bars" aria-hidden="true">${Array.from({length:42},(_,index)=>`<i style="--i:${index};--h:${18 + ((index * 37) % 76)}px"></i>`).join('')}</div>
    </main>`
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
