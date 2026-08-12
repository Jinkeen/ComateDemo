import { useNavigate } from 'react-router-dom'
import { Card } from '../components/Card'

export function RolePortalPage() {
  const navigate = useNavigate()
  const enter = (role: 'recruiter' | 'candidate') => { localStorage.setItem('demo-role', role); navigate(`/${role}`) }
  return <main className="portal">
    <div className="portal__intro"><span className="eyebrow">AI HR 协作招聘平台</span><h1>让招聘与求职，从理解开始</h1><p>请选择体验身份，进入对应的 Demo 流程。</p></div>
    <div className="role-grid">
      <Card className="role-card"><span className="role-card__icon">企</span><h2>我是招聘方</h2><p>创建岗位、筛选人才、组织面试并查看评估报告。</p><button onClick={() => enter('recruiter')}>进入招聘工作台</button></Card>
      <Card className="role-card"><span className="role-card__icon role-card__icon--cyan">人</span><h2>我是候选人</h2><p>填写项目经历、生成电子名片并完成 AI 语音测评。</p><button onClick={() => enter('candidate')}>进入候选人空间</button></Card>
    </div>
  </main>
}
