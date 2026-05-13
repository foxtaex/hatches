import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

// POST — move card to new column/position
export const POST: APIRoute = async ({ request }) => {
  const { cardId, targetColumnId, newPosition } = await request.json();

  const card = await prisma.card.findUniqueOrThrow({ where: { id: cardId } });
  const sourceColumnId = card.columnId;

  await prisma.$transaction(async (tx) => {
    // Remove from source column — shift cards after it up
    await tx.card.updateMany({
      where: { columnId: sourceColumnId, position: { gt: card.position } },
      data: { position: { decrement: 1 } },
    });

    // Make room in target column
    await tx.card.updateMany({
      where: { columnId: targetColumnId, position: { gte: newPosition } },
      data: { position: { increment: 1 } },
    });

    // Move card
    await tx.card.update({
      where: { id: cardId },
      data: { columnId: targetColumnId, position: newPosition },
    });
  });

  return Response.json({ ok: true });
};
