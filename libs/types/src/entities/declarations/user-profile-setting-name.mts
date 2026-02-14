import { ValueOf } from "src/declarations.mjs";

export const UserProfileSettingName = {
    customCss: 'custom_css',
    computerStatusesLayoutRowsCount: 'computer_statuses_layout_rows_count',
    language: 'language',
    actionsAndOptionsButtonsPlacement: `actions_and_options_buttons_placement`,
} as const;
export type UserProfileSettingName = ValueOf<typeof UserProfileSettingName>;