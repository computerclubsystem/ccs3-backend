export interface IShift {
    id: number;
    user_id: number;
    completed_sessions_total: number;
    completed_sessions_count: number;
    running_sessions_total: number;
    running_sessions_count: number;
    continuations_total: number;
    continuations_count: number;
    created_prepaid_tariffs_total: number;
    created_prepaid_tariffs_count: number;
    recharged_prepaid_tariffs_total: number;
    recharged_prepaid_tariffs_count: number;
    total_amount: number;
    completed_at: string;
    note?: string | null;
}
