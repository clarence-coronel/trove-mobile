export const formatNumberWithCommas = (value: string): string => {
  // Remove all non-digit and non-decimal characters
  const cleaned = value.replace(/[^\d.]/g, "");

  // Split by decimal point
  const parts = cleaned.split(".");

  // Format the integer part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Return formatted number (limit to 2 decimal places)
  return parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, 2)}` : parts[0];
};

export const parseFormattedNumber = (value: string): number => {
  return parseFloat(value.replace(/,/g, "")) || 0;
};
