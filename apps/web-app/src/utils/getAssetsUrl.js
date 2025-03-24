export default function getAssetsUrl(image) {
  return new URL(`../assets/image/label/${image}.png`, import.meta.url).href
}
