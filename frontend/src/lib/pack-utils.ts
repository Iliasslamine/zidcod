export function getPackSku(pack: { id: string; sku?: string }) {
  if (pack.sku) return pack.sku;
  let hash = 0;
  for (let i = 0; i < pack.id.length; i++) {
    hash = (hash << 5) - hash + pack.id.charCodeAt(i);
    hash |= 0;
  }
  return `PACK-${Math.abs(hash % 90000) + 10000}`;
}
