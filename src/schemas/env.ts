import { z } from "astro/zod";

export default z.object({
  PHONE: z.string(),
  EMAIL: z.string().email(),
}).partial();
