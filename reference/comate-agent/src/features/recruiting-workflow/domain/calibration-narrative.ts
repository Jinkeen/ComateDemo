import type { CalibrationFeedback, CalibrationVerdict } from "./types";

export type CalibrationNote = Pick<CalibrationFeedback, "verdict" | "evidence">;

export const defaultVerdictEvidence: Record<CalibrationVerdict, string> = {
  good_fit: "符合当前候选人画像",
  maybe: "部分条件需要进一步核实",
  not_a_fit: "不符合岗位关键要求",
};

export const recalibrationFollowUp = "接下来按更新后的条件再次筛选候选人。";

const preferenceLead: Record<CalibrationVerdict, string> = {
  good_fit: "更看重",
  maybe: "需核实",
  not_a_fit: "降低",
};

function meaningfulEvidence(value: string, verdict: CalibrationVerdict): string | undefined {
  const text = value.replace(/\s+/g, " ").trim();
  if (!text || text === defaultVerdictEvidence[verdict]) {
    return undefined;
  }

  const stop = text.search(/[。！？；]/);
  const clipped = stop > 6 && stop <= 36 ? text.slice(0, stop) : text;
  const stripped = clipped.replace(/^(更看重|看重|优先考虑|优先|需要|必须具备|不太看重|不看重|降低|排除)\s*/u, "");
  const phrase = stripped || clipped;

  return phrase.length > 36 ? `${phrase.slice(0, 36)}…` : phrase;
}

function uniquePhrases(values: string[]): string[] {
  const seen = new Set<string>();
  const phrases: string[] = [];

  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    phrases.push(value);
  }

  return phrases;
}

export function extractCalibrationPreferences(notes: CalibrationNote[]): string[] {
  const grouped: Record<CalibrationVerdict, string[]> = {
    good_fit: [],
    maybe: [],
    not_a_fit: [],
  };

  for (const note of notes) {
    const phrase = meaningfulEvidence(note.evidence, note.verdict);
    if (phrase) {
      grouped[note.verdict].push(phrase);
    }
  }

  return (["good_fit", "maybe", "not_a_fit"] as CalibrationVerdict[]).flatMap((verdict) => {
    const phrases = uniquePhrases(grouped[verdict]);
    return phrases.length ? [`${preferenceLead[verdict]}「${phrases.join("、")}」`] : [];
  });
}

export function buildRecalibrationSummary(notes: CalibrationNote[]): string {
  const preferences = extractCalibrationPreferences(notes);
  return preferences.length
    ? `已根据你补充的判断原因，提取出后续筛选偏好：${preferences.join("，")}。`
    : "已根据三位样本的适配判断更新筛选权重。";
}

export function buildRecalibrationTransition(notes: CalibrationNote[]): string {
  return `${buildRecalibrationSummary(notes)}${recalibrationFollowUp}`;
}
