import { z } from "zod";
import { RoleWorkspaceService } from "@/features/recruiting-agent/application/role-workspace-service";
import {
  RecruitingWorkflowNotFoundError,
  RecruitingWorkflowService,
} from "@/features/recruiting-workflow/application/recruiting-workflow-service";
import { WorkflowVersionConflictError } from "@/features/recruiting-workflow/data/sqlite-recruiting-workflow-repository";

export const runtime = "nodejs";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("calibrate"),
    expectedVersion: z.number().int().positive(),
    candidateId: z.string().min(1),
    verdict: z.enum(["good_fit", "maybe", "not_a_fit"]),
    evidence: z.string().trim().min(1).max(500),
  }),
  z.object({
    action: z.literal("choose_mode"),
    expectedVersion: z.number().int().positive(),
    mode: z.enum(["manual", "automatic"]),
  }),
  z.object({
    action: z.literal("run_search"),
    expectedVersion: z.number().int().positive(),
  }),
  z.object({
    action: z.literal("approve"),
    expectedVersion: z.number().int().positive(),
    candidateIds: z.array(z.string().min(1)).min(1),
  }),
]);

export async function GET(
  _request: Request,
  context: { params: Promise<{ roleId: string }> },
) {
  const { roleId } = await context.params;
  const service = new RecruitingWorkflowService();
  const existing = service.get(roleId);
  if (existing) return Response.json(existing);
  try {
    const workspace = new RoleWorkspaceService().get(roleId);
    if (workspace.role.lifecycleState !== "confirmed") {
      return Response.json({ code: "ROLE_NOT_CONFIRMED", message: "请先确认职位条件。" }, { status: 409 });
    }
    return Response.json(await service.initialize(workspace.role));
  } catch (error) {
    return Response.json({ code: "WORKFLOW_NOT_FOUND", message: error instanceof Error ? error.message : "未找到招聘流程。" }, { status: 404 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ roleId: string }> },
) {
  try {
    const { roleId } = await context.params;
    const action = actionSchema.parse(await request.json());
    const service = new RecruitingWorkflowService();
    const result =
      action.action === "calibrate"
        ? service.calibrate(roleId, action.expectedVersion, action)
        : action.action === "choose_mode"
          ? service.chooseMode(roleId, action.expectedVersion, action.mode)
          : action.action === "run_search"
            ? await service.runSearch(
                new RoleWorkspaceService().get(roleId).role,
                action.expectedVersion,
              )
            : service.approve(roleId, action.expectedVersion, action.candidateIds);

    return Response.json(result);
  } catch (error) {
    const status =
      error instanceof WorkflowVersionConflictError
        ? 409
        : error instanceof RecruitingWorkflowNotFoundError
          ? 404
          : error instanceof z.ZodError
            ? 400
            : error instanceof Error
              ? 422
              : 500;
    return Response.json(
      {
        code:
          status === 409
            ? "WORKFLOW_VERSION_CONFLICT"
            : status === 404
              ? "WORKFLOW_NOT_FOUND"
              : "WORKFLOW_ACTION_FAILED",
        message: error instanceof Error ? error.message : "招聘流程操作失败。",
      },
      { status },
    );
  }
}
