import { IShift } from 'src/storage/entities/shift.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class ShiftQueryHelper {
    addShiftQueryData(shift: IShift): IQueryTextWithParamsResult {
        const params = [
            shift.user_id,
            shift.completed_sessions_total,
            shift.completed_sessions_count,
            shift.running_sessions_total,
            shift.running_sessions_count,
            shift.continuations_total,
            shift.continuations_count,
            shift.created_prepaid_tariffs_total,
            shift.created_prepaid_tariffs_count,
            shift.recharged_prepaid_tariffs_total,
            shift.recharged_prepaid_tariffs_count,
            shift.total_amount,
            shift.completed_at,
            shift.note,
        ];
        return {
            text: this.addShiftQueryText,
            params: params,
        };
    }

    private readonly addShiftQueryText = `
        INSERT INTO shift
        (
            user_id,
            completed_sessions_total,
            completed_sessions_count,
            running_sessions_total,
            running_sessions_count,
            continuations_total,
            continuations_count,
            created_prepaid_tariffs_total,
            created_prepaid_tariffs_count,
            recharged_prepaid_tariffs_total,
            recharged_prepaid_tariffs_count,
            total_amount,
            completed_at,
            note
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,
            $13,
            $14
        )
        RETURNING
            id,
            user_id,
            completed_sessions_total,
            completed_sessions_count,
            running_sessions_total,
            running_sessions_count,
            continuations_total,
            continuations_count,
            created_prepaid_tariffs_total,
            created_prepaid_tariffs_count,
            recharged_prepaid_tariffs_total,
            recharged_prepaid_tariffs_count,
            total_amount,
            completed_at,
            note
    `;

    getLastShiftQueryData(): IQueryTextWithParamsResult {
        return {
            text: this.getLastShiftQueryText,
            params: undefined,
        };
    }

    private readonly getLastShiftQueryText = `
        SELECT * FROM shift
        WHERE id = (SELECT MAX(id) FROM shift)
    `;
}
