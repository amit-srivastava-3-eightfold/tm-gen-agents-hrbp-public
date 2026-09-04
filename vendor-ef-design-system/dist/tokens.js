const e = {
  grey: {
    100: "#05070A",
    90: "#1A212E",
    80: "#343C4C",
    70: "#4F5666",
    60: "#69717F",
    50: "#858B98",
    40: "#A1A6B1",
    30: "#BDC1C9",
    20: "#D9DCE1",
    10: "#F6F7F8",
    0: "#FFFFFF"
  },
  blue: {
    100: "#00060A",
    90: "#002A47",
    80: "#054D7B",
    70: "#146DA6",
    60: "#2C8CC9",
    50: "#47A4DF",
    40: "#68BAEF",
    30: "#8ED0FA",
    20: "#BCE4FF",
    10: "#EBF7FF"
  },
  "blue-green": {
    100: "#00090A",
    90: "#00333B",
    80: "#025966",
    70: "#0B7B8B",
    60: "#1999AC",
    50: "#2DB3C7",
    40: "#50CEE1",
    30: "#7BE4F4",
    20: "#B0F3FE",
    10: "#EBFDFF"
  },
  "blue-violet": {
    100: "#090B1F",
    90: "#191D4A",
    80: "#2B3271",
    70: "#414996",
    60: "#5962B7",
    50: "#757ED6",
    40: "#8C95E8",
    30: "#A9B0F5",
    20: "#CACFFC",
    10: "#F1F2FF"
  },
  violet: {
    100: "#060106",
    90: "#350E31",
    80: "#5D2156",
    70: "#7E3A77",
    60: "#975590",
    50: "#AE72A8",
    40: "#C491BF",
    30: "#D8B1D4",
    20: "#EAD3E8",
    10: "#FBF6FB"
  },
  "violet-red": {
    100: "#1F0816",
    90: "#491635",
    80: "#702853",
    70: "#943D71",
    60: "#B5548E",
    50: "#D36FAB",
    40: "#E688C0",
    30: "#F3A5D4",
    20: "#FCC8E7",
    10: "#FFF0F9"
  },
  red: {
    100: "#0A0202",
    90: "#3B1010",
    80: "#6C2222",
    70: "#993838",
    60: "#C15151",
    50: "#E46F6F",
    40: "#F48686",
    30: "#FFA3A3",
    20: "#FFC6C6",
    10: "#FFEFEF"
  },
  "red-orange": {
    100: "#1F0C03",
    90: "#4C1F0C",
    80: "#78351A",
    70: "#A54D2C",
    60: "#D26743",
    50: "#F8845F",
    40: "#FF9977",
    30: "#FFB396",
    20: "#FFD1BD",
    10: "#FFF2ED"
  },
  orange: {
    100: "#0A0700",
    90: "#3B2600",
    80: "#6C4500",
    70: "#9D6309",
    60: "#C97E19",
    50: "#F29D31",
    40: "#FFB650",
    30: "#FFCD78",
    20: "#FFE3B0",
    10: "#FFF8EB"
  },
  yellow: {
    100: "#332200",
    90: "#333100",
    80: "#5C5500",
    70: "#857600",
    60: "#A88F00",
    50: "#D6AD00",
    40: "#F1C40F",
    30: "#FFE44E",
    20: "#FFF89C",
    10: "#FFFFEB"
  },
  "yellow-green": {
    100: "#131300",
    90: "#343500",
    80: "#525400",
    70: "#6D6F00",
    60: "#858707",
    50: "#ABAE1F",
    40: "#CACD46",
    30: "#E2E575",
    20: "#F3F5B0",
    10: "#FDFEEB"
  },
  green: {
    100: "#030A08",
    90: "#0E2E26",
    80: "#1B5143",
    70: "#2B715F",
    60: "#3D8F79",
    50: "#51AB93",
    40: "#67C5AC",
    30: "#8CE1CA",
    20: "#B9F4E4",
    10: "#F0FEFA"
  }
};
function E(F, r) {
  return `var(--color-${F}-${r})`;
}
const t = {
  borderDefault: "--color-border-default",
  inputInk: "--color-input-ink",
  bgDefault: "--color-bg-default",
  textDefault: "--text-color-default",
  primaryBlue: "--color-primary-blue",
  primaryBlueGreen: "--color-primary-blue-green",
  primaryRed: "--color-primary-red",
  primaryGrey: "--color-primary-grey",
  tertiaryBlue: "--color-tertiary-blue",
  background1Grey: "--color-background1-grey",
  background2Grey: "--color-background2-grey",
  background3Grey: "--color-background3-grey",
  // Button (canonical)
  buttonPrimaryBg: "--color-button-primary-bg",
  buttonPrimaryText: "--color-button-primary-text",
  buttonSecondaryBg: "--color-button-secondary-bg",
  buttonOutlineHoverBg: "--color-button-outline-hover-bg"
}, o = [
  "#054D7B",
  // blue-80
  "#1999AC",
  // blue-green-60
  "#2B715F",
  // green-70
  "#9D6309",
  // orange-70
  "#993838",
  // red-70
  "#975590",
  // violet-60
  "#2C8CC9",
  // blue-60
  "#51AB93"
  // green-50
], A = [
  ...o,
  "#5962B7",
  // blue-violet-60
  "#C97E19",
  // orange-60
  "#E46F6F",
  // red-50
  "#AE72A8"
  // violet-50
], B = {
  success: "#2B715F",
  // green-70
  warning: "#9D6309",
  // orange-70
  error: "#993838",
  // red-70
  info: "#054D7B",
  // blue-80
  neutral: "#69717F",
  // grey-60
  accent: "#1999AC"
  // blue-green-60
}, C = {
  blue: "#EBF7FF",
  // blue-10
  green: "#F0FEFA",
  // green-10
  red: "#FFEFEF",
  // red-10
  orange: "#FFF8EB",
  // orange-10
  violet: "#FBF6FB",
  // violet-10
  teal: "#EBFDFF"
  // blue-green-10
}, n = {
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10,
  6: 12,
  7: 14,
  8: 16,
  10: 20,
  12: 24,
  16: 32,
  20: 40,
  24: 48,
  32: 64
}, l = {
  0: 0,
  1: 4,
  2: 6,
  3: 8,
  4: 10,
  5: 12,
  6: 16,
  7: 20,
  8: 24,
  full: 9999
}, a = (F) => `var(--spacing-${F})`, c = (F) => `var(--radius-${F})`;
export {
  C as CHART_AREA_FILLS,
  o as CHART_PALETTE,
  A as CHART_PALETTE_EXTENDED,
  B as CHART_SEMANTIC,
  e as COLOR_PALETTE,
  l as CORNER_RADIUS_TOKENS,
  t as SEMANTIC_COLOR_VARS,
  n as SPACING_TOKENS,
  E as colorVar,
  c as radiusVar,
  a as spacingVar
};
