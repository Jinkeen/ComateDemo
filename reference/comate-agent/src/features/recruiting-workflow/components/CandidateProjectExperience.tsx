import Image from "next/image";
import {
  Clock3,
  ExternalLink,
  GitBranch,
  GitFork,
  Sparkles,
  Star,
} from "lucide-react";

type ProjectLink = {
  label: string;
  href: string;
};

type CandidateProject = {
  name: string;
  badge: string;
  badgeTone: "violet" | "blue";
  description: string;
  icon: "dify" | "langgenius" | "commercial";
  language?: string;
  stars?: string;
  forks?: string;
  updated?: string;
  tags?: string[];
  links?: ProjectLink[];
  preview: string;
  previewAlt: string;
};

const openSourceProjects: CandidateProject[] = [
  {
    name: "langgenius/dify",
    badge: "热门",
    badgeTone: "violet",
    description:
      "Build Agentic workflows, RAG pipelines, complete with AI model and tool support on one collaborative workspace. Deploy on cloud, VPC, or self-hosted, so teams move from prototype to production without friction.",
    icon: "dify",
    language: "TypeScript",
    stars: "152,543",
    forks: "24,079",
    updated: "7 hours ago",
    links: [
      { label: "Dify GitHub", href: "https://github.com/langgenius/dify" },
      { label: "Dify 官网", href: "https://dify.ai" },
    ],
    preview: "/assets/recruiting/dify-readme-preview.png",
    previewAlt: "Dify 项目 README 预览",
  },
  {
    name: "langgenius/langgenius",
    badge: "开源组织",
    badgeTone: "blue",
    description:
      "LangGenius is an LLMOps platform that helps you build GPT-based applications easily and intuitively. It provides prompt engineering, RAG pipelines, fine-tuning, and integration with popular tools.",
    icon: "langgenius",
    language: "TypeScript",
    stars: "3,742",
    forks: "812",
    updated: "yesterday",
    links: [
      {
        label: "LangGenius GitHub",
        href: "https://github.com/langgenius",
      },
      { label: "LangGenius 官网", href: "https://langgenius.ai" },
    ],
    preview: "/assets/recruiting/langgenius-profile-preview.png",
    previewAlt: "LangGenius GitHub 组织主页预览",
  },
];

const commercialProjects: CandidateProject[] = [
  {
    name: "星河智能客服平台",
    badge: "企业内部",
    badgeTone: "blue",
    description:
      "基于大模型的企业级智能客服平台，支持多渠道接入、知识库管理、智能问答与工单流转，大幅提升客服效率与用户满意度。",
    icon: "commercial",
    tags: ["Java", "Spring Boot", "MySQL", "Redis", "Kafka"],
    preview: "/assets/recruiting/customer-service-dashboard-preview.png",
    previewAlt: "星河智能客服平台数据看板预览",
  },
];

function ProjectIcon({ type }: { type: CandidateProject["icon"] }) {
  if (type === "dify") {
    return <span className="candidate-project-dify-logo" aria-hidden="true">D<span>i</span>fy</span>;
  }
  if (type === "commercial") {
    return <Sparkles aria-hidden="true" size={30} strokeWidth={1.7} />;
  }
  return <GitFork aria-hidden="true" size={29} strokeWidth={1.8} />;
}

function ProjectCard({ project }: { project: CandidateProject }) {
  return (
    <article className="candidate-project-card">
      <div className={`candidate-project-icon is-${project.icon}`}>
        <ProjectIcon type={project.icon} />
      </div>

      <div className="candidate-project-content">
        <header>
          <h4>{project.name}</h4>
          <span className={`candidate-project-badge is-${project.badgeTone}`}>
            {project.badge}
          </span>
        </header>
        <p>{project.description}</p>

        {project.language ? (
          <div className="candidate-project-metrics" aria-label={`${project.name} 项目数据`}>
            <span><i className="candidate-project-language-dot" />{project.language}</span>
            <span><Star aria-hidden="true" size={13} />{project.stars}</span>
            <span><GitFork aria-hidden="true" size={13} />{project.forks}</span>
            <span><Clock3 aria-hidden="true" size={13} />Updated {project.updated}</span>
          </div>
        ) : null}

        {project.tags ? (
          <div className="candidate-project-tags">
            {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        ) : null}

        {project.links ? (
          <div className="candidate-project-links">
            {project.links.map((link, index) => (
              <a
                aria-label={link.label}
                href={link.href}
                key={link.href}
                rel="noreferrer"
                target="_blank"
              >
                {index === 0 ? <GitBranch aria-hidden="true" size={14} /> : <ExternalLink aria-hidden="true" size={13} />}
                {index === 0 ? link.href.replace("https://", "") : link.href.replace("https://", "")}
              </a>
            ))}
          </div>
        ) : null}
      </div>

      <a
        aria-label={`查看 ${project.name} 项目预览`}
        className="candidate-project-preview"
        href={project.links?.[0]?.href ?? "#"}
        rel={project.links ? "noreferrer" : undefined}
        target={project.links ? "_blank" : undefined}
      >
        <Image alt={project.previewAlt} fill sizes="(min-width: 1440px) 240px, 180px" src={project.preview} />
      </a>
    </article>
  );
}

function ProjectGroup({ title, projects }: { title: string; projects: CandidateProject[] }) {
  return (
    <section className="candidate-project-group">
      <h3>{title} <span>{projects.length}</span></h3>
      <div className="candidate-project-list">
        {projects.map((project) => <ProjectCard key={project.name} project={project} />)}
      </div>
    </section>
  );
}

export function CandidateProjectExperience() {
  return (
    <div className="candidate-project-experience">
      <ProjectGroup projects={openSourceProjects} title="开源项目" />
      <ProjectGroup projects={commercialProjects} title="商业项目" />
    </div>
  );
}
