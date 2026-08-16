import {
  ConversationHistorySidebar,
  type ConversationStatus,
} from "@/components/comate/ConversationHistorySidebar";
import type { RoleBrief } from "../domain/types";

export type RecruitingWorkspaceView = "create" | "screening" | "outreach" | "schedule" | "report";

export function RoleSidebar({ role, activeView }: { role?: RoleBrief; activeView?: RecruitingWorkspaceView }) {
  const currentHref = role
    ? `/hire/role/${role.id}${activeView === "create" ? "?view=create" : `?view=${activeView}`}`
    : "/hire";
  const currentMeta = {
    create: "岗位创建进行中",
    screening: "简历筛选进行中",
    outreach: "候选人触达准备中",
    schedule: "面试日程准备中",
    report: "面试报告准备中",
  }[activeView || "create"];
  const currentStatus: ConversationStatus =
    activeView === "screening"
      ? "screening"
      : activeView === "create"
        ? "creating"
        : "brief";

  return <ConversationHistorySidebar conversations={[
    { title: role?.title || "AI 产品经理招聘", meta: currentMeta, href: currentHref, current: true, status: currentStatus },
    { title: "高级算法工程师", meta: "昨天 · 已生成职位简报", status: "brief" },
    { title: "商业化运营负责人", meta: "7 月 28 日 · 候选人筛选中", status: "screening" },
    { title: "海外销售经理", meta: "7 月 26 日 · 已完成", status: "completed" },
  ]} />;
}
