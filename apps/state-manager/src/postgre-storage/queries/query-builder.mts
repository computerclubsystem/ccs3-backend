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

    getParameterValues(): any[] {
        return [...this.getUpdateColumnsWithValues().map(x => x.value), ...this.whereColumnsWithValues.map(x => x.value)];
    }

    addWhereParameterColumnNameWithValue(columnName: string, value: any): ColumnNameWithValueAndParameterName {
        const result: ColumnNameWithValueAndParameterName = {
            columnName,
            value,
            parameterName: `$${this.updateColumnsWithValues.length + this.whereColumnsWithValues.length + 1}`,
        };
        this.whereColumnsWithValues.push(result);
        return result;
    }

    addUpdateColumnNameWithValue(columnName: string, value: any): ColumnNameWithValueAndParameterName {
        const result: ColumnNameWithValueAndParameterName = {
            columnName,
            value,
            parameterName: `$${this.updateColumnsWithValues.length + 1}`,
        }
        this.updateColumnsWithValues.push(result);
        return result;
    }

    override getQueryString(): string {
        const columnNameWithValue = this.updateColumnsWithValues.map((x, index) => `"${x.columnName}"=${x.parameterName}`);
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
    value: any;
}

export interface ColumnNameWithValueAndParameterName {
    columnName: string;
    parameterName: string;
    value: any;
}
