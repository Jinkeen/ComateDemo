import { Suspense } from "react";
import { RoleBriefWorkspace } from "@/features/role-brief/components/RoleBriefWorkspace";
import { RoleWorkspaceService, WorkspaceNotFoundError } from "@/features/recruiting-agent/application/role-workspace-service";
import type { RecruitingWorkspaceView } from "@/features/role-brief/components/RoleSidebar";

interface RolePageProps {
  params: Promise<{ roleId: string }>;
  searchParams: Promise<{ view?: string }>;
}

function resolveView(view?: string): RecruitingWorkspaceView {
  if (view === "screening" || view === "outreach" || view === "schedule" || view === "report") return view;
  return "create";
}

export default async function RolePage({ params, searchParams }: RolePageProps) {
  const { roleId } = await params;
  const { view } = await searchParams;
  const initialView = resolveView(view);
  let initialWorkspace = null;

  try {
    initialWorkspace = new RoleWorkspaceService().get(roleId);
  } catch (error) {
    if (!(error instanceof WorkspaceNotFoundError)) throw error;
  }

  return (
    <Suspense fallback={<main className="rolebrief-loading">正在加载职位工作台…</main>}>
      <RoleBriefWorkspace initialView={initialView} roleId={roleId} initialWorkspace={initialWorkspace} />
    </Suspense>
  );
}
