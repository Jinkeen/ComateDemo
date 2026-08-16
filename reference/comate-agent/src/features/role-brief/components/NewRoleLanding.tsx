import {
  ArrowUp,
  CheckCircle2,
  FileText,
  Link2,
  Plus,
  Upload,
} from "lucide-react";
import { ComateGlobalHeader } from "@/components/comate/ComateGlobalHeader";
import { ConversationHistorySidebar } from "@/components/comate/ConversationHistorySidebar";

export function NewRoleLanding() {
  return (
    <main className="comate-home-stage">
      <div className="comate-home-app">
        <ComateGlobalHeader active="create" />

        <div className="comate-home-layout">
          <ConversationHistorySidebar />

          <section className="comate-create-panel">
            <p className="comate-save-status"><span>草稿已自动保存</span><CheckCircle2 size={15} /></p>

            <div className="comate-create-content">
              <span aria-hidden="true" className="comate-agent-orb" />
              <h1>你好，准备开始招聘了吗？</h1>
              <p>描述要招的人，Agent 会通过简短对话逐步收缩岗位要求。</p>

              <form className="comate-role-composer" action="/api/roles" method="post">
                <label htmlFor="role-description">职位描述</label>
                <textarea
                  id="role-description"
                  minLength={16}
                  name="description"
                  placeholder="粘贴职位描述，或用自己的话告诉 Agent 你要招什么人……"
                  required
                />
                <div className="comate-composer-toolbar">
                  <button className="comate-add-material" type="button" aria-label="添加招聘资料"><Plus size={22} /></button>
                  <div className="comate-material-actions" aria-label="辅助资料入口">
                    <button type="button"><Upload size={16} />上传职位详情文件</button>
                    <button type="button"><FileText size={16} />上传相似岗位资料</button>
                    <button type="button"><Link2 size={16} />LinkedIn 链接</button>
                    <button type="button"><Link2 size={16} />职位链接</button>
                  </div>
                  <button className="comate-submit-role" type="submit" aria-label="开始职位澄清"><ArrowUp size={19} /></button>
                </div>
              </form>
              <p className="comate-input-note">支持 PDF、Word 或职位链接 · Agent 将先确认关键招聘条件</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
