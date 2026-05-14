export type Section = "board" | "docs" | "notes" | "planner" | "templates" | "admin";
export type Action = "view" | "create" | "edit" | "delete";

interface MembershipWithRole {
  role: {
    permissions: { section: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }[];
  };
}

interface UserWithMemberships {
  isAdmin: boolean;
  memberships: MembershipWithRole[];
}

export function can(user: UserWithMemberships | null, section: Section, action: Action): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;

  return user.memberships.some(({ role }) => {
    const perm = role.permissions.find((p) => p.section === section);
    if (!perm) return false;
    if (action === "view") return perm.canView;
    if (action === "create") return perm.canCreate;
    if (action === "edit") return perm.canEdit;
    if (action === "delete") return perm.canDelete;
    return false;
  });
}

export function getEffectivePermissions(user: UserWithMemberships | null) {
  const sections: Section[] = ["board", "docs", "notes", "planner", "templates", "admin"];
  return Object.fromEntries(
    sections.map((s) => [
      s,
      {
        canView: can(user, s, "view"),
        canCreate: can(user, s, "create"),
        canEdit: can(user, s, "edit"),
        canDelete: can(user, s, "delete"),
      },
    ])
  );
}
