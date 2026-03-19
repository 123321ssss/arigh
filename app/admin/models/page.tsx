import { AdminWorkspaceShell } from "@/components/app-shell";
import { AdminPanel } from "@/components/admin/admin-panel";
import { ModelConfigBoard } from "@/components/admin/model-config-board";
import { requireAdmin } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";

export default async function AdminModelsPage() {
  const admin = await requireAdmin();
  const models = await appRepository.listModels();

  return (
    <AdminWorkspaceShell
      user={admin}
      currentPath="/admin/models"
      title="模型配置"
      subtitle="维护模型可用状态、预算上限与默认 system prompt；原始 provider key 不在后台展示。"
    >
      <AdminPanel.Section title="模型清单" eyebrow="Model Registry">
        <ModelConfigBoard models={models} />
      </AdminPanel.Section>
    </AdminWorkspaceShell>
  );
}
