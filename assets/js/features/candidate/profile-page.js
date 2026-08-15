(function () {
  const toast = document.querySelector('#toast')
  const modal = document.querySelector('#project-modal')
  const form = document.querySelector('#project-form')
  const nameInput = document.querySelector('#project-name')
  const resultInput = document.querySelector('#project-result')
  const stream = document.querySelector('#chat-stream')
  const chatInput = document.querySelector('#chat-text')
  let currentProject = null

  const replies = {
    '今天我最值得做什么？': '今天只做两件事就很好：先完成星川科技的线上测评，再把 AI 内容工作流项目补充一条量化成果。完成以后，你已经比昨天更接近合适的机会了。',
    '哪些岗位更适合我？': '结合你的品牌经验、视觉策略和 AI 工作流能力，今天推荐三个方向：AI 品牌增长、内容科技产品、消费品牌创新。优先关注同时需要业务判断与创意协作的岗位。',
    '帮我优化项目表达': '可以把项目写成“问题、行动、结果”三句话。比如：内容交付慢；我搭建 AI 内容工作流并推动团队采用；最终交付周期缩短 60%。',
    '我有点面试焦虑': '会焦虑说明你很重视这次机会。先不用准备所有问题，只选一个最有代表性的项目，用三分钟讲清背景、你的行动和结果。我可以陪你练一遍。'
  }

  function showToast(message) { toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1700) }
  function switchTab(name) { document.querySelectorAll('[data-tab]').forEach(button => button.classList.toggle('active', button.dataset.tab === name)); document.querySelectorAll('[data-panel]').forEach(panel => panel.classList.toggle('is-visible', panel.dataset.panel === name)) }
  function openModal(project) { currentProject = project; nameInput.value = project?.dataset.project || ''; resultInput.value = project?.dataset.result || ''; modal.classList.add('open'); modal.setAttribute('aria-hidden','false') }
  function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true') }
  function addMessage(text, type) { const row = document.createElement('div'); row.className = `message ${type}`; row.innerHTML = type === 'user' ? `<div><p>${text}</p></div><span>我</span>` : `<span>CO</span><div><p>${text}</p><small>刚刚</small></div>`; stream.appendChild(row); stream.scrollTop = stream.scrollHeight }
  function ask(text) { if (!text.trim()) return; addMessage(text,'user'); chatInput.value = ''; window.setTimeout(() => addMessage(replies[text] || '我听见了。你可以继续告诉我具体发生了什么，我会结合你的人才画像，陪你一起梳理下一步。','ai'),450) }

  document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click',() => switchTab(button.dataset.tab)))
  document.querySelectorAll('.project-item').forEach(item => item.addEventListener('click',() => openModal(item)))
  document.querySelector('#add-project').addEventListener('click',() => openModal(null))
  document.querySelector('.modal-close').addEventListener('click',closeModal)
  modal.addEventListener('click',event => { if (event.target === modal) closeModal() })
  form.addEventListener('submit',event => { event.preventDefault(); if (currentProject) { currentProject.dataset.project = nameInput.value; currentProject.dataset.result = resultInput.value; currentProject.querySelector('strong').textContent = nameInput.value; currentProject.querySelector('.project-result').innerHTML = `<b>结果</b> ${resultInput.value}` } closeModal(); showToast('项目经历已更新') })
  document.querySelector('#share-profile').addEventListener('click',async () => { try { await navigator.clipboard.writeText(location.href) } catch (error) {} showToast('名片链接已复制') })
  document.querySelector('#edit-profile').addEventListener('click',() => showToast('编辑入口已准备，下一步可补充表单'))
  document.querySelector('#manage-tags').addEventListener('click',() => showToast('能力拼图调整入口已准备'))
  document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click',() => ask(button.dataset.prompt)))
  document.querySelector('#chat-form').addEventListener('submit',event => { event.preventDefault(); ask(chatInput.value) })
}())
