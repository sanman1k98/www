import { z } from "astro:content";

export default z.object({
  PHONE: z.string(),
  EMAIL: z.string().email(),
}).partial();
