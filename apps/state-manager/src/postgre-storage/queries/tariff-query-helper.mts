import { ITariff } from 'src/storage/entities/tariff.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class TariffQueryHelper {
    updateTariffQueryData(tariff: ITariff): IQueryTextWithParamsResult {
        const params = [
            tariff.name,
            tariff.description,
            tariff.type,
            tariff.duration,
            tariff.from_time,
            tariff.to_time,
            tariff.price,
            tariff.enabled,
            tariff.created_at,
            tariff.updated_at,
            tariff.id,
        ];
        return {
            text: this.updateTariffQueryText,
            params: params,
        };
    }

    createTariffQueryData(tariff: ITariff): IQueryTextWithParamsResult {
        const params = [
            tariff.name,
            tariff.description,
            tariff.type,
            tariff.duration,
            tariff.from_time,
            tariff.to_time,
            tariff.price,
            tariff.enabled,
            tariff.created_at
        ];
        return {
            text: this.createTariffQueryText,
            params: params,
        };
    }

    private readonly updateTariffQueryText = `
        UPDATE tariff
        SET name = $1,
            description = $2,
            type = $3,
            duration = $4,
            from_time = $5,
            to_time = $6,
            price = $7,
            enabled = $8,
            created_at = $9,
            updated_at = $10
        WHERE id = $11
    `;

    private readonly createTariffQueryText = `
        INSERT INTO tariff
        (
            name,
            description,
            type,
            duration,
            from_time,
            to_time,
            price,
            enabled,
            created_at
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
            $9
        )
        RETURNING
        (
            id,
            name,
            description,
            type,
            duration,
            from_time,
            to_time,
            price,
            enabled,
            created_at
        )
    `;

    public readonly getAllTariffsQueryText = `
        SELECT
            id,
            name,
            description,
            type,
            duration,
            from_time,
            to_time,
            price,
            enabled,
            created_at,
            updated_at
        FROM tariff
    `;
}