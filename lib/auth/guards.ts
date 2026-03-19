import type { AppRole, SessionUser } from "@/lib/domain/types";

export function hasRequiredRole(user: SessionUser, role: AppRole) {
  if (role === "member") {
    return user.active;
  }

  return user.active && user.role === "admin";
}

export function hasConversationAccess(userId: string, ownerId: string) {
  return userId === ownerId;
}
