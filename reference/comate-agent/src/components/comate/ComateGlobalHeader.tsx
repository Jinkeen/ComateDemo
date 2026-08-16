import {
  Bell,
  ChevronDown,
  CircleHelp,
  Grid2X2,
} from "lucide-react";
import Link from "next/link";

export type ComateNavigationKey = "create" | "screening" | "outreach" | "schedule" | "report";

interface ComateGlobalHeaderProps {
  active: ComateNavigationKey;
  roleId?: string;
}

export function ComateGlobalHeader({ active, roleId }: ComateGlobalHeaderProps) {
  const navigation = [
    { id: "create", label: "岗位创建", href: roleId ? `/hire/role/${roleId}?view=create` : "/hire" },
    { id: "screening", label: "简历筛选", href: roleId ? `/hire/role/${roleId}?view=screening` : undefined },
    { id: "outreach", label: "候选人触达", href: roleId ? `/hire/role/${roleId}?view=outreach` : undefined },
    { id: "schedule", label: "面试日程", href: roleId ? `/hire/role/${roleId}?view=schedule` : undefined },
    { id: "report", label: "面试报告", href: roleId ? `/hire/role/${roleId}?view=report` : undefined },
  ] as const;

  return (
    <header className="comate-home-header">
      <Link className="comate-home-brand" href="/hire" aria-label="Comate.AI 首页">
        <span>CA</span>
        <strong>Comate.AI</strong>
      </Link>

      <nav className="comate-top-nav" aria-label="主要功能">
        {navigation.map((item) => {
          const current = item.id === active;
          return item.href ? (
            <Link
              aria-current={current ? "page" : undefined}
              className={current ? "is-current" : ""}
              href={item.href}
              key={item.id}
            >
              {item.label}
            </Link>
          ) : (
            <button aria-disabled="true" className={current ? "is-current" : ""} disabled key={item.id} type="button">
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="comate-header-actions" aria-label="账户与服务">
        <a className="comate-demo-back" href="http://localhost:4173">返回 Demo 首页</a>
        <button aria-label="应用中心" type="button"><Grid2X2 size={19} /></button>
        <button className="comate-service-button" type="button">服务<ChevronDown size={15} /></button>
        <button aria-label="帮助中心" type="button"><CircleHelp size={19} /></button>
        <button className="comate-notification-button" aria-label="通知" type="button"><Bell size={19} /><i /></button>
        <button className="comate-account-button" aria-label="打开账户菜单" type="button">
          <span className="comate-account-avatar" aria-hidden="true">招</span>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
}
