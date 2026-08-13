import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/supabase/client";
import type { PartnerRequest } from "./usePartnerRequests";

export type AdminWhatsAppOverview = {
  organization_id: string;
  organization_name: string;
  waba_id: string | null;
  phone_number_id: string | null;
  status: string | null;
  partner_name: string | null;
  created_at: string;
};

export function useIsPlatformAdmin() {
  return useQuery({
    queryKey: ["is-platform-admin"],
    queryFn: async () => {
      const { data } = await supabase
        .rpc("is_platform_admin")
        .throwOnError();
      return data as boolean;
    },
  });
}

// Admin: all partner requests across orgs (pending + issued)
export function useAdminPartnerRequests() {
  return useQuery({
    queryKey: ["admin-partner-requests"],
    queryFn: async () => {
      const { data } = await supabase
        .from("partner_requests")
        .select()
        .order("created_at", { ascending: false })
        .throwOnError();
      return (data ?? []) as PartnerRequest[];
    },
  });
}

// Admin: issue a solution ID to a request (approve) or reject it
export function useResolvePartnerRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      solution_id,
    }: {
      id: string;
      status: "approved" | "rejected";
      solution_id?: string;
    }) => {
      await supabase
        .from("partner_requests")
        .update({ status, solution_id: solution_id ?? null })
        .eq("id", id)
        .throwOnError();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partner-requests"] });
    },
  });
}

// Admin: cross-org WhatsApp account overview
export function useAdminWhatsAppOverview() {
  return useQuery({
    queryKey: ["admin-whatsapp-overview"],
    queryFn: async () => {
      const { data } = await supabase
        .rpc("admin_whatsapp_overview")
        .throwOnError();
      return (data ?? []) as AdminWhatsAppOverview[];
    },
  });
}
