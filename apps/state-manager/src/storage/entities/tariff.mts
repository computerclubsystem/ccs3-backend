import { ValueOf } from "@computerclubsystem/types/declarations.mjs";

export const TariffType = {
    duration: 1,
    fromTo: 2,
    prepaid: 3,
} as const;
export type TariffType = ValueOf<typeof TariffType>;

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
    remaining_seconds?: number | null;
    can_be_started_by_customer?: boolean | null;
    created_by_user_id?: number | null;
    updated_by_user_id?: number | null;
}
