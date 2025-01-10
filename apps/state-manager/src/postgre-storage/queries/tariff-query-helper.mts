import { ITariff } from 'src/storage/entities/tariff.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class TariffQueryHelper {
    getTariffByIdQueryData(tariffId: number): IQueryTextWithParamsResult {
        const params = [
            tariffId,
        ];
        return {
            text: this.getTariffByIdQueryText,
            params: params,
        };
    }

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
            tariff.updated_at,
            tariff.restrict_start_time,
            tariff.restrict_start_from_time,
            tariff.restrict_start_to_time,
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
            tariff.created_at,
            tariff.restrict_start_time,
            tariff.restrict_start_from_time,
            tariff.restrict_start_to_time,
        ];
        return {
            text: this.createTariffQueryText,
            params: params,
        };
    }

    private returningQueryText = `
        RETURNING
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
            updated_at,
            restrict_start_time,
            restrict_start_from_time,
            restrict_start_to_time
    `;

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
            updated_at = $9,
            restrict_start_time = $10,
            restrict_start_from_time = $11,
            restrict_start_to_time = $12
        WHERE id = $13
        ${this.returningQueryText}
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
            created_at,
            restrict_start_time,
            restrict_start_from_time,
            restrict_start_to_time
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
            $12
        )
        ${this.returningQueryText}
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
            updated_at,
            restrict_start_time,
            restrict_start_from_time,
            restrict_start_to_time
        FROM tariff
    `;

    public readonly getTariffByIdQueryText = `
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
            updated_at,
            restrict_start_time,
            restrict_start_from_time,
            restrict_start_to_time
        FROM tariff
        WHERE id = $1
    `;
}