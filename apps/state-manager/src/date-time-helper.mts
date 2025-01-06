import { DateTime, Duration, Settings } from 'luxon';

export class DateTimeHelper {
    /**
     * Checks if current date passed specified day minute by using startDate and checking if current date has passed the toMinute
     * @param utcStartDate Start date in milliseconds at which to start calculation
     * @param fromMinute Start minute of the period
     * @param toMinute End minute of the period
     * @returns CompareCurrentDateWithMinutePeriodResult containing whether current date is after the From-To period and calculated total/remaining time in seconds
     */
    compareCurrentDateWithMinutePeriod(startDate: number, fromMinute: number, toMinute: number): CompareCurrentDateWithMinutePeriodResult {
        const result: CompareCurrentDateWithMinutePeriodResult = {
            isAfter: false,
            totalTimeSeconds: 0,
        };
        if (fromMinute <= toMinute) {
            // From and To are in same day
            // Create date with toMinute and check if current date has passed it
            const startingDate = DateTime.fromMillis(startDate);
            const { hours, minutes } = this.getHoursAndMinutesFromTotalMinutes(toMinute);
            const toDate = startingDate.set({ hour: hours, minute: minutes, second: 59, millisecond: 999 });
            const currentDate = DateTime.now();
            result.isAfter = currentDate >= toDate;
            result.totalTimeSeconds = Math.floor(currentDate.diff(startingDate).as('seconds'))
            if (!result.isAfter) {
                result.remainingSeconds = Math.floor(toDate.diff(currentDate).as('seconds'));
            }
        } else {
            // From is from this day and To is from the next day (the period crosses midnight like 1380 (23:00) - 120 (2:00))
            // The minute must be greater than From (between From and midnight) or less than To (between midnight and To)
            // return minute >= fromMinute || minute <= toMinute;
        }

        return result;
    }

    /**
     * Checks if current minute is in the period fromMinute - toMinute. All the minutes are minutes from midnight (which is 0 minutes) and can have values from 0 (0:00) to 1439 (23:59). The fromMinute and toMinute can cross midnight (1380 (23:00) - 120 (2:00))
     * @param fromMinute Start of the period in minutes since midnight
     * @param toMinute End of the period in minutes since midnight
     * @param minute Minute since midnight
     * @returns true if currentMinute is >= fromMinute and <= toMinute
     */
    isInMinutePeriod(fromMinute: number, toMinute: number, minute: number): boolean {
        if (fromMinute <= toMinute) {
            // From and To are in same day - the minute must be between them
            return minute >= fromMinute && minute <= toMinute;
        } else {
            // From is from this day and To is from the next day (the period crosses midnight like 1380 (23:00) - 120 (2:00))
            // The minute must be greater than From (between From and midnight) or less than To (between midnight and To)
            return minute >= fromMinute || minute <= toMinute;
        }
    }

    /**
     * Same as isInMinutePeriod but uses current minute since midnight
     * @param fromMinute 
     * @param toMinute 
     */
    isCurrentMinuteInMinutePeriod(fromMinute: number, toMinute: number): boolean {
        const currentMinute = DateTime.now().minute;
        return this.isInMinutePeriod(fromMinute, toMinute, currentMinute);
    }

    getCurrentDateTimeAsNumber(): number {
        return DateTime.now().toMillis();
    }

    setDefaultTimeZone(timeZone: string): void {
        Settings.defaultZone = timeZone;
    }

    getHoursAndMinutesFromTotalMinutes(totalMinutes: number): { hours: number, minutes: number } {
        const hour = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;
        return { hours: hour, minutes: minute };
    }

    // /**
    //  * Calculates how many whole hours are in specified minutes
    //  * @param minutes 
    //  * @returns 
    //  */
    // getHoursInMinutes(minutes: number): number {
    //     const hour = Math.floor(minutes / 60);
    //     return hour;
    // }

    // /**
    //  * Returns the minute part of hh:mm represented as minutes. For example if minutes is 61, the result is 1 (1 hour and 1 minute). If minutes is 125, the result is 5 (2 hours and 5 minutes)
    //  * @param minutes 
    //  * @returns 
    //  */
    // getMinuteFromMinutes(minutes: number): number {
    //     const hour = minutes % 60;
    //     return hour;
    // }
}

interface CompareCurrentDateWithMinutePeriodResult {
    isAfter: boolean;
    totalTimeSeconds: number;
    remainingSeconds?: number | null;
}