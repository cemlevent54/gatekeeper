/**
 * Timezone utility functions for consistent time handling across the application
 */

export class TimezoneUtil {
    private static readonly DEFAULT_TIMEZONE = 'Europe/Istanbul';

    /**
     * Get the current timezone from environment or default
     */
    static getTimezone(): string {
        return process.env.TZ || this.DEFAULT_TIMEZONE;
    }

    /**
     * Get current date in Istanbul timezone (UTC+3)
     */
    static getCurrentDate(): Date {
        const now = new Date();

        // Istanbul timezone offset: UTC+3 (180 minutes)
        const istanbulOffset = 3 * 60; // 3 hours in minutes
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const istanbulTime = new Date(utc + (istanbulOffset * 60000));

        return istanbulTime;
    }

    /**
     * Convert a date to Istanbul timezone
     */
    static toIstanbulTime(date: Date): Date {
        const istanbulOffset = 3 * 60; // 3 hours in minutes
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const istanbulTime = new Date(utc + (istanbulOffset * 60000));

        return istanbulTime;
    }

    /**
     * Format date for MongoDB timestamps (Istanbul time)
     */
    static getMongoTimestamp(): Date {
        return this.getCurrentDate();
    }

    /**
     * Get Istanbul timezone offset in minutes
     */
    static getIstanbulOffset(): number {
        return 3 * 60; // UTC+3
    }

    /**
     * Log timezone information
     */
    static logTimezoneInfo(): void {
        const timezone = this.getTimezone();
        const currentDate = this.getCurrentDate();
        const utcDate = new Date();

        console.log(`[TimezoneUtil] Configured Timezone: ${timezone}`);
        console.log(`[TimezoneUtil] UTC Time: ${utcDate.toISOString()}`);
        console.log(`[TimezoneUtil] Istanbul Time: ${currentDate.toISOString()}`);
        console.log(`[TimezoneUtil] Istanbul Local: ${currentDate.toLocaleString('tr-TR')}`);
    }
}
