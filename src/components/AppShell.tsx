import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from './Button'

const nav = {
  recruiter: [['创建岗位', '/recruiter/jobs/new'], ['简历筛选', '/recruiter/screening'], ['候选人', '/recruiter/candidates'], ['面试安排', '/recruiter/interviews']],
  candidate: [['项目经历', '/candidate/projects'], ['电子名片', '/candidate/profile'], ['AI 测评', '/candidate/assessment'], ['测评结果', '/candidate/result']],
}

export function AppShell({ role }: { role: 'recruiter' | 'candidate' }) {
  const navigate = useNavigate()
  return <div className="shell">
    <aside className="sidebar"><div className="brand">Comate AI</div><div className="role-label">{role === 'recruiter' ? '招聘工作台' : '候选人空间'}</div>
      <nav>{nav[role].map(([label, to]) => <NavLink key={to} to={to}>{label}</NavLink>)}</nav>
      <Button variant="secondary" onClick={() => navigate('/')}>切换身份</Button>
    </aside>
    <main className="main"><Outlet /></main>
  </div>
}
