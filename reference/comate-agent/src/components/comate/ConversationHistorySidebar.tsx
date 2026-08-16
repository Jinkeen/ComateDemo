import {
  Building2,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Settings,
  UserRound,
} from "lucide-react";
import Link from "next/link";

export type ConversationStatus = "creating" | "screening" | "brief" | "completed" | "idle";

export interface ConversationItem {
  title: string;
  meta: string;
  href?: string;
  current?: boolean;
  status?: ConversationStatus;
}

const STATUS_LABELS: Record<ConversationStatus, string> = {
  creating: "岗位创建中",
  screening: "简历筛选中",
  brief: "职位简报已生成",
  completed: "招聘已完成",
  idle: "历史对话",
};

function resolveConversationStatus(conversation: ConversationItem): ConversationStatus {
  if (conversation.status) return conversation.status;

  const meta = conversation.meta;
  if (/已完成/.test(meta)) return "completed";
  if (/筛选|触达|日程|报告/.test(meta)) return "screening";
  if (/简报/.test(meta)) return "brief";
  if (/创建|澄清|进行中/.test(meta)) return "creating";
  return "idle";
}

function conversationOrbClassName(conversation: ConversationItem): string {
  const status = resolveConversationStatus(conversation);
  return [
    "comate-conversation-orb",
    `is-status-${status}`,
    conversation.current ? "is-active" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

interface ConversationHistorySidebarProps {
  conversations?: ConversationItem[];
}

const defaultConversations: ConversationItem[] = [
  { title: "AI 产品经理招聘", meta: "10 分钟前 · 需求澄清中", current: true, status: "creating" },
  { title: "高级算法工程师", meta: "昨天 · 已生成职位简报", status: "brief" },
  { title: "商业化运营负责人", meta: "7 月 28 日 · 候选人筛选中", status: "screening" },
  { title: "海外销售经理", meta: "7 月 26 日 · 已完成", status: "completed" },
];

export function ConversationHistorySidebar({ conversations = defaultConversations }: ConversationHistorySidebarProps) {
  return (
    <aside className="comate-history-panel" aria-label="对话记录">
      <button className="comate-workspace-card" type="button">
        <span><Building2 size={19} /></span>
        <span><strong>Comate.AI 招聘空间</strong><small>企业招聘团队</small></span>
        <ChevronDown size={16} />
      </button>

      <Link className="comate-new-chat" href="/hire"><Plus size={18} />新建对话</Link>

      <section className="comate-conversation-list">
        <header><h2>对话记录</h2><span>{conversations.length}</span></header>
        <div>
          {conversations.map((conversation) => {
            const content = (
              <>
                <span
                  aria-hidden="true"
                  className={conversationOrbClassName(conversation)}
                  title={STATUS_LABELS[resolveConversationStatus(conversation)]}
                />
                <span><strong>{conversation.title}</strong><small>{conversation.meta}</small></span>
                <MoreHorizontal size={18} />
              </>
            );

            return conversation.href ? (
              <Link
                aria-current={conversation.current ? "page" : undefined}
                className={conversation.current ? "is-current" : ""}
                href={conversation.href}
                key={`${conversation.title}-${conversation.meta}`}
              >
                {content}
              </Link>
            ) : (
              <button
                aria-current={conversation.current ? "page" : undefined}
                className={conversation.current ? "is-current" : ""}
                key={`${conversation.title}-${conversation.meta}`}
                type="button"
              >
                {content}
              </button>
            );
          })}
        </div>
      </section>

      <footer className="comate-history-footer">
        <button type="button"><UserRound size={18} />招聘负责人</button>
        <button type="button"><Settings size={18} />设置</button>
      </footer>
    </aside>
  );
}
