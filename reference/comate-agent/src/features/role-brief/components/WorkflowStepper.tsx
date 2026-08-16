import type { RoleLifecycleState } from "../domain/types";

const steps = ["需求输入", "Agent 澄清", "搜索条件", "确认"];

function stepIndex(state: RoleLifecycleState): number {
  if (state === "draft") return 0;
  if (state === "brief_ready") return 2;
  if (state === "confirmed") return 3;
  return 1;
}

export function WorkflowStepper({ state }: { state: RoleLifecycleState }) {
  const current = stepIndex(state);

  return (
    <ol className="rolebrief-stepper" aria-label="职位创建进度">
      {steps.map((step, index) => (
        <li key={step} className={index <= current ? "is-active" : ""}>
          <span>{index < current ? "✓" : index + 1}</span>{step}
        </li>
      ))}
    </ol>
  );
}
