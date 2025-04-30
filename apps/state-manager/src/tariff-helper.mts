import { Tariff, TariffType } from '@computerclubsystem/types/entities/tariff.mjs';

export class TariffHelper {
    createTariffFromRequested(requestedTariffToCreate: Tariff): Tariff {
        const tariffToCreate = {
            name: requestedTariffToCreate.name,
            description: requestedTariffToCreate.description,
            enabled: requestedTariffToCreate.enabled,
            price: requestedTariffToCreate.price,
            type: requestedTariffToCreate.type,
        } as Tariff;
        switch (requestedTariffToCreate.type) {
            case TariffType.duration: {
                tariffToCreate.duration = requestedTariffToCreate.duration;
                tariffToCreate.restrictStartTime = requestedTariffToCreate.restrictStartTime;
                tariffToCreate.restrictStartFromTime = requestedTariffToCreate.restrictStartFromTime;
                tariffToCreate.restrictStartToTime = requestedTariffToCreate.restrictStartToTime;
                break;
            }
            case TariffType.fromTo: {
                tariffToCreate.fromTime = requestedTariffToCreate.fromTime;
                tariffToCreate.toTime = requestedTariffToCreate.toTime;
                break;
            }
            case TariffType.prepaid: {
                tariffToCreate.duration = requestedTariffToCreate.duration;
                tariffToCreate.remainingSeconds = requestedTariffToCreate.duration! * 60;
                tariffToCreate.canBeStartedByCustomer = requestedTariffToCreate.canBeStartedByCustomer;
                break;
            }
        }
        return tariffToCreate;
    }

    canUseTariff(tariff?: Tariff | null): CanUseTariffResult {
        const result: CanUseTariffResult = {
            canUse: false,
        };
        if (!tariff) {
            result.canUse = false;
            return result;
        }
        const currentDayMinute = this.getCurrentDayMinute();
        if (tariff.type === TariffType.fromTo) {
            const fromTime = tariff.fromTime!;
            const toTime = tariff.toTime!;
            const isCurrentDayMinuteInTariffInterval = this.isDayMinuteInInterval(currentDayMinute, fromTime, toTime);
            if (!isCurrentDayMinuteInTariffInterval) {
                const tariffFromTime = toTime;
                if (tariffFromTime > currentDayMinute) {
                    result.availableInMinutes = tariffFromTime - currentDayMinute;
                } else {
                    // currentDayMinute passed tariff's fromTime
                    // We must calculate the time to midnight and then add the time to tariffFromTime
                    const minutesToMidnight = 1440 - currentDayMinute;
                    result.availableInMinutes = minutesToMidnight + tariffFromTime;
                }
                result.canUse = false;
                return result;
            }
        }

        result.canUse = true;
        return result;
    }

    isDayMinuteInInterval(dayMinute: number, from: number, to: number): boolean {
        if (from === to) {
            // If "from" is equal to "to", then return true only if dayMinute is equal to them too
            return dayMinute === from;
        }

        if (from < to) {
            // When "from" is less than "to", dayMinute must be between them
            return (dayMinute >= from && dayMinute <= to);
        }

        if (from > to) {
            // When "from" is greater than "to" - the period crosses midnight
            // The "dayMinute" must be >= "from" (from "from" up to minute before midnight)
            // or <= "to" (from midnight up to "to")
            return (dayMinute >= from || dayMinute <= to);
        }
        return false;
    }

    getCurrentDayMinute(): number {
        const currentDate = this.getCurrentDate();
        const currentDayMinute = currentDate.getHours() * 60 + currentDate.getMinutes();
        return currentDayMinute;
    }

    getCurrentDate(): Date {
        return new Date();
    }
}

export interface CanUseTariffResult {
    canUse: boolean;
    availableInMinutes?: number | null;
}
