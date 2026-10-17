/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#3B2E45',
    tint: '#E85D9E',
    background: '#FBF3F8',
    foreground: '#3B2E45',
    card: '#FFFFFF',
    cardForeground: '#3B2E45',
    primary: '#E85D9E',
    primaryForeground: '#FFFFFF',
    secondary: '#F7E6F0',
    secondaryForeground: '#6E4664',
    muted: '#F7EAF2',
    mutedForeground: '#A28FAF',
    accent: '#FFE5EF',
    accentForeground: '#A53D72',
    destructive: '#F0654F',
    destructiveForeground: '#FFFFFF',
    border: '#F1DEEB',
    input: '#F1DEEB',
    success: '#22B8A0',
    warning: '#F2A64B',
    lavender: '#8E7AC3',
    mintSoft: '#E5F6F1',
    lavenderSoft: '#EEE9FA',
    warnSoft: '#FFF1E9',
  },
  dark: {
    text: '#F3E9F7',
    tint: '#F080B4',
    background: '#241B2E',
    foreground: '#F3E9F7',
    card: '#2E2438',
    cardForeground: '#F3E9F7',
    primary: '#F080B4',
    primaryForeground: '#321E2B',
    secondary: '#3D2E49',
    secondaryForeground: '#E4B8D0',
    muted: '#34273F',
    mutedForeground: '#B8A7C2',
    accent: '#4C2E42',
    accentForeground: '#F4B3D0',
    destructive: '#F27C6A',
    destructiveForeground: '#FFFFFF',
    border: '#3D2E49',
    input: '#4A3857',
    success: '#3FD9BE',
    warning: '#F2B25A',
    lavender: '#B6A2EA',
    mintSoft: '#1F3A34',
    lavenderSoft: '#312A47',
    warnSoft: '#40291F',
  },
  radius: 18,
};

export type ThemeMode = 'light' | 'dark';
export type AccentName = 'pink' | 'blue' | 'green' | 'red';

export const ACCENT_LABELS: Record<AccentName, string> = { pink: 'Pembe', blue: 'Mavi', green: 'Yeşil', red: 'Kırmızı' };

/** Vurgu rengi başına yalnızca değişen jetonlar. Pembe = yukarıdaki varsayılan palet. */
const accentOverrides: Record<Exclude<AccentName, 'pink'>, Record<ThemeMode, Partial<typeof colors.light>>> = {
  blue: {
    light: { text: '#1E2A3D', foreground: '#1E2A3D', cardForeground: '#1E2A3D', tint: '#2F6FDE', primary: '#2F6FDE', background: '#F1F6FD', secondary: '#E3EDFB', secondaryForeground: '#2B4A7A', muted: '#E8F0FB', mutedForeground: '#5F7391', accent: '#DCE9FD', accentForeground: '#1F4E9E', border: '#D9E4F5', input: '#D9E4F5' },
    dark: { text: '#EAF1FB', foreground: '#EAF1FB', cardForeground: '#EAF1FB', tint: '#6FA8FF', primary: '#6FA8FF', primaryForeground: '#0E2347', background: '#101A2B', card: '#18253A', secondary: '#223350', secondaryForeground: '#B9D2FA', muted: '#1C2B44', mutedForeground: '#9FB3D1', accent: '#1F3558', accentForeground: '#A9C8FA', border: '#2A3C5C', input: '#2F4468' },
  },
  green: {
    light: { text: '#1C2F26', foreground: '#1C2F26', cardForeground: '#1C2F26', tint: '#188A5C', primary: '#188A5C', background: '#F0F8F4', secondary: '#E0F1E8', secondaryForeground: '#25573F', muted: '#E6F3EC', mutedForeground: '#5B7A6B', accent: '#D5EFE2', accentForeground: '#16603F', border: '#D5E8DD', input: '#D5E8DD' },
    dark: { text: '#E8F6EF', foreground: '#E8F6EF', cardForeground: '#E8F6EF', tint: '#4FD39A', primary: '#4FD39A', primaryForeground: '#0B2A1D', background: '#0F1D17', card: '#162A21', secondary: '#20382D', secondaryForeground: '#B4E8D0', muted: '#1B3027', mutedForeground: '#9BBFAD', accent: '#1E4033', accentForeground: '#A5E6C9', border: '#28453A', input: '#2F5243' },
  },
  red: {
    light: { text: '#331A1E', foreground: '#331A1E', cardForeground: '#331A1E', tint: '#D9344B', primary: '#D9344B', background: '#FDF2F3', secondary: '#FBE3E6', secondaryForeground: '#7A2A35', muted: '#FBE8EA', mutedForeground: '#8E5E66', accent: '#FBD9DE', accentForeground: '#A3202F', border: '#F3D6DA', input: '#F3D6DA' },
    dark: { text: '#F9E9EC', foreground: '#F9E9EC', cardForeground: '#F9E9EC', tint: '#FF7A8A', primary: '#FF7A8A', primaryForeground: '#3A0D14', background: '#241216', card: '#321A20', secondary: '#46232B', secondaryForeground: '#F5BDC6', muted: '#3A1E25', mutedForeground: '#C9A0A8', accent: '#4F2530', accentForeground: '#F7B8C2', border: '#4A2A32', input: '#573340' },
  },
};

export function getPalette(mode: ThemeMode, accent: AccentName) {
  const base = mode === 'dark' ? colors.dark : colors.light;
  return accent === 'pink' ? base : { ...base, ...accentOverrides[accent][mode] };
}

export default colors;
