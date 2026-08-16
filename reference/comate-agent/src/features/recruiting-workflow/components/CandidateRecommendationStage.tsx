"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, RefreshCw } from "lucide-react";
import { useState } from "react";
import { seedCandidates } from "@/features/candidates/data/seed-candidates";

const avatars = [
  "/assets/recruiting/candidate-avatar-female-v2.png",
  "/assets/recruiting/candidate-avatar-male-v2.png",
  "/assets/recruiting/ai-pm-avatar.png",
];

const featuredProfiles = [
  {
    initials: "林澈",
    title: "AI 产品经理",
    location: "远程优先",
    yearsOfExperience: 6,
    score: 92,
    advantages: [
      "深度参与 Dify 与 LangGenius 开源产品",
      "主导企业级智能客服从 0 到 1 上线",
      "具备 AI 产品设计与跨团队协作经验",
    ],
  },
  {
    initials: "周宁",
    title: "产品经理",
    location: "中国大陆",
    yearsOfExperience: 5,
    score: 88,
    advantages: [
      "擅长把复杂 AI 产品讲清楚并持续产出",
      "智东西账号在抖音与小红书有稳定影响",
      "具备产品传播与用户认知打造能力",
    ],
  },
  {
    initials: "W.R.",
    title: "高级软件工程师",
    location: "深圳",
    yearsOfExperience: 6,
    score: 85,
    advantages: [
      "在大型项目中担任核心开发角色",
      "具备优秀的代码质量和工程化能力",
      "熟悉 DevOps 流程与自动化部署",
    ],
  },
];

const fallbackAdvantages = [
  ["具备扎实的机器学习和深度学习项目经验", "熟悉 Python、TensorFlow 等主流技术栈", "有大规模数据处理与模型优化实战经验"],
  ["精通分布式系统设计与高并发解决方案", "丰富的微服务架构与性能优化经验", "熟悉多种编程语言和数据库技术"],
  ["在大型项目中担任核心开发角色", "具备优秀的代码质量和工程化能力", "熟悉 DevOps 流程与自动化部署"],
];

const initialsPool = ["M.S.", "J.M.", "W.R.", "L.C.", "Z.N.", "C.X.", "X.Y.", "S.Y."];

interface CandidateRecommendationStageProps {
  roleId: string;
  variant?: "page" | "inline";
}

export function CandidateRecommendationStage({
  roleId,
  variant = "page",
}: CandidateRecommendationStageProps) {
  const batchCount = Math.ceil(seedCandidates.length / 3);
  const [batch, setBatch] = useState(0);
  const recommended = seedCandidates.slice(batch * 3, batch * 3 + 3).map((candidate, index) => ({
    candidate,
    presentation: batch === 0
      ? featuredProfiles[index]
      : {
          initials: initialsPool[(batch * 3 + index) % initialsPool.length],
          title: candidate.title,
          location: candidate.location,
          yearsOfExperience: candidate.yearsOfExperience,
          score: Math.max(76, 91 - batch * 2 - index * 3),
          advantages: fallbackAdvantages[index],
        },
  }));

  return (
    <section
      aria-labelledby="candidate-recommendation-title"
      className={`recommendation-stage${variant === "inline" ? " is-inline" : ""}`}
    >
      <header className="recommendation-header">
        <div>
          <h1 id="candidate-recommendation-title">推荐候选人</h1>
          <p>基于岗位要求与候选人画像的智能匹配，以下是最合适的候选人推荐</p>
        </div>
      </header>

      <div className="recommendation-grid">
        {recommended.map(({ candidate, presentation }, index) => (
          <article
            aria-label={`候选人推荐 ${presentation.initials}`}
            className="recommendation-card"
            key={candidate.id}
          >
            <div className="recommendation-person">
              <div className="recommendation-avatar">
                <Image
                  alt={`${presentation.initials}的候选人头像`}
                  height={72}
                  src={avatars[index]}
                  width={72}
                />
              </div>
              <div>
                <strong>{presentation.initials}</strong>
                <h2>{presentation.title}</h2>
                <p>
                  <MapPin aria-hidden="true" size={13} />
                  {presentation.location} · {presentation.yearsOfExperience}年经验
                </p>
              </div>
            </div>

            <div className="recommendation-score">
              匹配度 <b>{presentation.score}%</b>
            </div>

            <div className="recommendation-advantages">
              <h3>匹配优势</h3>
              <ul>
                {presentation.advantages.map((advantage) => (
                  <li key={advantage}>
                    <span aria-hidden="true" />
                    {advantage}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              aria-label={`查看简历 ${presentation.initials}`}
              className="recommendation-resume-link"
              href={`/hire/role/${roleId}?view=screening&mode=review&candidate=${candidate.id}`}
            >
              查看简历
              <ArrowRight aria-hidden="true" size={14} />
            </Link>
          </article>
        ))}
      </div>

      <button
        aria-label="换一批候选人"
        className="recommendation-refresh"
        onClick={() => setBatch((current) => (current + 1) % batchCount)}
        type="button"
      >
        换一批候选人
        <RefreshCw aria-hidden="true" size={16} />
      </button>
    </section>
  );
}
