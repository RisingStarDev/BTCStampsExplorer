import { HandlerContext } from "$fresh/server.ts";
import {
  connectDb,
  CommonClass,
  summarize_issuances,
} from "$lib/database/index.ts";
import { api_get_stamp } from "$lib/controller/stamp.ts";
import { IdResponseBody, ErrorResponseBody, IdHandlerContext  } from "$fresh/globals.d.ts";



export const handler = async (_req: Request, ctx: IdHandlerContext): Promise<Response> => {
  const { id } = ctx.params;
  try {
    const client = await connectDb();
    const data = await api_get_stamp(id);
    const last_block = await CommonClass.get_last_block_with_client(client);
    client.close();
    const body: IdResponseBody = {
      data: data,
      last_block: last_block.rows[0]["last_block"],
    };
    return new Response(JSON.stringify(body));
  } catch {
    const body: ErrorResponseBody = { error: `Error: Internal server error` };
    return new Response(JSON.stringify(body));
  }
};
