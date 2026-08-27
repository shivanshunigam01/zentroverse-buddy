import { SyncAllLeadsDialog } from "@/components/modules/autodialer/SyncAllLeadsDialog";
import { refreshFromApi } from "@/services/sync.service";

/**
 * Admin "Sync All Leads" — uses dialer bulk sync (field_5 = opportunity_id).
 * Replaces the legacy customer-only admin sync that skipped Opportunity smartflo_* fields.
 */
export function SmartfloSyncButton({ onComplete }: { onComplete?: () => void } = {}) {
  return (
    <SyncAllLeadsDialog
      onComplete={() => {
        void refreshFromApi().catch(() => undefined);
        onComplete?.();
      }}
    />
  );
}
