import { ValueOf } from "src/declarations.mjs";

export const TariffType = {
    duration: 1,
    fromTo: 2,
    prepaid: 3,
} as const;
export type TariffType = ValueOf<typeof TariffType>;

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
    remainingSeconds?: number | null;
    canBeStartedByCustomer?: boolean | null;
    createdByUserId?: number | null;
    updatedByUserId?: number | null;
}

export interface TariffShortInfo {
    id: number;
    name: string;
    duration?: number | null;
}