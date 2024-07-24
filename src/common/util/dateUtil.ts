export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function compareDates(date1: string, date2: string): number {
  const [year1, month1, day1] = date1.split('-').map(Number);
  const [year2, month2, day2] = date2.split('-').map(Number);

  if (year1 !== year2) return year1 - year2;
  if (month1 !== month2) return month1 - month2;
  return day1 - day2;
}

export function isDateRangeOverlapping(
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean {
  return (
    this.compareDates(start1, end2) <= 0 && this.compareDates(start2, end1) <= 0
  );
}
