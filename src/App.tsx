import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { RolePortalPage } from './pages/RolePortalPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

const recruiterPages = [
  ['jobs/new', '创建岗位与需求澄清'], ['screening', 'AI 简历筛选'], ['candidates', '候选人列表'],
  ['candidates/demo', '候选人详情'], ['interviews', '面试安排'], ['reports/demo', 'AI 面试报告'],
]
const candidatePages = [
  ['projects', '填写项目经历'], ['profile', '人才电子名片'], ['assessment', 'AI 语音性格测评'], ['result', '个人测评结果'],
]

export function App() {
  return <Routes>
    <Route path="/" element={<RolePortalPage />} />
    <Route path="/recruiter" element={<AppShell role="recruiter" />}>
      <Route index element={<Navigate to="jobs/new" replace />} />
      {recruiterPages.map(([path, title]) => <Route key={path} path={path} element={<PlaceholderPage title={title} role="招聘方" />} />)}
    </Route>
    <Route path="/candidate" element={<AppShell role="candidate" />}>
      <Route index element={<Navigate to="projects" replace />} />
      {candidatePages.map(([path, title]) => <Route key={path} path={path} element={<PlaceholderPage title={title} role="候选人" />} />)}
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
