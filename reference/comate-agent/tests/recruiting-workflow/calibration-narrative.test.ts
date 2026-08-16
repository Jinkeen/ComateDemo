import { describe, expect, it } from "vitest";
import {
  buildRecalibrationSummary,
  buildRecalibrationTransition,
  extractCalibrationPreferences,
  recalibrationFollowUp,
} from "@/features/recruiting-workflow/domain/calibration-narrative";

describe("样本判断原因摘要", () => {
  it("从自定义判断原因中提取筛选偏好，并忽略默认提示", () => {
    expect(
      extractCalibrationPreferences([
        { verdict: "good_fit", evidence: "更看重 B 端产品经验" },
        { verdict: "maybe", evidence: "部分条件需要进一步核实" },
        { verdict: "not_a_fit", evidence: "工程背景偏重，产品判断不够" },
      ]),
    ).toEqual(["更看重「B 端产品经验」", "降低「工程背景偏重，产品判断不够」"]);
  });

  it("把提取结果收成思考过程，并说明将再次筛选", () => {
    expect(
      buildRecalibrationTransition([
        { verdict: "good_fit", evidence: "更看重 B 端产品经验" },
        { verdict: "not_a_fit", evidence: "不符合岗位关键要求" },
      ]),
    ).toBe(
      `已根据你补充的判断原因，提取出后续筛选偏好：更看重「B 端产品经验」。${recalibrationFollowUp}`,
    );
  });

  it("卡片摘要不包含再次筛选引导句", () => {
    expect(
      buildRecalibrationSummary([
        { verdict: "maybe", evidence: "工作经历不足，没有展示PRD撰写能力" },
        { verdict: "not_a_fit", evidence: "项目经验不够丰富" },
      ]),
    ).toBe(
      "已根据你补充的判断原因，提取出后续筛选偏好：需核实「工作经历不足，没有展示PRD撰写能力」，降低「项目经验不够丰富」。",
    );
  });

  it("没有自定义原因时仍说明将按更新条件再筛", () => {
    expect(
      buildRecalibrationTransition([
        { verdict: "good_fit", evidence: "符合当前候选人画像" },
        { verdict: "maybe", evidence: "部分条件需要进一步核实" },
        { verdict: "not_a_fit", evidence: "不符合岗位关键要求" },
      ]),
    ).toBe(`已根据三位样本的适配判断更新筛选权重。${recalibrationFollowUp}`);
  });
});
