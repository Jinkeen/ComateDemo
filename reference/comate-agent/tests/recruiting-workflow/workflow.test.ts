import { describe, expect, it } from "vitest";
import {
  approveCandidates,
  chooseExecutionMode,
  createRecruitingWorkflow,
  recordCalibrationVerdict,
  startSourcing,
} from "@/features/recruiting-workflow/domain/workflow";

describe("招聘流程状态机", () => {
  it("职位简报确认后从三位样本校准开始", () => {
    const state = createRecruitingWorkflow("role-1", ["a", "b", "c"]);

    expect(state.stage).toBe("calibration_samples");
    expect(state.calibration.activeIndex).toBe(0);
  });

  it("完成三位样本判断后才能选择执行模式", () => {
    let state = createRecruitingWorkflow("role-1", ["a", "b", "c"]);
    state = recordCalibrationVerdict(state, {
      candidateId: "a",
      verdict: "good_fit",
      evidence: "有 0-1 AI 产品经验",
    });
    state = recordCalibrationVerdict(state, {
      candidateId: "b",
      verdict: "maybe",
      evidence: "模型评测经验不明确",
    });
    state = recordCalibrationVerdict(state, {
      candidateId: "c",
      verdict: "not_a_fit",
      evidence: "没有已上线产品",
    });

    expect(state.stage).toBe("execution_mode");
    expect(state.criteriaVersion).toBe(4);
  });

  it("完整搜索结束且至少选择一位候选人后才能审批", () => {
    let state = createRecruitingWorkflow("role-1", ["a", "b", "c"]);
    state = recordCalibrationVerdict(state, { candidateId: "a", verdict: "good_fit", evidence: "符合" });
    state = recordCalibrationVerdict(state, { candidateId: "b", verdict: "maybe", evidence: "待确认" });
    state = recordCalibrationVerdict(state, { candidateId: "c", verdict: "not_a_fit", evidence: "不符合" });
    state = chooseExecutionMode(state, "manual");
    state = startSourcing(state, {
      screen: 100,
      match: 2,
      candidateIds: ["x", "y"],
    });

    expect(() => approveCandidates(state, [])).toThrow("请至少选择一位候选人");
    expect(approveCandidates(state, ["x"]).stage).toBe("completed");
  });

  it("拒绝评价非当前样本和审批队列之外的人", () => {
    const calibration = createRecruitingWorkflow("role-1", ["a", "b", "c"]);
    expect(() => recordCalibrationVerdict(calibration, {
      candidateId: "b",
      verdict: "good_fit",
      evidence: "越过当前样本",
    })).toThrow("只能评价当前样本");

    let approval = createRecruitingWorkflow("role-1", ["a", "b", "c"]);
    approval = recordCalibrationVerdict(approval, { candidateId: "a", verdict: "good_fit", evidence: "符合" });
    approval = recordCalibrationVerdict(approval, { candidateId: "b", verdict: "maybe", evidence: "待确认" });
    approval = recordCalibrationVerdict(approval, { candidateId: "c", verdict: "not_a_fit", evidence: "不符合" });
    approval = chooseExecutionMode(approval, "manual");
    approval = startSourcing(approval, { screen: 1, match: 1, candidateIds: ["x"] });
    expect(() => approveCandidates(approval, ["outside"])).toThrow("不在审批队列");
  });
});
