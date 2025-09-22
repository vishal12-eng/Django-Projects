import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user: user as any,
    isLoading,
    isAuthenticated: !!user,
  };
}
