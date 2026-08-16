"use client";

import { useCallback, useEffect, useState } from "react";
import type { WorkspaceSnapshot } from "@/features/recruiting-agent/application/role-workspace-service";
import type { AnswerSource, QuestionId } from "../domain/types";

async function readResponse(response: Response): Promise<WorkspaceSnapshot> {
  const payload = await response.json() as WorkspaceSnapshot | { message?: string };
  if (!response.ok) {
    throw new Error("message" in payload ? payload.message || "暂时无法保存。" : "暂时无法保存。");
  }
  return payload as WorkspaceSnapshot;
}

export function useRoleBrief(roleId: string, initialWorkspace: WorkspaceSnapshot | null | undefined = undefined) {
  const [workspace, setWorkspace] = useState<WorkspaceSnapshot | null>(initialWorkspace ?? null);
  const [isLoading, setIsLoading] = useState(initialWorkspace === undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const snapshot = await readResponse(await fetch(`/api/roles/${roleId}`, { cache: "no-store" }));
      setWorkspace(snapshot);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "无法加载职位工作台。");
    } finally {
      setIsLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    // The page supplies an SSR snapshot when available. Avoid replacing it on
    // hydration, but preserve the API fallback for direct client navigation.
    if (initialWorkspace !== undefined) return;
    void load();
  }, [initialWorkspace, load]);

  const submit = useCallback(async (body: Record<string, unknown>) => {
    if (!workspace || isSubmitting) return false;
    setIsSubmitting(true);
    try {
      const snapshot = await readResponse(await fetch(`/api/roles/${roleId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, expectedVersion: workspace.version }),
      }));
      setWorkspace(snapshot);
      setError(null);
      return true;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "暂时无法保存回答。";
      setError(message);
      if (message.includes("刷新")) void load();
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, load, roleId, workspace]);

  const answer = useCallback((questionId: QuestionId, value: string, source: AnswerSource = "option") => void submit({ action: "answer", questionId, value, source }), [submit]);
  const skip = useCallback(() => void submit({ action: "skip" }), [submit]);
  const previous = useCallback(() => void submit({ action: "previous" }), [submit]);
  const revisit = useCallback((questionId: QuestionId) => void submit({ action: "revisit", questionId }), [submit]);
  const reopen = useCallback(() => void submit({ action: "reopen" }), [submit]);
  const confirm = useCallback(() => submit({ action: "confirm" }), [submit]);

  return {
    role: workspace?.role ?? null,
    question: workspace?.activeQuestion ?? null,
    agentSummary: workspace?.agentSummary ?? null,
    recruitingWorkflow: workspace?.recruitingWorkflow ?? null,
    isLoading,
    isSubmitting,
    error,
    answer,
    skip,
    previous,
    revisit,
    reopen,
    confirm,
  };
}
