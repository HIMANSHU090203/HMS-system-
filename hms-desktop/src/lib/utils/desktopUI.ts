/**
 * Desktop UI Theme and Utilities
 * Provides consistent styling for desktop application UI components
 */

export const desktopTheme = {
  // Colors
  colors: {
    background: '#F0F0F0',
    surface: '#FFFFFF',
    surfaceHover: '#F5F5F5',
    border: '#C8C8C8',
    borderLight: '#E5E7EB',
    text: '#000000',
    textSecondary: '#666666',
    textMuted: '#999999',
    primary: '#0078D4',
    primaryHover: '#005A9E',
    primaryActive: '#004578',
    success: '#107C10',
    warning: '#FFB900',
    error: '#D13438',
    info: '#0078D4',
  },

  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
  },

  // Typography
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '11px',
      sm: '12px',
      base: '13px',
      md: '14px',
      lg: '16px',
      xl: '18px',
      xxl: '20px',
      title: '24px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    lg: '0 4px 6px rgba(0, 0, 0, 0.1)',
    inset: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '2px',
    md: '4px',
    lg: '6px',
    xl: '8px',
  },
};

/**
 * Desktop Button Styles
 */
export const desktopButtonStyles = {
  primary: {
    backgroundColor: desktopTheme.colors.primary,
    color: '#FFFFFF',
    border: `1px solid ${desktopTheme.colors.primary}`,
    padding: '4px 12px',
    fontSize: desktopTheme.typography.fontSize.base,
    fontWeight: desktopTheme.typography.fontWeight.medium,
    cursor: 'pointer',
    borderRadius: desktopTheme.borderRadius.sm,
    boxShadow: desktopTheme.shadows.inset,
    onMouseOver: (e: any) => {
      e.target.style.backgroundColor = desktopTheme.colors.primaryHover;
      e.target.style.borderColor = desktopTheme.colors.primaryHover;
    },
    onMouseOut: (e: any) => {
      e.target.style.backgroundColor = desktopTheme.colors.primary;
      e.target.style.borderColor = desktopTheme.colors.primary;
    },
  },
  secondary: {
    backgroundColor: desktopTheme.colors.surface,
    color: desktopTheme.colors.text,
    border: `1px solid ${desktopTheme.colors.border}`,
    padding: '4px 12px',
    fontSize: desktopTheme.typography.fontSize.base,
    fontWeight: desktopTheme.typography.fontWeight.normal,
    cursor: 'pointer',
    borderRadius: desktopTheme.borderRadius.sm,
    boxShadow: desktopTheme.shadows.inset,
    onMouseOver: (e: any) => {
      e.target.style.backgroundColor = desktopTheme.colors.surfaceHover;
    },
    onMouseOut: (e: any) => {
      e.target.style.backgroundColor = desktopTheme.colors.surface;
    },
  },
  danger: {
    backgroundColor: desktopTheme.colors.error,
    color: '#FFFFFF',
    border: `1px solid ${desktopTheme.colors.error}`,
    padding: '4px 12px',
    fontSize: desktopTheme.typography.fontSize.base,
    fontWeight: desktopTheme.typography.fontWeight.medium,
    cursor: 'pointer',
    borderRadius: desktopTheme.borderRadius.sm,
    boxShadow: desktopTheme.shadows.inset,
    onMouseOver: (e: any) => {
      e.target.style.backgroundColor = '#A4262C';
    },
    onMouseOut: (e: any) => {
      e.target.style.backgroundColor = desktopTheme.colors.error;
    },
  },
};

/**
 * Desktop Input Styles
 */
export const desktopInputStyles = {
  base: {
    padding: '4px 8px',
    border: `1px solid ${desktopTheme.colors.border}`,
    borderRadius: desktopTheme.borderRadius.sm,
    fontSize: desktopTheme.typography.fontSize.base,
    backgroundColor: desktopTheme.colors.surface,
    color: desktopTheme.colors.text,
    boxShadow: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    fontFamily: desktopTheme.typography.fontFamily,
  },
  focus: {
    outline: 'none',
    borderColor: desktopTheme.colors.primary,
    boxShadow: `0 0 0 1px ${desktopTheme.colors.primary}`,
  },
};

/**
 * Desktop Card/Container Styles
 */
export const desktopCardStyles = {
  base: {
    backgroundColor: desktopTheme.colors.surface,
    border: `1px solid ${desktopTheme.colors.borderLight}`,
    borderRadius: desktopTheme.borderRadius.xl,
    padding: desktopTheme.spacing.xl,
    marginBottom: desktopTheme.spacing.lg,
    boxShadow: desktopTheme.shadows.md,
  },
  header: {
    backgroundColor: '#F3F3F3',
    borderBottom: `1px solid ${desktopTheme.colors.border}`,
    padding: desktopTheme.spacing.sm + ' ' + desktopTheme.spacing.md,
  },
};

/**
 * Desktop Table Styles
 */
export const desktopTableStyles = {
  container: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: desktopTheme.colors.surface,
    border: `1px solid ${desktopTheme.colors.borderLight}`,
  },
  header: {
    backgroundColor: '#F3F3F3',
    borderBottom: `1px solid ${desktopTheme.colors.border}`,
    padding: desktopTheme.spacing.sm + ' ' + desktopTheme.spacing.md,
    textAlign: 'left' as const,
    fontSize: desktopTheme.typography.fontSize.sm,
    fontWeight: desktopTheme.typography.fontWeight.semibold,
    color: desktopTheme.colors.text,
  },
  cell: {
    padding: desktopTheme.spacing.sm + ' ' + desktopTheme.spacing.md,
    borderBottom: `1px solid ${desktopTheme.colors.borderLight}`,
    fontSize: desktopTheme.typography.fontSize.base,
    color: desktopTheme.colors.text,
  },
  row: {
    onMouseOver: (e: any) => {
      e.currentTarget.style.backgroundColor = desktopTheme.colors.surfaceHover;
    },
    onMouseOut: (e: any) => {
      e.currentTarget.style.backgroundColor = desktopTheme.colors.surface;
    },
  },
};

/**
 * Desktop Modal/Dialog Styles
 */
export const desktopModalStyles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: desktopTheme.colors.surface,
    border: `1px solid ${desktopTheme.colors.border}`,
    borderRadius: desktopTheme.borderRadius.md,
    padding: desktopTheme.spacing.xl,
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: desktopTheme.shadows.lg,
  },
  header: {
    borderBottom: `1px solid ${desktopTheme.colors.borderLight}`,
    paddingBottom: desktopTheme.spacing.md,
    marginBottom: desktopTheme.spacing.lg,
  },
  footer: {
    borderTop: `1px solid ${desktopTheme.colors.borderLight}`,
    paddingTop: desktopTheme.spacing.md,
    marginTop: desktopTheme.spacing.lg,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: desktopTheme.spacing.sm,
  },
};

/**
 * Desktop Page Container
 */
export const desktopPageContainer = {
  minHeight: '100vh',
  backgroundColor: desktopTheme.colors.background,
  padding: desktopTheme.spacing.sm,
  fontFamily: desktopTheme.typography.fontFamily,
};

/**
 * Desktop Page Header
 */
export const desktopPageHeader = {
  backgroundColor: '#F3F3F3',
  color: desktopTheme.colors.text,
  padding: desktopTheme.spacing.sm + ' ' + desktopTheme.spacing.md,
  marginBottom: desktopTheme.spacing.sm,
  borderBottom: `1px solid ${desktopTheme.colors.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

/**
 * Helper function to create desktop button element
 */
export const createDesktopButton = (
  label: string,
  onClick: () => void,
  variant: 'primary' | 'secondary' | 'danger' = 'secondary',
  additionalProps: any = {}
) => {
  const baseStyle = desktopButtonStyles[variant];
  return {
    onClick,
    style: {
      ...baseStyle,
      ...additionalProps.style,
    },
    onMouseOver: baseStyle.onMouseOver,
    onMouseOut: baseStyle.onMouseOut,
    ...additionalProps,
    children: label,
  };
};

/**
 * Helper function to create desktop input element
 */
export const createDesktopInput = (
  type: string = 'text',
  value: string,
  onChange: (e: any) => void,
  placeholder: string = '',
  additionalProps: any = {}
) => {
  return {
    type,
    value,
    onChange,
    placeholder,
    style: {
      ...desktopInputStyles.base,
      ...additionalProps.style,
    },
    onFocus: (e: any) => {
      Object.assign(e.target.style, desktopInputStyles.focus);
    },
    onBlur: (e: any) => {
      e.target.style.borderColor = desktopTheme.colors.border;
      e.target.style.boxShadow = 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    },
    ...additionalProps,
  };
};





























