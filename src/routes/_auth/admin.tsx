import { useState } from "react";
import SectionBody from "@/components/SectionBody";
import SectionHeader from "@/components/SectionHeader";
import SectionItem from "@/components/SectionItem";
import { useTranslation } from "@/hooks/useTranslation";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Phone } from "lucide-react";
import {
  useIsPlatformAdmin,
  useAdminPartnerRequests,
  useResolvePartnerRequest,
  useAdminWhatsAppOverview,
} from "@/queries/useAdmin";

export const Route = createFileRoute("/_auth/admin")({
  component: AdminIndex,
});

function AdminIndex() {
  const { translate: t } = useTranslation();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsPlatformAdmin();
  const { data: requests } = useAdminPartnerRequests();
  const { data: overview } = useAdminWhatsAppOverview();
  const resolve = useResolvePartnerRequest();
  const [solutionIdInput, setSolutionIdInput] = useState<Record<string, string>>(
    {},
  );

  if (checkingAdmin) return null;
  if (!isAdmin) {
    return (
      <div className="p-[20px] text-muted-foreground">
        {t("No tienes permisos de administrador.")}
      </div>
    );
  }

  const pending = requests?.filter((r) => r.status === "pending") ?? [];
  const approved = requests?.filter((r) => r.status === "approved") ?? [];

  return (
    <>
      <SectionHeader title={t("Panel de administración")} />

      <SectionBody className="gap-4">
        <div className="text-[16px] font-semibold text-foreground">
          {t("Solicitudes de partners")}
        </div>

        {pending.length === 0 && (
          <div className="text-muted-foreground">
            {t("No hay solicitudes pendientes.")}
          </div>
        )}

        {pending.map((req) => (
          <div
            key={req.id}
            className="flex flex-col gap-[8px] rounded-xl border border-border p-[12px]"
          >
            <div className="flex justify-between items-center pb-[4px]">
              <span className="text-foreground font-medium uppercase tracking-wider">
                {req.organizations?.name || "Unknown"}
              </span>
              <span className="text-muted-foreground text-[12px]">
                {req.created_at}
              </span>
            </div>
            <div className="flex justify-between items-center pb-[8px]">
              <span className="text-foreground text-[14px]">
                {t("App ID")}: {req.app_id}
              </span>
            </div>
            <div className="flex gap-[8px]">
              <input
                className="flex-1 px-[12px] py-[8px] rounded-lg border border-border bg-background text-foreground"
                placeholder={t("Solution ID")}
                value={solutionIdInput[req.id] ?? ""}
                onChange={(e) =>
                  setSolutionIdInput((s) => ({
                    ...s,
                    [req.id]: e.target.value,
                  }))
                }
              />
              <button
                className="px-[12px] py-[8px] rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
                disabled={resolve.isPending || !solutionIdInput[req.id]?.trim()}
                onClick={() =>
                  resolve.mutate({
                    id: req.id,
                    status: "approved",
                    solution_id: solutionIdInput[req.id],
                  })
                }
              >
                {t("Aprobar")}
              </button>
              <button
                className="px-[12px] py-[8px] rounded-lg bg-destructive text-destructive-foreground disabled:opacity-50"
                disabled={resolve.isPending}
                onClick={() =>
                  resolve.mutate({ id: req.id, status: "rejected" })
                }
              >
                {t("Rechazar")}
              </button>
            </div>
          </div>
        ))}
      </SectionBody>

      <SectionBody className="gap-4">
        <div className="text-[16px] font-semibold text-foreground">
          {t("Partners aprobados")}
        </div>

        {approved.length === 0 && (
          <div className="text-muted-foreground">
            {t("No hay partners aprobados.")}
          </div>
        )}

        {approved.map((req) => (
          <SectionItem
            key={req.id}
            title={req.organizations?.name || "Unknown"}
            description={
              t("App ID") +
              ": " +
              req.app_id +
              " · " +
              t("Solution ID") +
              ": " +
              (req.solution_id ?? "—")
            }
            aside={
              <div className="p-[8px]">
                <ShieldCheck className="w-[24px] h-[24px] text-muted-foreground" />
              </div>
            }
          />
        ))}
      </SectionBody>

      <SectionBody className="gap-4">
        <div className="flex items-center gap-[8px] text-[16px] font-semibold text-foreground">
          <ShieldCheck className="w-[18px] h-[18px]" />
          {t("Cuentas WhatsApp")}
        </div>

        {overview?.length === 0 && (
          <div className="text-muted-foreground">
            {t("No hay cuentas WhatsApp conectadas.")}
          </div>
        )}

        {overview?.map((acc) => (
          <SectionItem
            key={acc.phone_number_id ?? acc.organization_id}
            title={acc.organization_name}
            description={
              (acc.partner_name ? acc.partner_name + " · " : "") +
              (acc.status ?? "") +
              (acc.waba_id ? " · WABA " + acc.waba_id : "")
            }
            aside={
              <div className="p-[8px]">
                <Phone className="w-[24px] h-[24px] text-muted-foreground" />
              </div>
            }
          />
        ))}
      </SectionBody>
    </>
  );
}
