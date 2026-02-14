import { ValueOf } from "src/declarations.mjs";

export const SystemSettingType = {
    integer: 'integer',
    number: 'number',
    text: 'text',
    dateTime: 'dateTime'
} as const;
export type SystemSettingType = ValueOf<typeof SystemSettingType>;
