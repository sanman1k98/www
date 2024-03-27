import type { APIRoute } from "astro";
import { generateIcon } from "@/components/Favicon";

export const GET: APIRoute = async () => new Response(await generateIcon());
