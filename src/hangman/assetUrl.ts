/** Public files need Vite's base so GitHub Pages can find them under /Poopie/. */
export function assetUrl(path: string) {
  const base = import.meta.env.BASE_URL || '/'
  const stripped = path.replace(/^\/?public\//, '').replace(/^\//, '')
  return `${base}${stripped}`
}
