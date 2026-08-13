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
