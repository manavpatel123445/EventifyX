type CurrencyFormatOptions = Omit<Intl.NumberFormatOptions, 'style' | 'currency'> & {
  /** Whether to show the currency symbol (default: true) */
  showSymbol?: boolean;
};

/**
 * Formats a number as Indian Rupees (INR)
 * @param amount - The amount to format
 * @param options - Additional options for number formatting
 * @returns Formatted currency string with ₹ symbol
 */
export const formatINR = (
  amount: number, 
  options: CurrencyFormatOptions = {}
): string => {
  const { showSymbol = true, ...numberFormatOptions } = options;
  
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...numberFormatOptions,
    // Force these values to ensure consistent formatting
    currencyDisplay: 'code', // We'll handle the symbol ourselves
    useGrouping: true,
  };

  let formatted = new Intl.NumberFormat('en-IN', defaultOptions)
    .format(amount);
    
  // Replace the currency code with ₹ symbol
  if (showSymbol) {
    formatted = formatted.replace(/^[A-Z]{3}\s*/, '₹');
  } else {
    formatted = formatted.replace(/^[A-Z]{3}\s*/, '').trim();
  }
  
  return formatted;
};

/**
 * Formats a number with Indian numbering system (lakhs, crores)
 * @param num - The number to format
 * @returns Formatted string with Indian numbering system
 */
export const formatIndianNumber = (num: number): string => {
  if (isNaN(num)) return '₹0';
  
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  
  if (absNum >= 10000000) {
    return `${isNegative ? '-' : ''}₹${(absNum / 10000000).toFixed(2)} Cr`;
  }
  if (absNum >= 100000) {
    return `${isNegative ? '-' : ''}₹${(absNum / 100000).toFixed(2)} L`;
  }
  if (absNum >= 1000) {
    return `${isNegative ? '-' : ''}₹${(absNum / 1000).toFixed(2)} K`;
  }
  
  return `${isNegative ? '-' : ''}₹${absNum.toFixed(2)}`;
};
