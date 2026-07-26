import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";
import { projectVisibilityWhere } from "../../../lib/projectAccess";

export const GET: APIRoute = async ({ locals }) => {
  const user = (locals as any).user;
  const projects = await prisma.project.findMany({
    where: { ...projectVisibilityWhere(user), dueDate: { not: null } },
    orderBy: { dueDate: "asc" },
    select: {
      id: true,
      name: true,
      dueDate: true,
      team: { select: { id: true, name: true, color: true } },
    },
  });
  return Response.json(projects);
};
