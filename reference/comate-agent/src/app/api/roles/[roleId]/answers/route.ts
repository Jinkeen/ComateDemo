import { z } from "zod";
import { InvalidWorkspaceActionError, RoleWorkspaceService, WorkspaceNotFoundError } from "@/features/recruiting-agent/application/role-workspace-service";
import { RoleVersionConflictError } from "@/features/recruiting-agent/data/sqlite-role-repository";

export const runtime = "nodejs";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("answer"), expectedVersion: z.number().int().positive(), questionId: z.string().min(1), value: z.string().max(1000), source: z.enum(["option", "custom"]).optional() }),
  z.object({ action: z.literal("skip"), expectedVersion: z.number().int().positive() }),
  z.object({ action: z.literal("previous"), expectedVersion: z.number().int().positive() }),
  z.object({ action: z.literal("revisit"), expectedVersion: z.number().int().positive(), questionId: z.string().min(1) }),
  z.object({ action: z.literal("reopen"), expectedVersion: z.number().int().positive() }),
  z.object({ action: z.literal("confirm"), expectedVersion: z.number().int().positive() }),
]);

export async function POST(request: Request, context: { params: Promise<{ roleId: string }> }) {
  try {
    const { roleId } = await context.params;
    const action = actionSchema.parse(await request.json());
    const service = new RoleWorkspaceService();
    let workspace;
    if (action.action === "answer") {
      workspace = await service.answer({
        roleId,
        expectedVersion: action.expectedVersion,
        questionId: action.questionId as import("@/features/role-brief/domain/types").QuestionId,
        value: action.value,
        source: action.source,
      });
    } else if (action.action === "skip") {
      workspace = await service.skip(roleId, action.expectedVersion);
    } else if (action.action === "previous") {
      workspace = await service.previous(roleId, action.expectedVersion);
    } else if (action.action === "revisit") {
      workspace = await service.revisit(
        roleId,
        action.expectedVersion,
        action.questionId as import("@/features/role-brief/domain/types").QuestionId,
      );
    } else if (action.action === "reopen") {
      workspace = await service.reopen(roleId, action.expectedVersion);
    } else {
      workspace = await service.confirm(roleId, action.expectedVersion);
    }
    return Response.json(workspace);
  } catch (error) {
    const status = error instanceof RoleVersionConflictError ? 409 : error instanceof WorkspaceNotFoundError ? 404 : error instanceof InvalidWorkspaceActionError || error instanceof z.ZodError ? 400 : 500;
    return Response.json({ code: status === 409 ? "ROLE_VERSION_CONFLICT" : "ROLE_ACTION_FAILED", message: error instanceof Error ? error.message : "暂时无法保存回答。" }, { status });
  }
}
