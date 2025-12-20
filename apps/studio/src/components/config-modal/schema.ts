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
  extraTargets: z
    .array(
      z.object({
        targetId: z.string(),
        outputPath: z.string().min(1),
      })
    )
    .default([]),
  colorVariables: z.array(z.string()).default([]),
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

        if (Array.isArray(plugins)) {
          const convertColorsPlugin = plugins.find(
            (plugin: any) =>
              typeof plugin === "object" &&
              plugin !== null &&
              plugin.name === "convertColors" &&
              plugin.params &&
              typeof plugin.params === "object"
          );

          if (
            convertColorsPlugin &&
            convertColorsPlugin.params.currentColor === true
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                "Please set convertColors.params.currentColor to false, as Iconoma will convert colors using the configured color variables.",
              path: ctx.path,
            });
          }
        }
      }),
    colorVariables: z
      .array(z.string())
      .default([])
      .transform((val) => val.filter((v) => v.trim().length > 0)),
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
