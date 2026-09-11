"use client";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();

      if (data?.user) {
        return data.user;
      }
      return null;
    },
  });
}
