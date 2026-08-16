import type { ReactNode } from "react";
import { ClarificationComposer } from "@/features/role-brief/components/ClarificationComposer";
import { RoleSidebar } from "@/features/role-brief/components/RoleSidebar";
import type { RoleBrief } from "@/features/role-brief/domain/types";
import type { RecruitingWorkspaceView } from "@/features/role-brief/components/RoleSidebar";
import { RecruitingContextRail } from "./RecruitingContextRail";
import { ComateGlobalHeader, type ComateNavigationKey } from "@/components/comate/ComateGlobalHeader";

interface RecruitingAppShellProps {
  role: RoleBrief;
  currentStep: number;
  activeView?: RecruitingWorkspaceView;
  layoutMode?: "default" | "screening" | "review";
  children: ReactNode;
}

export function RecruitingAppShell({
  role,
  currentStep,
  activeView = "create",
  layoutMode = "default",
  children,
}: RecruitingAppShellProps) {
  const activeNavigation: ComateNavigationKey = activeView;
  const shellClass = layoutMode === "screening"
    ? "screening-focus-shell"
    : layoutMode === "review"
      ? "candidate-review-shell"
      : "";

  return (
    <main className="comate-home-stage">
      <div className="comate-home-app">
        <ComateGlobalHeader active={activeNavigation} roleId={role.id} />
        <div className="comate-global-body">
          <div className={`nw-shell ${shellClass}`}>
            <RoleSidebar activeView={activeView} role={role} />
            <section className={`nw-main-column${activeView === "create" ? " has-clarification-composer" : ""}`}>
              <div className="nw-stage-scroll">
                <div className="nw-stage">
                  <header className="nw-topbar">
                    <div>
                      <span>招聘任务</span>
                      <b>/</b>
                      <h1>{role.title}</h1>
                    </div>
                    <small>本地职位工作台</small>
                  </header>
                  {children}
                </div>
              </div>
              {activeView === "create" ? <ClarificationComposer disabled={role.lifecycleState === "confirmed"} /> : null}
            </section>
            <RecruitingContextRail role={role} currentStep={currentStep} />
          </div>
        </div>
      </div>
    </main>
  );
}
