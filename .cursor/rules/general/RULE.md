---
alwaysApply: true
---

# Iconoma Development Rules and Patterns

## UI Component Management

- **Always use components from `@iconoma/ui` package** - Never create duplicate components or install shadcn components directly in apps
- **Component imports**: Use `@iconoma/ui/components/COMPONENT_NAME` format
  - Example: `import { Button } from "@iconoma/ui/components/button"`
- **If a component needs enhancement**: Update it in `@packages/ui/src/components/` so it can be reused across all apps
- **Installing new shadcn components**: Use `pnpm dlx shadcn@latest add component1 component2` in the `packages/ui` directory, then use from `@iconoma/ui/components/`

## Form Management

- **Use `react-hook-form`** with `zodResolver` for all forms
- **Form setup pattern**:
  ```typescript
  const form = useForm<ConfigInput>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      /* ... */
    },
  });
  ```
- **Form submission**: Use `form.handleSubmit(async (data) => { ... })`
- **Field control**: Use `Controller` component from `react-hook-form` for controlled inputs
- **Error handling**: Use `form.setError()` and `form.clearErrors()` for manual error management
- **Form state**: Access via `form.formState.isSubmitting`, `form.watch()`, `form.getValues()`, `form.setValue()`

## Zod Schema Patterns

- **Input vs Output types**:
  - Use `z.input<typeof schema>` for form input types (what react-hook-form expects)
  - Use `z.output<typeof schema>` for validated/transformed types
  - Example: `export type ConfigInput = z.input<typeof configFormSchema>;`
- **Schema structure**:
  - Keep base schema as plain `z.object()` - **DO NOT** wrap with `.superRefine()` before extending
  - Apply `superRefine` for cross-field validations **after** extending the base schema
  - Example:

    ```typescript
    export const configFormSchema = z.object({
      /* fields */
    });

    export const configSchema = configFormSchema
      .extend({
        /* transformations */
      })
      .superRefine((data, ctx) => {
        /* cross-field validations */
      });
    ```

- **Default values**: Use `.default([])` for optional arrays, not `.optional().default([])`
- **Validation errors**: Use `safeParse()` and manually set errors on form fields when validation fails

## API and Data Fetching

- **Use `axios`** for HTTP requests (not `fetch`)
- **Use React Query** (`@tanstack/react-query`) for all server state management
- **Query hooks pattern**:

  ```typescript
  export function useConfig() {
    return useQuery({
      queryKey: ["config"],
      queryFn: () => axios.get("/api/config").then((res) => res.data),
    });
  }
  ```

- **Mutation hooks pattern**:

  ```typescript
  export function useSetConfig() {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
      mutationFn: (data) =>
        axios.post("/api/endpoint", data).then((res) => res.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["config"] });
      },
    });
  }
  ```

- **Explicit TypeScript types**: Always provide explicit generic types for mutations: `<ResponseType, Error, RequestType>`
- **Error handling**: Handle errors in try-catch blocks and show toast notifications

## Component Structure and Organization

- **Split complex components**: Break down large components into smaller, focused components
- **Folder organization**: Group related components in folders (e.g., `steps/` folder for multi-step modals)
- **Component naming**: Use PascalCase for component names and files
- **File structure example**:

  ```
  components/
    config-modal/
      index.tsx          # Main orchestrator component
      schema.ts          # Zod schemas
      steps/
        config-form-step.tsx
        config-changes-step.tsx
  ```

- **Multi-step patterns**:
  - Manage step state in parent component
  - Pass callbacks (`onNextStep`, `onComplete`, `onBack`) to child components
  - Use `useState` for step management: `const [step, setStep] = useState<1 | 2>(1)`

## Styling Patterns

- **Use Tailwind CSS** with the `cn` utility from `@iconoma/ui/lib/utils`
- **Dynamic classes**: Use `cn()` for conditional class merging
  ```typescript
  className={cn(
    "base-classes",
    condition && "conditional-classes",
    error && "error-classes"
  )}
  ```
- **Color theming**: Use semantic color tokens (e.g., `text-destructive`, `bg-primary/10`)
- **Dark mode**: Use `dark:` prefix for dark mode variants

## Icons

- **Use `lucide-react`** for all icons
- **Icon pattern**: Import and use as React components

  ```typescript
  import { Check, Trash2, FilePlus } from "lucide-react";

  <Check className="size-4" />
  ```

## Error Handling and User Feedback

- **Toast notifications**: Use `toast` from `@iconoma/ui/components/sonner`

  ```typescript
  import { toast } from "@iconoma/ui/components/sonner";

  toast.success("Operation completed successfully");
  toast.error("Operation failed. Please try again.");
  ```

- **Error handling pattern**:
  ```typescript
  try {
    await mutation.mutateAsync(data);
    toast.success("Success message");
    onComplete();
  } catch (error) {
    toast.error("Error message");
    console.error("Error details:", error);
  }
  ```

## State Management

- **Server state**: Always use React Query (`useQuery`, `useMutation`)
- **Local UI state**: Use `useState` for component-specific state
- **Derived state**: Use `useMemo` for computed values
- **Callbacks**: Use `useCallback` for stable function references passed to children

## Type Definitions

- **Type organization**: Keep types close to where they're used
- **Shared types**: Place in `api/types.ts` or similar shared location
- **Type imports**: Use `type` keyword for type-only imports
  ```typescript
  import type { Change } from "../../../../api/types";
  ```

## Modern UI Patterns

- **Follow existing visual patterns** - Maintain consistency with current design
- **Use shadcn components** from `@iconoma/ui` (Dialog, Card, Badge, Button, etc.)
- **Scrollable areas**: Use `ScrollArea` component for long content with `max-h-[60vh]`
- **Visual feedback**: Use color-coded borders, badges, and icons to indicate different states/types
- **Responsive design**: Use Tailwind responsive classes when needed

## Code Quality

- **Avoid code duplication** - Extract reusable logic into hooks or utilities
- **DRY principle** - Don't Repeat Yourself
- **Single Responsibility** - Each component/function should have one clear purpose
- **Type safety** - Use TypeScript strictly, avoid `any` types
- **Error boundaries** - Handle errors gracefully with user-friendly messages
