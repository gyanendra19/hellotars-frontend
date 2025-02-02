export const formatDate = (isoString: number) => {
    const date = new Date(isoString);

// Convert to readable string
const readableDate = date.toLocaleString("en-US", {
  weekday: "short", // "Monday"
  year: "numeric", // "2025"
  month: "short",   // "February"
  day: "numeric",  // "1"
  hour: "numeric", // "3"
  minute: "numeric", // "37"
  hour12: true,     // 12-hour clock
});

return readableDate
}