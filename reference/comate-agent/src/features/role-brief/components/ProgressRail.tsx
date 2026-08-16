import { Check } from "lucide-react";
import type { ProgressItem } from "../domain/presentation";

export function ProgressRail({ items }: { items: ProgressItem[] }) {
  return (
    <section className="rh-progress nw-float-card" aria-label="招聘进展">
      <h2>招聘进展</h2>
      <ol aria-label="招聘流程">
        {items.map((item, index) => (
          <li className={"is-" + item.status} key={item.id}>
            <span aria-hidden="true">
              {item.status === "complete" ? <Check size={11} strokeWidth={2.6} /> : item.status === "upcoming" ? index + 1 : null}
            </span>
            {item.label}
          </li>
        ))}
      </ol>
    </section>
  );
}
