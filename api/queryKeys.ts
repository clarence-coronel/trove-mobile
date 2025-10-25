export const accountsKeys = {
  all: ["accounts"] as const,
  lists: () => [...accountsKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...accountsKeys.lists(), { filters }] as const,
  details: () => [...accountsKeys.all, "detail"] as const,
  detail: (id: string) => [...accountsKeys.details(), id] as const,
};

export const transactionsKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionsKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...transactionsKeys.lists(), { filters }] as const,
  details: () => [...transactionsKeys.all, "detail"] as const,
  detail: (id: string) => [...transactionsKeys.details(), id] as const,
};
