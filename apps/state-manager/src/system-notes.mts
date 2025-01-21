export class SystemNotes {
    getContinuationTariffNote(continuationTariffId: number, continuationTariffName: string): string {
        return `System note [1]: Automatic continuation to tariff id ${continuationTariffId} (${continuationTariffName})`;
    }

    getTariffCantBeCurrentlyUsedToContinuationNote(continuationTariffId: number, continuationTariffName: string): string {
        return `System note [2]: Cannot perform automatic continuation to tariff id ${continuationTariffId} (${continuationTariffName}) because it is either not active or current time is not in the tariff's From-To period`;
    }
}
