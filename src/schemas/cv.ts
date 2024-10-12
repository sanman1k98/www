import { z } from 'astro/zod';

export const daterange = z.strictObject({
	/**
	 * A `dateString` in the form `YYYY-MM` representing the start date for
	 * this entry.
	 */
	start: z.coerce.date(),
	/**
	 * A `dateString` in the form `YYYY-MM` representing the end date for
	 * this entry. If not specified, it implies the entry is still ongoing.
	 */
	end: z.coerce.date().optional(),
});

export const organization = z.strictObject({
	name: z.string(),
	/** A URL pointing to the organization's website. */
	link: z.string().url().optional(),
	/** A city and state for this organization. */
	location: z.string().optional(),
});

export const base = z.strictObject({
	type: z.literal('base').default('base'),
	/** Set to `true` to exclude from building. */
	draft: z.boolean().default(false),
	/**
	 * When specified, this number will be used to manually sort entries and
	 * will take priority over start and end dates when sorting.
	 */
	order: z.number().optional(),
});

/**
 * Create schemas for entries in the "cv" collection with the given {@link type}.
 *
 * @param type
 * @param schema
 * @returns A Zod object schema with additional fields.
 */
function createEntrySchema<
	const TType extends string,
	TSchema extends z.ZodTypeAny = z.ZodDefault<z.ZodLiteral<true>>,
>(type: TType, schema?: TSchema) {
  type Shape = { [type in TType]: TSchema } & {
  	type: z.ZodDefault<z.ZodLiteral<TType>>;
  };
  return base.extend({
  	[type]: schema ?? z.literal(true).default(true),
  	type: z.literal(type).default(type),
  } as Shape);
}

export const skills = createEntrySchema('skills', z.string());

export const experience = createEntrySchema(
	'experience',
	z.enum(['volunteering', 'internship', 'work']).default('work'),
).extend({
	...daterange.shape,
	/** Position title or role. */
	title: z.string(),
	organization,
});

// TODO: Reference entries in `repos` and `pulls`.
export const opensource = createEntrySchema('open-source').extend({
	...daterange.partial().shape,
	type: z.literal('open-source').default('open-source'),
	title: z.string().optional(),
	description: z.string().optional(),
	/** A GitHub link to a repository or a pull request. */
	link: z.string().url(),
});

export const education = createEntrySchema('education').extend({
	...daterange.shape,
	school: organization,
	major: z.string(),
	/** For example, "Bachelor of Science", "BSc", or "BS". */
	degree: z.string(),
});

export const certification = createEntrySchema('certification', z.string()).extend({
	...daterange.shape,
	link: z.string().url(),
	organization,
});
