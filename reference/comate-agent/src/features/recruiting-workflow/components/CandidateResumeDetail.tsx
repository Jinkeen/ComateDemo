"use client";

import Image from "next/image";
import {
  BriefcaseBusiness,
  Download,
  FileText,
  GitBranch,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { useState, type CSSProperties } from "react";
import type { CandidateMatch } from "@/features/candidates/domain/types";
import { CandidateProjectExperience } from "./CandidateProjectExperience";
import { CandidateSocialAccounts } from "./CandidateSocialAccounts";

const defaultTabs = ["工作经历", "教育背景", "项目经验", "自媒体账号"];
const linCheTabs = ["项目经验", "工作经历", "教育背景", "自媒体账号"];
const zhouNingTabs = ["自媒体账号", "工作经历", "教育背景", "项目经验"];
const avatars = [
  "/assets/recruiting/candidate-avatar-female-v2.png",
  "/assets/recruiting/candidate-avatar-male-v2.png",
  "/assets/recruiting/ai-pm-avatar.png",
];

function avatarForCandidate(id: string) {
  const index = Math.max(0, Number(id.split("-").pop() ?? 1) - 1);
  return avatars[index % avatars.length];
}

export function CandidateResumeDetail({ match }: { match: CandidateMatch }) {
  const candidate = match.candidate;
  const displayName = candidate.name.replace(/（虚构）/g, "");
  const isLinChe = displayName === "林澈";
  const isZhouNing = displayName === "周宁";
  const tabs = isLinChe ? linCheTabs : isZhouNing ? zhouNingTabs : defaultTabs;
  const [tab, setTab] = useState(isLinChe ? "项目经验" : isZhouNing ? "自媒体账号" : "工作经历");

  return (
    <section className="candidate-review-resume" aria-label={`${displayName}的简历详情`}>
      <header className="candidate-review-resume-toolbar">
        <span>样本候选人</span>
        <div>
          <button type="button"><Download size={14} /> 下载简历</button>
          <button className="is-primary" type="button"><Mail size={14} /> 联系候选人</button>
        </div>
      </header>

      <div className="candidate-review-profile">
        <Image
          alt={`${displayName}头像`}
          height={72}
          src={avatarForCandidate(candidate.id)}
          width={72}
        />
        <div className="candidate-review-profile-copy">
          <div><h1>{displayName}</h1><span>强匹配</span></div>
          <p>{candidate.title} <em>@</em> 星河科技有限公司</p>
          <ul>
            <li><MapPin size={12} /> {candidate.location}</li>
            <li><BriefcaseBusiness size={12} /> {candidate.yearsOfExperience} 年工作经验</li>
            <li><GraduationCap size={12} /> 本科</li>
            <li><UserRound size={12} /> 28 岁</li>
          </ul>
          <small>{candidate.summary}</small>
          <div className="candidate-review-tags">
            {candidate.skills.slice(0, 7).map((skill) => <i key={skill}>{skill}</i>)}
          </div>
        </div>
      </div>

      <div className="candidate-review-resume-body">
        <main>
          <nav aria-label="简历详情分类">
            {tabs.map((item) => (
              <button
                aria-current={tab === item ? "page" : undefined}
                className={tab === item ? "is-current" : ""}
                key={item}
                onClick={() => setTab(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </nav>
          <ResumeTabContent tab={tab} />
        </main>

        <aside>
          <section className="candidate-review-score-card">
            <div className="candidate-review-score-ring" style={{ "--score": `${match.score * 3.6}deg` } as CSSProperties}>
              <span><b>{match.score}%</b><small>匹配度</small></span>
            </div>
            <p>与岗位要求高度匹配</p>
            <a href="#match-analysis">查看匹配分析</a>
          </section>
          <section>
            <h2>联系方式</h2>
            <p><Phone size={13} /> 138 **** 1234</p>
            <p><Mail size={13} /> linche@example.com</p>
            <p><GitBranch size={13} /> github.com/linche</p>
          </section>
          <section id="match-analysis">
            <h2>AI 推荐理由</h2>
            <p>{isLinChe
              ? "林澈拥有卓越的项目经验，深度参与 Dify、LangGenius 等开源产品，并主导企业级智能客服平台从架构到上线。其 AI 产品设计、0-1 落地与跨团队协作能力与当前岗位高度匹配。"
              : isZhouNing
                ? "周宁的产品自媒体做得很好，能把复杂 AI 产品讲清楚，并持续产出高质量内容。智东西等账号在抖音与小红书已形成稳定影响力，产品传播与用户认知能力突出。"
                : `${match.reasons.join("、")}与当前岗位要求高度匹配，具备完整的产品落地经验。`}</p>
            <a href="#resume-experience">查看详细分析</a>
          </section>
          <section>
            <h2>附件</h2>
            <p><FileText size={13} /> {displayName}_简历.pdf <Download size={12} /></p>
            <p><FileText size={13} /> 项目作品集.pdf <Download size={12} /></p>
          </section>
        </aside>
      </div>
    </section>
  );
}

function ResumeTabContent({ tab }: { tab: string }) {
  if (tab === "教育背景") {
    return (
      <div className="candidate-education-background">
        <div className="candidate-review-copy-block">
          <h3>浙江大学</h3>
          <p>计算机科学与技术 · 本科 · 2014.09 – 2018.06</p>
        </div>
        <div className="candidate-skill-section">
          <h3>专业技能</h3>
          <div className="screening-skill-grid">
            <div><b>核心能力</b><p>AI 产品设计 · 0-1 产品落地 · 大模型应用 · 需求分析 · 跨团队协作</p></div>
            <div><b>产品实践</b><p>PRD 设计 · 版本规划 · 用户反馈 · 效果评估</p></div>
            <div><b>AI 能力</b><p>大模型应用 · Agent 工作流 · 企业智能助手</p></div>
            <div><b>协作工具</b><p>Figma · Jira · Notion · SQL</p></div>
          </div>
        </div>
      </div>
    );
  }
  if (tab === "项目经验") {
    return <CandidateProjectExperience />;
  }
  if (tab === "自媒体账号") {
    return <CandidateSocialAccounts />;
  }
  return (
    <div className="candidate-review-experience" id="resume-experience">
      <Experience
        company="星河科技有限公司 · 中国 · 杭州"
        date="2022.03 – 至今"
        title="AI 产品经理"
        bullets={[
          "负责企业级大模型产品的需求分析、PRD 设计和版本规划。",
          "推动研发、算法与业务团队协作，完成产品从 0 到 1 上线。",
          "建立用户反馈与效果评估机制，持续优化产品转化率。",
        ]}
      />
      <Experience
        company="云智科技有限公司 · 中国 · 杭州"
        date="2018.07 – 2022.02"
        title="高级产品经理"
        bullets={[
          "负责 B 端 SaaS 产品规划与竞品分析。",
          "设计核心业务流程与数据指标体系。",
          "协同销售与交付团队完成重点客户项目。",
        ]}
      />
    </div>
  );
}

function Experience({ title, company, date, bullets }: { title: string; company: string; date: string; bullets: string[] }) {
  return (
    <article>
      <span aria-hidden="true" />
      <div>
        <header><h3>{title}</h3><small>{date}</small></header>
        <p>{company}</p>
        <ul>{bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
      </div>
    </article>
  );
}
