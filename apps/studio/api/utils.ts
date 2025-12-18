export function getPwd() {
  return process.env.ICONOMA_PWD || process.cwd();
}
