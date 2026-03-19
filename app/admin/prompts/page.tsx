import { AdminWorkspaceShell } from "@/components/app-shell";
import { AdminPanel } from "@/components/admin/admin-panel";
import { PromptLibrary } from "@/components/admin/prompt-library";
import { requireAdmin } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";

export default async function AdminPromptsPage() {
  const admin = await requireAdmin();
  const prompts = await appRepository.listPromptTemplates();

  return (
    <AdminWorkspaceShell
      user={admin}
      currentPath="/admin/prompts"
      title="提示词模板"
      subtitle="把高频任务沉淀为管理员可维护的模板，成员在会话中可直接引用。"
    >
      <AdminPanel.Section title="模板库" eyebrow="Prompt Library">
        <PromptLibrary prompts={prompts} />
      </AdminPanel.Section>
    </AdminWorkspaceShell>
  );
}
