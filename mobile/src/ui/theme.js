// Design tokens for the whole app. Screens use these instead of hard-coded colors and sizes.

export const colors = {
  primary: '#1E4FC2',
  primaryPressed: '#173F9E',
  primarySoft: '#EEF3FC',
  primaryBorder: '#C9D7F4',

  ink: '#111827', // headings
  text: '#374151', // body
  muted: '#6B7280', // secondary text
  subtle: '#9CA3AF', // placeholders, hints
  border: '#E5E7EB',
  divider: '#F0F1F3',
  surface: '#FFFFFF',
  background: '#F6F7F9',

  success: '#15803D',
  successSoft: '#EAF6EE',
  danger: '#B42318',
  dangerSoft: '#FDEEEC',
  warning: '#B45309',
  warningSoft: '#FEF6E7',
};

// 4-point spacing scale
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };

export const radius = { sm: 8, md: 10, lg: 12, xl: 16, pill: 999 };

export const type = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700', color: colors.ink },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '700', color: colors.ink },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: '600', color: colors.ink },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400', color: colors.text },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600', color: colors.ink },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400', color: colors.muted },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600', color: colors.text },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: '600', color: colors.muted, letterSpacing: 0.3 },
};

// Hairline border instead of heavy drop shadows
export const cardStyle = {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.border,
};

// Shared options for React Navigation headers
export const headerOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.ink,
  headerTitleStyle: { fontSize: 17, fontWeight: '600', color: colors.ink },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  contentStyle: { backgroundColor: colors.background },
};
