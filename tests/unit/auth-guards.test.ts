import { describe, expect, it } from "vitest";

import { hasConversationAccess, hasRequiredRole } from "@/lib/auth/guards";
import { createDemoState } from "@/lib/domain/seed";

describe("auth guards", () => {
  const state = createDemoState();
  const admin = state.profiles.find((profile) => profile.role === "admin")!;
  const member = state.profiles.find((profile) => profile.role === "member")!;

  it("allows admins to access admin routes", () => {
    expect(hasRequiredRole(admin, "admin")).toBe(true);
    expect(hasRequiredRole(member, "admin")).toBe(false);
  });

  it("checks conversation ownership", () => {
    expect(hasConversationAccess(member.id, member.id)).toBe(true);
    expect(hasConversationAccess(admin.id, member.id)).toBe(false);
  });
});
