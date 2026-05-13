import type { APIRoute } from "astro";
import { syncIntegration } from "../../../../lib/integrations/sync";

export const POST: APIRoute = async ({ params }) => {
  try {
    const count = await syncIntegration(Number(params.id));
    return Response.json({ ok: true, count });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};
