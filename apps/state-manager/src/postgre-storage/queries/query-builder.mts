import { ValueOf } from "@computerclubsystem/types/declarations.mjs";

abstract class QueryBuilderBase {
    protected returningColumnNames: string[] = [];

    protected commaJoin(items: string[]): string {
        return items.join(',');
    }

    addReturningColumnNames(columnNames: string[]): void {
        this.returningColumnNames.push(...columnNames);
    }

    abstract getQueryString(): string;
}

export const WhereClauseOperation = {
    equals: '=',
    lessThan: '<',
    greaterThan: '>',
    lessThanOrEqual: '<=',
    greaterThanOrEqual: '>=',
} as const;
export type WhereClauseOperation = ValueOf<typeof WhereClauseOperation>;

export interface WhereClause {
    columnName: string;
    operation: WhereClauseOperation | string;
    parameterName: string;
}

export const SortOrder = {
    ascending: 'ASC',
    descending: 'DESC',
} as const;
export type SortOrder = ValueOf<typeof SortOrder>;

export interface OrderClause {
    columnName: string;
    sortOrder: SortOrder;
}

export class SelectQueryBuilder extends QueryBuilderBase {
    private tableName = '';
    private readonly selectColumnNames: string[] = [];
    private readonly whereClauses: WhereClause[] = [];
    private readonly orderClauses: OrderClause[] = [];

    setTableName(tableName: string): void {
        this.tableName = tableName;
    }

    addSelectColumnName(columnName: string): ColumnNameWithParameterName {
        this.selectColumnNames.push(columnName);
        const result: ColumnNameWithParameterName = {
            columnName: columnName,
            parameterName: `$${this.selectColumnNames.length}`,
        };
        return result;
    }

    addSelectColumnNames(columnNames: string[]): ColumnNameWithParameterName[] {
        const result: ColumnNameWithParameterName[] = [];
        for (const colName of columnNames) {
            this.selectColumnNames.push(colName);
            const resultItem: ColumnNameWithParameterName = {
                columnName: colName,
                parameterName: `$${this.selectColumnNames.length}`,
            };
            result.push(resultItem);
        }
        return result;
    }

    addWhereClause(whereClause: WhereClause): void {
        this.whereClauses.push(whereClause);
    }

    addOrderClause(orderClause: OrderClause): void {
        this.orderClauses.push(orderClause);
    }

    override getQueryString(): string {
        const commaSeparatedColumnNames = this.commaJoin(this.selectColumnNames.map(x => `"${x}"`));
        let selectText = `SELECT ${commaSeparatedColumnNames} FROM ${this.tableName}`;
        if (this.whereClauses.length > 0) {
            const whereClausesText = this.whereClauses.map(x => `${x.columnName} ${x.operation} ${x.parameterName}`);
            // TODO Support OR as well
            const joinedWhereClauses = whereClausesText.join(' AND ');
            selectText += ` WHERE ${joinedWhereClauses}`;
        }
        if (this.orderClauses.length > 0) {
            const orderClausesTextArray = this.orderClauses.map(x => `${x.columnName} ${x.sortOrder}`);
            const orderClausesText = this.commaJoin(orderClausesTextArray);
            selectText += ` ORDER BY ${orderClausesText}`;
        }
        return selectText;
    }
}

export class InsertQueryBuilder extends QueryBuilderBase {
    private tableName = '';
    private insertColumnNames: string[] = [];

    setTableName(tableName: string): void {
        this.tableName = tableName;
    }

    addInsertColumnName(columnName: string): string {
        this.insertColumnNames.push(columnName);
        return `$${this.insertColumnNames.length}`;
    }

    addManyInsertColumnNames(columnNames: string[]): void {
        this.insertColumnNames.push(...columnNames);
    }

    override getQueryString(): string {
        const columnNames = this.commaJoin(this.insertColumnNames.map(x => `"${x}"`));
        const valueParameters = this.commaJoin(this.insertColumnNames.map((_, index) => `$${index + 1}`));
        let insertIntoText = `INSERT INTO "${this.tableName}" (${columnNames}) VALUES (${valueParameters})`;
        if (this.returningColumnNames.length > 0) {
            const returningColumnsText = this.commaJoin(this.returningColumnNames.map(x => `"${x}"`));
            const returningText = `RETURNING ${returningColumnsText}`;
            insertIntoText += ` ${returningText}`;
        }
        return insertIntoText;
    }
}

export class UpdateQueryBuilder extends QueryBuilderBase {
    private tableName = '';
    private updateColumnsWithValues: ColumnNameWithValueAndParameterName[] = [];
    private whereColumnsWithValues: ColumnNameWithValueAndParameterName[] = [];

    setTableName(tableName: string): void {
        this.tableName = tableName;
    }

    getUpdateColumnsWithValues(): ColumnNameWithValueAndParameterName[] {
        return this.updateColumnsWithValues;
    }

    getParameterValues(): unknown[] {
        return [...this.getUpdateColumnsWithValues().map(x => x.value), ...this.whereColumnsWithValues.map(x => x.value)];
    }

    addWhereParameterColumnNameWithValue(columnName: string, value: unknown): ColumnNameWithValueAndParameterName {
        const result: ColumnNameWithValueAndParameterName = {
            columnName,
            value,
            parameterName: `$${this.updateColumnsWithValues.length + this.whereColumnsWithValues.length + 1}`,
        };
        this.whereColumnsWithValues.push(result);
        return result;
    }

    addUpdateColumnNameWithValue(columnName: string, value: unknown): ColumnNameWithValueAndParameterName {
        const result: ColumnNameWithValueAndParameterName = {
            columnName,
            value,
            parameterName: `$${this.updateColumnsWithValues.length + 1}`,
        };
        this.updateColumnsWithValues.push(result);
        return result;
    }

    override getQueryString(): string {
        const columnNameWithValue = this.updateColumnsWithValues.map(x => `"${x.columnName}"=${x.parameterName}`);
        const setColumnsWithValuesText = this.commaJoin(columnNameWithValue);
        let insertIntoText = `UPDATE "${this.tableName}" SET ${setColumnsWithValuesText}`;
        if (this.whereColumnsWithValues.length > 0) {
            const whereItems = this.whereColumnsWithValues.map(x => `"${x.columnName}"=${x.parameterName}`).join(' AND ');
            insertIntoText += ` WHERE ${whereItems}`;
        }
        if (this.returningColumnNames.length > 0) {
            const returningColumnsText = this.commaJoin(this.returningColumnNames.map(x => `"${x}"`));
            const returningText = `RETURNING ${returningColumnsText}`;
            insertIntoText += ` ${returningText}`;
        }
        return insertIntoText;
    }
}

export interface ColumnNameWithValue {
    columnName: string;
    value: unknown;
}

export interface ColumnNameWithValueAndParameterName {
    columnName: string;
    parameterName: string;
    value: unknown;
}

export interface ColumnNameWithParameterName {
    columnName: string;
    parameterName: string;
}
