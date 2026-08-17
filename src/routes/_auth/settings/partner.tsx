import { useState } from "react";
import SectionBody from "@/components/SectionBody";
import SectionHeader from "@/components/SectionHeader";
import SectionItem from "@/components/SectionItem";
import { useTranslation } from "@/hooks/useTranslation";
import { createFileRoute } from "@tanstack/react-router";
import { Handshake, TriangleAlert } from "lucide-react";
import {
  usePartnerRequests,
  useCreatePartnerRequest,
  useAppIdAlreadyApproved,
} from "@/queries/usePartnerRequests";

export const Route = createFileRoute("/_auth/settings/partner")({
  component: PartnerIndex,
});

function PartnerIndex() {
  const { translate: t } = useTranslation();
  const { data: requests, isLoading } = usePartnerRequests();
  const createRequest = useCreatePartnerRequest();
  const [appId, setAppId] = useState("");
  const { data: alreadyApproved } = useAppIdAlreadyApproved(appId);

  const latest = requests?.[0];
  const duplicateWarning = alreadyApproved && appId.trim().length > 0;

  const handleSubmit = () => {
    const trimmed = appId.trim();
    if (!trimmed || alreadyApproved) return;
    createRequest.mutate(trimmed, {
      onSuccess: () => setAppId(""),
    });
  };

  return (
    <>
      <SectionHeader title={t("Convertirse en partner")} />

      <SectionBody className="gap-4">
        {!latest || latest.status === "rejected" ? (
          <>
            <div className="text-muted-foreground text-[14px]">
              {t(
                "Envía tu ID de aplicación de Meta para solicitar convertirte en partner. Una vez aprobado, recibirás tu Solution ID.",
              )}
            </div>
            <div className="flex gap-[8px]">
              <input
                className="flex-1 px-[12px] py-[10px] rounded-xl border border-border bg-background text-foreground"
                placeholder="Meta App ID (ej. 123456789)"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
              />
              <button
                className="px-[16px] py-[10px] rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
                disabled={!appId.trim() || alreadyApproved || createRequest.isPending}
                onClick={handleSubmit}
              >
                {t("Enviar")}
              </button>
            </div>
            {duplicateWarning && (
              <div className="flex items-center gap-[8px] text-destructive text-[14px]">
                <TriangleAlert className="w-[16px] h-[16px]" />
                {t(
                  "Este App ID ya tiene una solicitud aprobada. El solution ID ya fue emitido para este App ID.",
                )}
              </div>
            )}
          </>
        ) : (
          <SectionItem
            title={t("Solicitud de partner")}
            description={
              latest.status === "pending"
                ? t("Pendiente de revisión. Recibirás tu Solution ID aquí.")
                : latest.status === "approved"
                  ? t("Aprobado · Solution ID: ") + (latest.solution_id ?? "—")
                  : t("Rechazada")
            }
            aside={
              <div className="p-[8px]">
                <Handshake className="w-[24px] h-[24px] text-muted-foreground" />
              </div>
            }
          />
        )}

        {isLoading && <div className="text-muted-foreground">...</div>}
      </SectionBody>
    </>
  );
}
