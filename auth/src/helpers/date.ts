
// Helper function
export function addHoursToDate(date: Date, hours: number): Date {
    const currentHours = date.getHours()
    return new Date(date.setHours(currentHours + hours))
}
