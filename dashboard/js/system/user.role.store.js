import { load, save } from "../utils/persist.js";

const KEY = "user.role";
export const ROLES = {
  VIEWER: "VIEWER",
  OPERATOR: "OPERATOR",
  ADMIN: "ADMIN"
};

let role = load(KEY, ROLES.OPERATOR); // default

export function getCurrentUserRole() {
  return role;
}

export function setCurrentUserRole(newRole) {
  if (!Object.values(ROLES).includes(newRole)) return;
  role = newRole;
  save(KEY, role);
}
