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
      title="模型目录"
      subtitle="维护模型可用状态、provider model id、预算上限和默认 system prompt。成员发送前看到的模型切换列表来自这里。"
    >
      <AdminPanel.Section title="模型列表" eyebrow="Model Registry">
        <ModelConfigBoard models={models} />
      </AdminPanel.Section>
    </AdminWorkspaceShell>
  );
}
