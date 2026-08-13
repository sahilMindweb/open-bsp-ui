import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/supabase/client";

export type PartnerClient = {
  id: string;
  name: string;
  created_at: string;
  waba_id: string | null;
  phone_number_id: string | null;
  status: string | null;
};

export const usePartnerClients = () => {
  return useQuery({
    queryKey: ["partner-clients"],
    queryFn: async () => {
      const { data } = await supabase
        .rpc("get_partner_clients")
        .throwOnError();
      return (data ?? []) as PartnerClient[];
    },
  });
};
