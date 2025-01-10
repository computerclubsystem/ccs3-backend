export const enum TariffType {
    duration = 1,
    fromTo = 2,
}

export interface ITariff {
    id: number;
    name: string;
    description?: string | null;
    type: TariffType;
    duration?: number | null;
    from_time?: number | null;
    to_time?: number | null;
    price: number;
    enabled: boolean;
    created_at: string | null;
    updated_at?: string | null;
    restrict_start_time?: boolean | null;
    restrict_start_from_time?: number | null;
    restrict_start_to_time?: number | null;
}
