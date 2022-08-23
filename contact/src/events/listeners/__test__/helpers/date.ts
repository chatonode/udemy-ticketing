
// Helper function
export function addHoursToDate(date: Date, hours: number): Date {
    return new Date(new Date(date).setHours(date.getHours() + hours));
  }
