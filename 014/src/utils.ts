export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: any = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

export function calculateDaysDifference(createdDate: string): string {
  const createdAt = new Date(createdDate);
  const currentDate = new Date();

  const differenceInTime = currentDate.getTime() - createdAt.getTime();
  const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));

  return differenceInDays === 0 ? "Today" : `${differenceInDays} days ago`;
}

export function generateUniqueId(): string {
  return Math.random().toString(36).slice(2, 9);
}
