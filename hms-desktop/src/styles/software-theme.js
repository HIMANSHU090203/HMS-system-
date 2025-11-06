// Software-style theme colors
export const theme = {
  // Minimal color palette (4 colors max)
  colors: {
    primary: '#2563EB',      // Professional blue
    secondary: '#6B7280',    // Neutral gray
    accent: '#3B82F6',       // Soft blue
    danger: '#EF4444',       // Red for deletions
    
    // Neutral shades
    bg: '#F9FAFB',          // Light background
    bgCard: '#FFFFFF',       // White cards
    bgHeader: '#F3F4F6',     // Header background
    border: '#E5E7EB',       // Borders
    textPrimary: '#111827',  // Dark text
    textSecondary: '#6B7280', // Medium text
    textMuted: '#9CA3AF',    // Light text
  },

  // Software-style styles
  styles: {
    window: {
      container: {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '4px',
      },
      header: {
        backgroundColor: '#F3F4F6',
        borderBottom: '1px solid #E5E7EB',
        padding: '12px 16px',
      },
      content: {
        padding: '16px',
        backgroundColor: '#FFFFFF',
      },
    },

    button: {
      primary: {
        backgroundColor: '#2563EB',
        color: '#FFFFFF',
        padding: '8px 16px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '500',
        border: 'none',
        cursor: 'pointer',
      },
      secondary: {
        backgroundColor: '#F3F4F6',
        color: '#111827',
        padding: '8px 16px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '500',
        border: '1px solid #E5E7EB',
        cursor: 'pointer',
      },
      danger: {
        backgroundColor: '#EF4444',
        color: '#FFFFFF',
        padding: '8px 16px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '500',
        border: 'none',
        cursor: 'pointer',
      },
      link: {
        color: '#2563EB',
        textDecoration: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        backgroundColor: 'transparent',
        border: 'none',
      },
    },

    input: {
      field: {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #D1D5DB',
        borderRadius: '4px',
        fontSize: '14px',
        backgroundColor: '#FFFFFF',
      },
      label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#111827',
        marginBottom: '4px',
      },
    },

    table: {
      container: {
        border: '1px solid #E5E7EB',
        borderRadius: '4px',
        overflow: 'hidden',
      },
      header: {
        backgroundColor: '#F9FAFB',
        borderBottom: '1px solid #E5E7EB',
      },
      row: {
        borderBottom: '1px solid #F3F4F6',
      },
    },

    card: {
      container: {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '4px',
        padding: '16px',
      },
      title: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '12px',
      },
    },

    stats: {
      container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      },
      item: {
        backgroundColor: '#F9FAFB',
        padding: '16px',
        border: '1px solid #E5E7EB',
        borderRadius: '4px',
      },
      label: {
        fontSize: '12px',
        color: '#6B7280',
        marginBottom: '4px',
      },
      value: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#111827',
      },
    },
  },
};

export default theme;

