interface FormatDateTimeOptions {
  isoString: string;
  include?: { date?: boolean; time?: boolean };
}

export const formatDateTime = ({
  isoString,
  include,
}: FormatDateTimeOptions) => {
  const date = new Date(isoString);

  const showDate = include?.date ?? true;
  const showTime = include?.time ?? true;

  const parts: string[] = [];

  if (showDate) {
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    parts.push(date.toLocaleDateString(undefined, dateOptions));
  }

  if (showTime) {
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    parts.push(date.toLocaleTimeString(undefined, timeOptions));
  }

  return parts.join(" @ ");
};
