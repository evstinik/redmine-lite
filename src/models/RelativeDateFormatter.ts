export function isDaysEqual(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

export function convertToString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export class RelativeDateFormatter {
  private readonly df = new Intl.DateTimeFormat('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  public format(date: Date): string {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    if (isDaysEqual(date, now)) {
      return 'today'
    } else if (isDaysEqual(date, yesterday)) {
      return 'yesterday'
    } else if (isDaysEqual(date, tomorrow)) {
      return 'tomorrow'
    }
    return this.df.format(date)
  }
}