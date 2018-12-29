export function timeDifference(current: Date, previous: Date) {
  const milliSecondsPerMinute = 60 * 1000;
  const milliSecondsPerHour = milliSecondsPerMinute * 60;
  const milliSecondsPerDay = milliSecondsPerHour * 24;
  const milliSecondsPerMonth = milliSecondsPerDay * 30;
  const milliSecondsPerYear = milliSecondsPerDay * 365;

  const elapsed = current.getTime() - previous.getTime();

  if (elapsed < milliSecondsPerMinute / 3) {
    return 'just now';
  }

  if (elapsed < milliSecondsPerMinute) {
    return 'less than 1 min ago';
  }

  if (elapsed < milliSecondsPerHour) {
    return `${Math.round(elapsed / milliSecondsPerMinute)} min ago`;
  }

  if (elapsed < milliSecondsPerDay) {
    return `${Math.round(elapsed / milliSecondsPerHour)} hour ago`;
  }

  if (elapsed < milliSecondsPerMonth) {
    return `${Math.round(elapsed / milliSecondsPerDay)} days ago`;
  }

  if (elapsed < milliSecondsPerYear) {
    return `${Math.round(elapsed / milliSecondsPerMonth)} mo ago`;
  }
  return `${Math.round(elapsed / milliSecondsPerYear)} years ago`;
}

export function timeDifferenceForDate(date: Date) {
  return timeDifference(new Date(), date);
}
