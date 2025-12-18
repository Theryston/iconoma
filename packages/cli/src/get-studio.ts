export async function getStudio(): Promise<{
  createServer: () => Promise<{ url: string; close: () => Promise<void> }>;
}> {
  const studioPath = "./studio/index.js";
  return import(studioPath);
}
