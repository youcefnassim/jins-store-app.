/**
 * Maps package amounts/labels to glowing 3D diamond asset tiers
 * based on the gaming store asset spritesheet.
 */
export function getDiamondTierImage(amount: string | number, fallbackIndex: number = 0): string {
  const str = String(amount).toLowerCase();

  // Special passes (Weekly diamond pass, etc.)
  if (str.includes("pass") || str.includes("semaine") || str.includes("weekly")) {
    return "/images/diamonds/diamond-pouch.png";
  }

  // Extract numeric quantity
  const match = str.replace(/[^\d]/g, "");
  const num = match ? parseInt(match, 10) : null;

  if (num !== null) {
    if (num <= 100) return "/images/diamonds/diamond-1.png";        // 1 single diamond (~86)
    if (num <= 200) return "/images/diamonds/diamond-2.png";        // 2 diamonds (~172)
    if (num <= 300) return "/images/diamonds/diamond-3.png";        // 3 diamonds (~257)
    if (num <= 450) return "/images/diamonds/diamond-4.png";        // 4-5 diamonds (~344)
    if (num <= 600) return "/images/diamonds/diamond-pile-1.png";   // Pile 1 (~514)
    if (num <= 900) return "/images/diamonds/diamond-pile-2.png";   // Pile 2 (~706)
    if (num <= 1500) return "/images/diamonds/diamond-pouch.png";   // Velvet pouch (~1060)
    if (num <= 2500) return "/images/diamonds/diamond-chest-1.png"; // Open chest (~2195)
    return "/images/diamonds/diamond-chest-2.png";                  // Mega overflowing chest (3688+)
  }

  // Fallback by list index
  const indexMap = [
    "/images/diamonds/diamond-1.png",
    "/images/diamonds/diamond-2.png",
    "/images/diamonds/diamond-3.png",
    "/images/diamonds/diamond-4.png",
    "/images/diamonds/diamond-pile-1.png",
    "/images/diamonds/diamond-pile-2.png",
    "/images/diamonds/diamond-pouch.png",
    "/images/diamonds/diamond-chest-1.png",
    "/images/diamonds/diamond-chest-2.png",
  ];

  return indexMap[fallbackIndex % indexMap.length] || "/images/diamonds/diamond-1.png";
}

