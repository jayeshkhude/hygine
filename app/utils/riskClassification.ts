const WASTE_KEYWORDS = ["garbage", "overflow", "unclean"]
const WATER_KEYWORDS = ["smell", "drain", "sewage"]
const AIR_KEYWORDS = ["dust", "construction", "pollution"]

export function classifyRisk(text: string): string {
  const lowerText = text.toLowerCase()
  const found: string[] = []
  
  for (const kw of [...WASTE_KEYWORDS, ...WATER_KEYWORDS, ...AIR_KEYWORDS]) {
    if (new RegExp(`\\b${kw}\\b`).test(lowerText)) {
      found.push(kw)
    }
  }
  
  if (found.length >= 2) {
    return "High"
  } else if (found.length === 1) {
    return "Medium"
  } else if (text.trim().length > 0) {
    return "Low"
  } else {
    return "None"
  }
}

export function extractArea(location: string): string {
  if (!location || location === 'nan') {
    return "Unknown"
  }
  return location.split(",")[0].trim()
} 