import { Card } from '../components/Card'
import { StatusBadge } from '../components/StatusBadge'

export function PlaceholderPage({ title, role }: { title: string; role: string }) {
  return <div><div className="page-heading"><div><span className="eyebrow">{role} Demo</span><h1>{title}</h1></div><StatusBadge tone="success">公共路由已就绪</StatusBadge></div>
    <Card><h2>模块开发入口</h2><p>此页面已接入统一布局、路由和视觉变量。负责成员可以在对应 feature 中继续实现。</p></Card>
  </div>
}
