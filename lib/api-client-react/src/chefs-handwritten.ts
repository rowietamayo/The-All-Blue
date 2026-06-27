import { useMutation } from "@tanstack/react-query";
import type { UseMutationOptions, UseMutationResult } from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";
import type { ErrorType } from "./custom-fetch";
import type { Chef } from "./generated/api.schemas";

type SecondParameter<T extends (...args: any) => any> = Parameters<T>[1];

export interface ChefInput {
  name: string;
  specialty: string;
  bio?: string;
  imageUrl?: string;
  yearsExperience?: number;
}

export const useCreateChef = <TError = ErrorType<unknown>, TContext = unknown>(
  options?: { mutation?: UseMutationOptions<Chef, TError, { data: ChefInput }, TContext>; request?: SecondParameter<typeof customFetch> }
): UseMutationResult<Chef, TError, { data: ChefInput }, TContext> => {
  return useMutation({
    mutationFn: ({ data }) =>
      customFetch<Chef>(`/api/chefs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(options?.request as RequestInit | undefined)?.headers },
        body: JSON.stringify(data),
        ...(options?.request as RequestInit | undefined),
      }),
    ...options?.mutation,
  });
};

export const useAdminUpdateChef = <TError = ErrorType<unknown>, TContext = unknown>(
  options?: { mutation?: UseMutationOptions<Chef, TError, { id: number; data: Partial<ChefInput> }, TContext>; request?: SecondParameter<typeof customFetch> }
): UseMutationResult<Chef, TError, { id: number; data: Partial<ChefInput> }, TContext> => {
  const requestOptions = options?.request as RequestInit | undefined;
  return useMutation({
    mutationFn: ({ id, data }) =>
      customFetch<Chef>(`/api/admin/chefs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...requestOptions?.headers },
        body: JSON.stringify(data),
        ...requestOptions,
      }),
    ...options?.mutation,
  });
};

export const useAdminDeleteChef = <TError = ErrorType<unknown>, TContext = unknown>(
  options?: { mutation?: UseMutationOptions<{ success: boolean }, TError, { id: number }, TContext>; request?: SecondParameter<typeof customFetch> }
): UseMutationResult<{ success: boolean }, TError, { id: number }, TContext> => {
  const requestOptions = options?.request as RequestInit | undefined;
  return useMutation({
    mutationFn: ({ id }) =>
      customFetch<{ success: boolean }>(`/api/admin/chefs/${id}`, {
        method: "DELETE",
        ...requestOptions,
      }),
    ...options?.mutation,
  });
};
