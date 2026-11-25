import { AppShell } from '@/shared/components/AppShell';
import { EmptyState } from '@/shared/components/ui';
export function PlaceholderScreen({ title, milestone }: { title: string; milestone: string }) {
  return (
    <AppShell>
      <EmptyState
        title={title}
        message={`Khung điều hướng đã sẵn sàng. Chức năng thật được lên kế hoạch ở ${milestone}; hiện chưa báo thành công giả.`}
      />
    </AppShell>
  );
}
