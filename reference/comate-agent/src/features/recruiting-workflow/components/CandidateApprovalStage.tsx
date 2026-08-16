"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness, ChevronLeft, ChevronRight, Download, FileText, GitBranch, GraduationCap, Mail, MapPin, Phone, Search, SlidersHorizontal, UserRound } from "lucide-react";
import { allResumeCandidateCount } from "@/features/candidates/data/seed-candidates";
import type { CandidateMatch } from "@/features/candidates/domain/types";
import { CandidateProjectExperience } from "./CandidateProjectExperience";
import { CandidateSocialAccounts } from "./CandidateSocialAccounts";

const defaultTabs = ["工作经历", "教育背景", "项目经验", "自媒体账号"];
const linCheTabs = ["项目经验", "工作经历", "教育背景", "自媒体账号"];
const zhouNingTabs = ["自媒体账号", "工作经历", "教育背景", "项目经验"];
const linCheRecommendReason = "林澈拥有卓越的项目经验，深度参与 Dify、LangGenius 等开源产品，并主导企业级智能客服平台从架构到上线。其 AI 产品设计、0-1 落地与跨团队协作能力与当前岗位高度匹配。";
const zhouNingRecommendReason = "周宁的产品自媒体做得很好，能把复杂 AI 产品讲清楚，并持续产出高质量内容。智东西等账号在抖音与小红书已形成稳定影响力，产品传播与用户认知能力突出。";
const defaultRecommendReason = "该候选人具备扎实的后端开发能力，在高并发场景与微服务架构方面有丰富实践经验，技术栈与岗位需求高度匹配。";

function isLinChe(match: CandidateMatch) {
  return match.candidate.name.replace(/（虚构）/g, "") === "林澈";
}

function isZhouNing(match: CandidateMatch) {
  return match.candidate.name.replace(/（虚构）/g, "") === "周宁";
}

function tabsFor(match: CandidateMatch) {
  if (isLinChe(match)) return linCheTabs;
  if (isZhouNing(match)) return zhouNingTabs;
  return defaultTabs;
}

function defaultTabFor(match: CandidateMatch) {
  if (isLinChe(match)) return "项目经验";
  if (isZhouNing(match)) return "自媒体账号";
  return "工作经历";
}

function cardHighlight(match: CandidateMatch) {
  const name = match.candidate.name.replace(/（虚构）/g, "");
  if (name === "林澈") return "项目经验丰富";
  if (name === "周宁") return "产品自媒体出色";
  if (name === "陈星") return "工作经历丰富";
  return null;
}

export function CandidateApprovalStage({ candidates, pageSize = 5, disabled = false, onApprove }: { candidates: CandidateMatch[]; pageSize?: number; disabled?: boolean; onApprove: (ids: string[]) => void }) {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(candidates[0] ? [candidates[0].candidate.id] : []));
  const [activeId, setActiveId] = useState(candidates[0]?.candidate.id ?? null);
  const [detailTab, setDetailTab] = useState(() => (candidates[0] ? defaultTabFor(candidates[0]) : "工作经历"));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"全部" | "强匹配" | "已联系">("全部");
  const filtered = useMemo(() => candidates.filter((match) => { const haystack = `${match.candidate.name} ${match.candidate.title} ${match.candidate.location} ${match.candidate.skills.join(" ")}`.toLowerCase(); return haystack.includes(query.toLowerCase()) && (filter === "全部" || (filter === "强匹配" ? match.score >= 85 : match.candidate.id.endsWith("3"))); }), [candidates, filter, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const active = candidates.find((item) => item.candidate.id === activeId) ?? visible[0] ?? candidates[0];
  const toggle = (id: string) => setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  return <section className="screening-workspace">
    <section className="screening-candidate-list">
      <header className="screening-list-heading"><div><h1>候选人筛选 <span className="screening-info">i</span></h1><p>已选择 {selected.size} 项 · 共 {allResumeCandidateCount} 项　<button onClick={() => setSelected(new Set())} type="button">清空</button></p></div><button className="screening-dark-button" disabled={disabled || selected.size === 0} onClick={() => onApprove([...selected])} type="button"><Mail size={15} /> 批量审批与联系</button></header>
      <div className="screening-search-row"><label className="screening-search"><Search size={15} /><input aria-label="搜索候选人姓名或关键词" onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder="搜索候选人姓名或关键词" value={query} /></label><button className="screening-filter-button" onClick={() => setFilter(filter === "全部" ? "强匹配" : filter === "强匹配" ? "已联系" : "全部")} type="button"><SlidersHorizontal size={15} /> {filter === "全部" ? "筛选" : filter}</button></div>
      <div className="screening-candidate-stack">{visible.map((match) => <CandidateCard key={match.candidate.id} match={match} active={active?.candidate.id === match.candidate.id} selected={selected.has(match.candidate.id)} onSelect={() => { setActiveId(match.candidate.id); setDetailTab(defaultTabFor(match)); }} onToggle={() => toggle(match.candidate.id)} />)}</div>
      <footer className="screening-pagination"><button aria-label="上一页" disabled={page === 0} onClick={() => setPage((current) => current - 1)} type="button"><ChevronLeft size={16} /></button><div className="screening-page-numbers">{Array.from({ length: pageCount }, (_, index) => <button className={index === page ? "is-current" : ""} key={index} onClick={() => setPage(index)} type="button">{index + 1}</button>)}<span>…</span><button type="button">15</button></div><button aria-label="下一页" disabled={page + 1 >= pageCount} onClick={() => setPage((current) => current + 1)} type="button"><ChevronRight size={16} /></button></footer>
    </section>
    {active ? <CandidateDetail match={active} tab={detailTab} onTabChange={setDetailTab} /> : <div className="screening-empty">没有找到匹配的候选人</div>}
  </section>;
}

function avatarForCandidate(id: string) {
  const index = Number(id.split("-").pop() ?? 0);
  if (index % 3 === 1) return "/assets/recruiting/candidate-avatar-female-v2.png";
  if (index % 3 === 2) return "/assets/recruiting/candidate-avatar-male-v2.png";
  return "/assets/recruiting/ai-pm-avatar.png";
}

function CandidateCard({ match, active, selected, onSelect, onToggle }: { match: CandidateMatch; active: boolean; selected: boolean; onSelect: () => void; onToggle: () => void }) {
  const candidate = match.candidate;
  const displayName = candidate.name.replace(/（虚构）/g, "");
  const highlight = cardHighlight(match);
  return <article className={`screening-candidate-card ${active ? "is-active" : ""} ${selected ? "is-selected" : ""}`} onClick={onSelect} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") onSelect(); }}>
    <input aria-label={`选择候选人 ${displayName}`} checked={selected} onChange={onToggle} onClick={(event) => event.stopPropagation()} type="checkbox" /><img src={avatarForCandidate(candidate.id)} alt="" />
    <div className="screening-card-copy"><div className="screening-name-line"><strong>{displayName}</strong><span className={`screening-status ${match.score >= 85 ? "violet" : "blue"}`}>{match.score >= 85 ? "强匹配" : "较匹配"}</span><span className="screening-contact">{candidate.id.endsWith("3") ? "已联系" : "未联系"}</span></div><p>{candidate.title} <em>@</em> {candidate.domains[0]}</p><small><MapPin size={12} /><span>{candidate.location}</span>{highlight ? <em className="screening-recommend-note">{highlight}</em> : null}</small><div className="screening-tags">{candidate.skills.slice(0, 4).map((skill) => <i key={skill}>{skill}</i>)}</div></div><div className="screening-score"><b>{match.score}</b><small>匹配分</small></div>
  </article>;
}

function CandidateDetail({ match, tab, onTabChange }: { match: CandidateMatch; tab: string; onTabChange: (tab: string) => void }) {
  const candidate = match.candidate;
  const displayName = candidate.name.replace(/（虚构）/g, "");
  return <section className="screening-detail-card"><header className="screening-detail-toolbar"><strong>候选人详情</strong><div><button className="screening-outline-button" type="button"><Download size={15} /> 下载简历</button><button className="screening-dark-button" type="button"><Mail size={15} /> 联系候选人</button></div></header>
    <div className="screening-profile"><img src={avatarForCandidate(candidate.id)} alt={`${displayName}头像`} /><div className="screening-profile-copy"><div className="screening-profile-name"><h2>{displayName}</h2><span className="screening-status violet">强匹配</span></div><p>{candidate.title} <em>@</em> 星河科技有限公司</p><div className="screening-meta"><span><MapPin size={13} /> {candidate.location}</span><span><BriefcaseBusiness size={13} /> {candidate.yearsOfExperience} 年工作经验</span><span><GraduationCap size={13} /> 本科</span><span><UserRound size={13} /> 28 岁</span></div><p className="screening-summary">{candidate.summary} 熟悉微服务架构、AI 相关项目与分布式系统。</p><div className="screening-tags"><i>Java</i><i>Kotlin</i><i>微服务</i><i>AI 应用</i><i>Spring Boot</i><i>MySQL</i><i>Redis</i><i>Kafka</i></div></div><div className="screening-match-panel"><div className="screening-ring"><div><b>{match.score}%</b><span>匹配度</span></div></div><p>与岗位要求高度匹配</p><a href="#analysis">查看匹配分析</a></div></div>
    <div className="screening-detail-grid"><div className="screening-detail-main"><nav className="screening-detail-tabs">{tabsFor(match).map((item) => <button className={tab === item ? "is-current" : ""} key={item} onClick={() => onTabChange(item)} type="button">{item}</button>)}</nav><DetailContent tab={tab} /></div><aside className="screening-side-cards"><section><h3>联系方式</h3><p><Phone size={14} /> 138 **** 1234</p><p><Mail size={14} /> {isLinChe(match) ? "linche@example.com" : "xiaoyu.zhang@email.com"}</p><p><GitBranch size={14} /> {isLinChe(match) ? "github.com/linche" : "github.com/zhangxiaoyu"}</p><p><span className="screening-in-icon">in</span> {isLinChe(match) ? "linkedin.com/in/linche" : "linkedin.com/in/zhangxiaoyu"}</p></section><section><h3>AI 推荐理由</h3><p>{isLinChe(match) ? linCheRecommendReason : isZhouNing(match) ? zhouNingRecommendReason : defaultRecommendReason}</p><a href="#analysis">查看详细分析</a></section><section><h3>附件</h3><p><FileText size={14} /> {`${displayName}_简历.pdf`} <Download size={13} /></p><p><FileText size={14} /> 项目作品集.pdf <Download size={13} /></p></section></aside></div>
  </section>;
}

function DetailContent({ tab }: { tab: string }) {
  if (tab === "教育背景") return (
    <div className="candidate-education-background">
      <div className="screening-detail-block">
        <b>浙江大学</b>
        <p>工业设计 · 硕士 · 2018.09 – 2020.06</p>
        <b>杭州电子科技大学</b>
        <p>信息管理与信息系统 · 学士 · 2014.09 – 2018.06</p>
      </div>
      <div className="candidate-skill-section">
        <h3>专业技能</h3>
        <div className="screening-skill-grid">
          <div><b>后端能力</b><p>Java · Kotlin · Spring Cloud · MySQL · Redis</p></div>
          <div><b>工程实践</b><p>微服务架构 · 高并发 · 分布式系统 · 性能优化</p></div>
          <div><b>AI 能力</b><p>AI 应用 · 智能推荐 · 模型服务</p></div>
          <div><b>协作工具</b><p>Git · Docker · Kubernetes · Jira</p></div>
        </div>
      </div>
    </div>
  );
  if (tab === "项目经验") return <CandidateProjectExperience />;
  if (tab === "自媒体账号") return <CandidateSocialAccounts />;
  return <div className="screening-experience"><Experience title="后端工程师" company="星河科技有限公司" date="2022.03 – 至今" bullets={["负责公司核心业务后端系统的设计与开发，支撑日均千万级请求量。", "基于 Spring Cloud 微服务架构，优化系统性能，提升系统稳定性。", "引入 AI 相关能力，构建智能推荐与风控模型，提升业务转化率。"]} tags={["微服务架构", "高并发系统", "AI 推荐系统", "性能优化"]} /><Experience title="高级软件工程师" company="云智科技有限公司" date="2020.06 – 2022.02" bullets={["参与公司 SaaS 平台后端系统开发，负责订单、支付等核心模块。", "设计并实现分布式任务调度系统，提升系统吞吐量与可靠性。", "与前端团队协作，优化接口设计，提升用户体验。"]} tags={["分布式系统", "任务调度", "系统设计", "接口优化"]} /></div>;
}

function Experience({ title, company, date, bullets, tags }: { title: string; company: string; date: string; bullets: string[]; tags: string[] }) { return <article className="screening-experience-entry"><span className="screening-experience-icon">▰</span><div><header><b>{title}</b><small>{date}</small></header><p>{company} · 中国 · 杭州</p><ul>{bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul><div className="screening-tags">{tags.map((tag) => <i key={tag}>{tag}</i>)}</div></div></article>; }
