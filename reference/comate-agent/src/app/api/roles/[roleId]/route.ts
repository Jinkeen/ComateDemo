import { WorkspaceNotFoundError, RoleWorkspaceService } from "@/features/recruiting-agent/application/role-workspace-service";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ roleId: string }> }) {
  try {
    const { roleId } = await context.params;
    return Response.json(new RoleWorkspaceService().get(roleId));
  } catch (error) {
    const status = error instanceof WorkspaceNotFoundError ? 404 : 500;
    return Response.json({ code: status === 404 ? "ROLE_NOT_FOUND" : "ROLE_LOAD_FAILED", message: error instanceof Error ? error.message : "无法加载职位工作台。" }, { status });
  }
}
