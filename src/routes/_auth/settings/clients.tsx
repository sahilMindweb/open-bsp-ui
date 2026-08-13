import SectionBody from "@/components/SectionBody";
import SectionHeader from "@/components/SectionHeader";
import SectionItem from "@/components/SectionItem";
import { useTranslation } from "@/hooks/useTranslation";
import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { usePartnerClients } from "@/queries/usePartnerClients";

export const Route = createFileRoute("/_auth/settings/clients")({
  component: ClientsIndex,
});

function ClientsIndex() {
  const { translate: t } = useTranslation();
  const { data: clients, isLoading } = usePartnerClients();

  return (
    <>
      <SectionHeader title={t("Clientes")} />

      <SectionBody className="gap-4">
        {isLoading && <div className="text-muted-foreground">...</div>}

        {!isLoading && clients && clients.length === 0 && (
          <div className="text-muted-foreground">
            {t("Aún no hay clientes vinculados.")}
          </div>
        )}

        {clients?.map((client) => (
          <SectionItem
            key={client.id}
            title={client.name}
            description={
              client.status === "connected"
                ? t("Conectado") + " · " + (client.phone_number_id ?? "")
                : client.status
                  ? client.status
                  : t("Sin WhatsApp conectado")
            }
            aside={
              <div className="p-[8px]">
                <Building2 className="w-[24px] h-[24px] text-muted-foreground" />
              </div>
            }
          />
        ))}
      </SectionBody>
    </>
  );
}
