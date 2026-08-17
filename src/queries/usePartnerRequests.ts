import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/supabase/client";
import useBoundStore from "@/stores/useBoundStore";

export type PartnerRequest = {
  id: string;
  organization_id: string;
  app_id: string;
  status: "pending" | "approved" | "rejected";
  solution_id: string | null;
  created_at: string;
  updated_at: string;
};

// Check whether a given App ID already has an approved partner request
// (across all orgs) — used to warn before submitting a duplicate.
export function useAppIdAlreadyApproved(appId: string) {
  const trimmed = appId.trim();

  return useQuery({
    queryKey: ["app-id-approved", trimmed],
    queryFn: async () => {
      if (!trimmed) return false;
      const { data } = await supabase
        .from("partner_requests")
        .select("id")
        .eq("app_id", trimmed)
        .eq("status", "approved")
        .maybeSingle()
        .throwOnError();
      return !!data;
    },
    enabled: trimmed.length > 0,
  });
}

// Partner-facing: the requests submitted by the active org
export function usePartnerRequests() {
  const orgId = useBoundStore((state) => state.ui.activeOrgId);

  return useQuery({
    queryKey: ["partner-requests", orgId],
    queryFn: async () => {
      const { data } = await supabase
        .from("partner_requests")
        .select()
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false })
        .throwOnError();
      return (data ?? []) as PartnerRequest[];
    },
    enabled: !!orgId,
  });
}

// Submit a new partner request for the active org
export function useCreatePartnerRequest() {
  const queryClient = useQueryClient();
  const orgId = useBoundStore((state) => state.ui.activeOrgId);

  return useMutation({
    mutationFn: async (app_id: string) => {
      if (!orgId) throw new Error("No active organization");
      const { data } = await supabase
        .from("partner_requests")
        .insert({ organization_id: orgId, app_id })
        .select()
        .single()
        .throwOnError();
      return data as PartnerRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-requests", orgId] });
    },
  });
}
