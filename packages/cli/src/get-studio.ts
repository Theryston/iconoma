export async function getStudio(): Promise<{
  createServer: (options: {
    port?: number;
  }) => Promise<{ url: string; close: () => Promise<void> }>;
}> {
  const studioPath = "./studio/index.js";
  return import(studioPath);
}
