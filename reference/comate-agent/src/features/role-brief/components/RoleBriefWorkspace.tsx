"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AgentConversation } from "./AgentConversation";
import { useRoleBrief } from "../hooks/useRoleBrief";
import type { WorkspaceSnapshot } from "@/features/recruiting-agent/application/role-workspace-service";
import { RecruitingAppShell } from "@/features/recruiting-workflow/components/RecruitingAppShell";
import { workflowDisplayStep } from "@/features/recruiting-workflow/components/RecruitingWorkflowPanel";
import { CandidateScreeningShowcase } from "@/features/recruiting-workflow/components/CandidateScreeningShowcase";
import { CandidateReviewStage, type ReviewResult } from "@/features/recruiting-workflow/components/CandidateReviewStage";
import { RoleBriefOverview } from "./RoleOverviewPanel";
import type { RecruitingWorkspaceView } from "./RoleSidebar";

function resolveWorkspaceView(view?: string | null): RecruitingWorkspaceView {
  if (view === "screening" || view === "outreach" || view === "schedule" || view === "report") return view;
  return "create";
}

interface RoleBriefWorkspaceProps {
  roleId: string;
  initialWorkspace?: WorkspaceSnapshot | null;
  initialView?: RecruitingWorkspaceView;
}

function ModulePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <section className="nw-task-card nw-overview-panel">
      <p className="nw-eyebrow">{title}</p>
      <h2>{title}模块</h2>
      <p>{description}</p>
    </section>
  );
}

export function RoleBriefWorkspace({ roleId, initialWorkspace, initialView = "create" }: RoleBriefWorkspaceProps) {
  const {
    role,
    question,
    agentSummary,
    recruitingWorkflow,
    isLoading,
    isSubmitting,
    error,
    answer,
    skip,
    previous,
    revisit,
    reopen,
    confirm,
  } = useRoleBrief(roleId, initialWorkspace);
  const searchParams = useSearchParams();
  const urlView = resolveWorkspaceView(searchParams.get("view") ?? initialView);
  const screeningMode = searchParams.get("mode") ?? "all";
  const candidateId = searchParams.get("candidate");
  const [calibrationFeedback, setCalibrationFeedback] = useState<ReviewResult[]>([]);
  const reviewComplete = calibrationFeedback.length >= 3;
  const activeView = reviewComplete && urlView === "screening" && screeningMode === "review"
    ? "create"
    : urlView;

  async function handleConfirm() {
    if (role?.lifecycleState === "confirmed") return;
    await confirm();
  }

  if (isLoading) return <main className="rolebrief-loading">正在加载职位工作台…</main>;
  if (!role) return <main className="rolebrief-loading"><h1>未找到这个本地职位</h1><p>{error || "该链接没有对应的职位草稿。"}</p><a href="/hire">返回新建职位</a></main>;

  const activeRole = role;
  const currentStep = activeRole.lifecycleState === "brief_ready" ? 3 : activeRole.lifecycleState === "confirmed" ? workflowDisplayStep(recruitingWorkflow) : 2;

  function renderContent() {
    if (activeView === "screening") {
      if (screeningMode === "review") {
        return <CandidateReviewStage candidateId={candidateId} onFeedbackChange={setCalibrationFeedback} roleId={roleId} />;
      }
      return <CandidateScreeningShowcase />;
    }
    if (activeView === "outreach") {
      return <ModulePlaceholder title="候选人触达" description="该模块用于后续候选人沟通与触达，当前为导航占位。" />;
    }
    if (activeView === "schedule") {
      return <ModulePlaceholder title="面试日程" description="该模块用于安排面试时间，当前为导航占位。" />;
    }
    if (activeView === "report") {
      return <ModulePlaceholder title="面试报告" description="该模块用于查看 AI 面试报告，当前为导航占位。" />;
    }
    if (activeRole.lifecycleState === "confirmed" && activeView !== "create") {
      return <RoleBriefOverview role={activeRole} onReopen={reopen} />;
    }
    return (
      <AgentConversation
        roleId={roleId}
        isSubmitting={isSubmitting}
        role={activeRole}
        question={question}
        agentSummary={agentSummary}
        calibrationFeedback={calibrationFeedback}
        onAnswer={answer}
        onSkip={skip}
        onPrevious={previous}
        onRevisit={revisit}
        onConfirm={() => void handleConfirm()}
      />
    );
  }

  return (
    <RecruitingAppShell
      activeView={activeView}
      currentStep={currentStep}
      layoutMode={activeView === "screening" ? (screeningMode === "review" ? "review" : "screening") : "default"}
      role={activeRole}
    >
      {error ? <p className="rh-inline-error" role="alert">{error}</p> : null}
      {renderContent()}
    </RecruitingAppShell>
  );
}
