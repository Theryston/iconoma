import { z } from "zod";
import { validateOutputPath } from "./index";
import { AVAILABLE_TARGETS } from "../../constants";

export const configFormSchema = z.object({
  svg: z
    .object({
      folder: z.string().nullable(),
      inLock: z.boolean(),
    })
    .transform((value) => ({
      folder: value.inLock ? null : (value.folder ?? null),
      inLock: value.inLock,
    }))
    .superRefine((value, ctx) => {
      if (!value.inLock && !value.folder) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "When SVG in lock is disabled, a SVG folder must be provided",
          path: ["folder"],
        });
      }
    }),
  svgo: z.string().min(1),
  prettier: z.string().min(1),
  extraTargets: z
    .array(
      z.object({
        targetId: z.string(),
        outputPath: z.string().min(1),
      })
    )
    .default([]),
});

export const configSchema = configFormSchema
  .extend({
    svgo: z
      .string()
      .min(1)
      .transform((val) => {
        try {
          return JSON.parse(val);
        } catch {
          return undefined;
        }
      })
      .superRefine((value, ctx) => {
        if (value === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "SVGO config must be valid JSON",
            path: ctx.path,
          });
          return;
        }

        if (typeof value !== "object" || value === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "SVGO config must be an object",
            path: ctx.path,
          });
          return;
        }

        const plugins = value.plugins;

        const isValid = plugins.every(
          (plugin: any) =>
            typeof plugin === "string" ||
            (typeof plugin === "object" &&
              plugin !== null &&
              typeof plugin.name === "string" &&
              "params" in plugin)
        );

        if (!isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'SVGO "plugins" must be an array of strings or objects {name: string, params: any}',
            path: ctx.path,
          });
          return;
        }
      }),
    prettier: z
      .string()
      .min(1)
      .transform((val) => {
        try {
          return JSON.parse(val);
        } catch {
          return undefined;
        }
      })
      .superRefine((value, ctx) => {
        if (value === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Prettier config must be valid JSON",
            path: ctx.path,
          });
          return;
        }

        if (typeof value !== "object" || value === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Prettier config must be an object",
            path: ctx.path,
          });
          return;
        }

        if ("semi" in value && typeof value.semi !== "boolean") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Prettier "semi" must be a boolean',
            path: ctx.path,
          });
        }

        if ("singleQuote" in value && typeof value.singleQuote !== "boolean") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Prettier "singleQuote" must be a boolean',
            path: ctx.path,
          });
        }

        if ("tabWidth" in value) {
          if (typeof value.tabWidth !== "number" || value.tabWidth < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Prettier "tabWidth" must be a positive number',
              path: ctx.path,
            });
          }
        }

        if ("useTabs" in value && typeof value.useTabs !== "boolean") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Prettier "useTabs" must be a boolean',
            path: ctx.path,
          });
        }

        if ("printWidth" in value) {
          if (typeof value.printWidth !== "number" || value.printWidth < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Prettier "printWidth" must be a positive number',
              path: ctx.path,
            });
          }
        }

        if ("trailingComma" in value) {
          const validTrailingComma = ["none", "es5", "all"];
          if (
            typeof value.trailingComma !== "string" ||
            !validTrailingComma.includes(value.trailingComma)
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                'Prettier "trailingComma" must be one of: "none", "es5", "all"',
              path: ctx.path,
            });
          }
        }

        if ("arrowParens" in value) {
          const validArrowParens = ["avoid", "always"];
          if (
            typeof value.arrowParens !== "string" ||
            !validArrowParens.includes(value.arrowParens)
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                'Prettier "arrowParens" must be one of: "avoid", "always"',
              path: ctx.path,
            });
          }
        }
      }),
  })
  .superRefine((data, ctx) => {
    if (data.svg.inLock && data.extraTargets.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "At least one extra target is required when SVG in Lock is enabled",
        path: ["extraTargets"],
      });
    }

    data.extraTargets.forEach((target, index) => {
      const targetConfig = AVAILABLE_TARGETS.find(
        (t) => t.id === target.targetId
      );

      if (!targetConfig) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid target ID: ${target.targetId}`,
          path: ["extraTargets", index, "targetId"],
        });
        return;
      }

      if (!validateOutputPath(target.outputPath, targetConfig.extension)) {
        const extensionsList = targetConfig.extension.join(", ");
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Output path must end with one of: ${extensionsList} for ${targetConfig.name}`,
          path: ["extraTargets", index, "outputPath"],
        });
      }
    });
  });

export type ConfigInput = z.input<typeof configFormSchema>;
export type Config = z.output<typeof configSchema>;
