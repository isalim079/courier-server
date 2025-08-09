export const USER_ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer", 
  AGENT: "agent"
} as const;

export type TUser = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "customer" | "agent";
};
