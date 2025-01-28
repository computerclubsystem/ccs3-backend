export interface ITariffRecharge {
    id: number;
    tariff_id: number;
    remaining_seconds_before_recharge: number;
    recharge_seconds: number;
    recharge_price: number;
    user_id: number;
    recharged_at: string;
}
