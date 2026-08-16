import { RoleWorkspaceService, WorkspaceNotFoundError } from "@/features/recruiting-agent/application/role-workspace-service";
import { MockCandidateDataSource } from "@/features/recruiting-workflow/providers/mock-candidate-data-source";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ roleId: string }> }) {
  try {
    const { roleId } = await context.params;
    const workspace = new RoleWorkspaceService().get(roleId);
    if (workspace.role.lifecycleState !== "confirmed") {
      return Response.json({ code: "ROLE_NOT_CONFIRMED", message: "请先确认职位条件，再检索候选人。" }, { status: 409 });
    }
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor") ?? undefined;
    const requestedPageSize = Number.parseInt(url.searchParams.get("pageSize") ?? "24", 10);
    const pageSize = Number.isInteger(requestedPageSize) ? requestedPageSize : 24;
    const page = await new MockCandidateDataSource().search(workspace.role, cursor, pageSize);
    return Response.json(page);
  } catch (error) {
    const status = error instanceof WorkspaceNotFoundError ? 404 : 500;
    return Response.json({ code: "CANDIDATE_SEARCH_FAILED", message: error instanceof Error ? error.message : "无法检索候选人。" }, { status });
  }
}
