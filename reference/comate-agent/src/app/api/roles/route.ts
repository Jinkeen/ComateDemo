import { z } from "zod";
import { NextResponse } from "next/server";
import { InvalidWorkspaceActionError, RoleWorkspaceService } from "@/features/recruiting-agent/application/role-workspace-service";

export const runtime = "nodejs";

const createRoleSchema = z.object({ description: z.string().trim().min(16).max(5000) });

export async function POST(request: Request) {
  const isFormSubmission = request.headers.get("content-type")?.includes("application/x-www-form-urlencoded") ?? false;
  try {
    const input = isFormSubmission
      ? Object.fromEntries((await request.formData()).entries())
      : await request.json();
    const body = createRoleSchema.parse(input);
    const workspace = await new RoleWorkspaceService().create(body.description);
    if (isFormSubmission) {
      return NextResponse.redirect(new URL(`/hire/role/${workspace.role.id}`, request.url), 303);
    }
    return Response.json(workspace, { status: 201 });
  } catch (error) {
    const message = error instanceof InvalidWorkspaceActionError || error instanceof z.ZodError ? "请输入至少 16 个字符的职位描述。" : "暂时无法创建职位工作台。";
    if (isFormSubmission) {
      return NextResponse.redirect(new URL("/hire", request.url), 303);
    }
    return Response.json({ code: "ROLE_CREATE_FAILED", message }, { status: 400 });
  }
}
