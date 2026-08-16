"use client";

import Image from "next/image";
import { ChevronDown, ExternalLink, Play } from "lucide-react";
import { Fragment, useState } from "react";

type SocialAccount = {
  id: string;
  name: string;
  detailName?: string;
  platform: "抖音" | "小红书";
  avatar: string;
  stats: string;
  followers: string;
  works: string;
  description: string;
  href: string;
};

const accounts: SocialAccount[] = [
  {
    id: "ai-douyin",
    name: "AI抖音",
    platform: "抖音",
    avatar: "/assets/recruiting/social/ai-douyin-avatar.png",
    stats: "获赞 304.6万　关注 35　粉丝 14.0万",
    followers: "14.0 万粉丝",
    works: "286 个视频",
    description: "AI 科技热点、产品趋势与大模型应用的短视频解读。",
    href: "https://www.douyin.com",
  },
  {
    id: "zhidongxi-red",
    name: "智东西",
    platform: "小红书",
    avatar: "/assets/recruiting/social/zhidongxi-red-avatar.png",
    stats: "粉丝 4.3万 · 小红书号 95391376852",
    followers: "4.3 万粉丝",
    works: "418 篇内容",
    description: "聚焦人工智能、芯片、智能汽车与产业数字化动态。",
    href: "https://www.xiaohongshu.com",
  },
  {
    id: "zhidongxi-plus",
    name: "智东西Plus",
    detailName: "智东西",
    platform: "小红书",
    avatar: "/assets/recruiting/social/zhidongxi-plus-avatar.png",
    stats: "粉丝 1.2万 · 小红书号 49588915777",
    followers: "2.4 万粉丝",
    works: "703 个视频",
    description: "智东西官方账号，持续报道 AI、机器人与前沿科技。",
    href: "https://www.xiaohongshu.com",
  },
  {
    id: "weiren",
    name: "围仁@智东西",
    platform: "小红书",
    avatar: "/assets/recruiting/social/weiren-avatar.png",
    stats: "粉丝 1 · 小红书号 1165173804",
    followers: "1,165 粉丝",
    works: "86 篇内容",
    description: "科技记者视角下的 AI 行业人物、公司和产品观察。",
    href: "https://www.xiaohongshu.com",
  },
  {
    id: "zhidongxi-planet",
    name: "智东西",
    platform: "小红书",
    avatar: "/assets/recruiting/social/zhidongxi-planet-avatar.png",
    stats: "小红书号 27495361542",
    followers: "8,492 粉丝",
    works: "126 篇内容",
    description: "用轻量图文拆解 AI 硬件、模型与消费电子新品。",
    href: "https://www.xiaohongshu.com",
  },
  {
    id: "ruizhi",
    name: "睿智东西",
    platform: "小红书",
    avatar: "/assets/recruiting/social/ruizhi-avatar.png",
    stats: "小红书号 95299259505",
    followers: "6,821 粉丝",
    works: "154 篇内容",
    description: "关注智能终端、机器人产业和技术商业化进展。",
    href: "https://www.xiaohongshu.com",
  },
  {
    id: "ruozhi",
    name: "弱智东西",
    platform: "小红书",
    avatar: "/assets/recruiting/social/ruozhi-avatar.png",
    stats: "粉丝 47 · 小红书号 181057272",
    followers: "4,706 粉丝",
    works: "93 篇内容",
    description: "以轻松视角记录科技行业日常和热门产品体验。",
    href: "https://www.xiaohongshu.com",
  },
  {
    id: "business",
    name: "智东西商务",
    platform: "小红书",
    avatar: "/assets/recruiting/social/business-avatar.png",
    stats: "小红书号 206870562",
    followers: "3,280 粉丝",
    works: "62 篇内容",
    description: "品牌合作、行业活动与企业级科技内容服务窗口。",
    href: "https://www.xiaohongshu.com",
  },
];

const videos = [
  {
    image: "/assets/recruiting/social/workbuddy-video.png",
    plays: "442",
    title: "Workbuddy 这次更新，直接让 HTML “起死回生”",
    published: "2 天前",
  },
  {
    image: "/assets/recruiting/social/musk-video.png",
    plays: "661",
    title: "梁文锋与马斯克隔空过招，把前沿 AI 价格打下来了",
    published: "3 天前",
  },
  {
    image: "/assets/recruiting/social/deepseek-video.png",
    plays: "292",
    title: "DeepSeek 官宣涨价！高峰期最高暴涨 1100%",
    published: "3 天前",
  },
];

function AccountDetail({ account }: { account: SocialAccount }) {
  const detailName = account.detailName ?? account.name;
  return (
    <section className="candidate-social-detail">
      <header>
        <Image
          alt={`${detailName}账号头像`}
          height={64}
          src={account.id === "zhidongxi-plus" ? "/assets/recruiting/social/zhidongxi-profile.png" : account.avatar}
          width={64}
        />
        <div>
          <h3>{detailName}账号内容</h3>
          <p><strong>{account.followers}</strong><span>·</span><strong>{account.works}</strong></p>
          <small>{account.description}</small>
        </div>
        <a href={account.href} rel="noreferrer" target="_blank">访问主页 <ExternalLink aria-hidden="true" size={13} /></a>
      </header>
      <div className="candidate-social-videos">
        {videos.map((video) => (
          <article data-testid="social-video-card" key={video.title}>
            <div className="candidate-social-video-cover">
              <Image alt="" fill sizes="(min-width: 1440px) 220px, 160px" src={video.image} />
              <span><Play aria-hidden="true" fill="currentColor" size={13} />{video.plays}</span>
            </div>
            <h4>{video.title}</h4>
            <p>{video.published}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CandidateSocialAccounts() {
  const [expandedId, setExpandedId] = useState<string | null>("zhidongxi-plus");

  return (
    <section className="candidate-social-accounts">
      <header className="candidate-social-heading">
        <div>
          <h3>自媒体账号</h3>
          <p>候选人在各大平台的自媒体账号及内容影响力</p>
        </div>
      </header>
      <div className="candidate-social-grid">
        {accounts.map((account) => {
          const expanded = expandedId === account.id;
          return (
            <Fragment key={account.id}>
              <article className={`candidate-social-card ${expanded ? "is-expanded" : ""}`}>
                <Image alt={`${account.name}头像`} height={52} src={account.avatar} width={52} />
                <div>
                  <header>
                    <h4>{account.name}</h4>
                    <span className={`is-${account.platform === "抖音" ? "douyin" : "redbook"}`}>{account.platform}</span>
                  </header>
                  <p>{account.stats}</p>
                </div>
                <button
                  aria-expanded={expanded}
                  aria-label={`查看 ${account.name} 账号详情`}
                  onClick={() => setExpandedId(expanded ? null : account.id)}
                  type="button"
                >
                  查看账号 <ChevronDown aria-hidden="true" size={14} />
                </button>
              </article>
              {expanded ? <AccountDetail account={account} /> : null}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
