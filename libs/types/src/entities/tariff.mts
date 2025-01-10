export const enum TariffType {
    duration = 1,
    fromTo = 2,
}

export interface Tariff {
    id: number;
    name: string;
    description?: string | null;
    type: TariffType;
    duration?: number | null;
    fromTime?: number | null;
    toTime?: number | null;
    price: number;
    enabled: boolean;
    createdAt: string | null;
    updatedAt?: string | null;
    restrictStartTime?: boolean | null;
    restrictStartFromTime?: number | null;
    restrictStartToTime?: number | null;
    startedByUserId?: number | null;
}