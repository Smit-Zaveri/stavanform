export const themeColors = [
  {
    id: 'default',
    name: 'Default Blue',
    primary: '#1976d2',
    secondary: '#9c27b0'
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    primary: '#673ab7',
    secondary: '#ff4081'
  },
  {
    id: 'green',
    name: 'Forest Green',
    primary: '#2e7d32',
    secondary: '#f50057'
  },
  {
    id: 'orange',
    name: 'Sunset Orange',
    primary: '#ed6c02',
    secondary: '#2196f3'
  },
  {
    id: 'red',
    name: 'Ruby Red',
    primary: '#d32f2f',
    secondary: '#7c4dff'
  },
  {
    id: 'teal',
    name: 'Ocean Teal',
    primary: '#00796b',
    secondary: '#ff6e40'
  },
  {
    id: 'indigo',
    name: 'Deep Indigo',
    primary: '#3f51b5',
    secondary: '#ff4081'
  },
  {
    id: 'brown',
    name: 'Rustic Brown',
    primary: '#795548',
    secondary: '#4caf50'
  },
  {
    id: 'cyan',
    name: 'Azure Sky',
    primary: '#0097a7',
    secondary: '#ff5722'
  },
  {
    id: 'pink',
    name: 'Rose Pink',
    primary: '#e91e63',
    secondary: '#4caf50'
  },
  {
    id: 'slate',
    name: 'Modern Slate',
    primary: '#455a64',
    secondary: '#ffc107'
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    primary: '#1a237e',
    secondary: '#ff8f00'
  },
  {
    id: 'mint',
    name: 'Fresh Mint',
    primary: '#009688',
    secondary: '#ff4081'
  }
];

export const createCustomTheme = (primaryColor, secondaryColor) => {
  return {
    id: 'custom',
    name: 'Custom Theme',
    primary: primaryColor,
    secondary: secondaryColor
  };
};