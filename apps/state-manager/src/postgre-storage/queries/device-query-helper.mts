// INSERT INTO table_name (column1, column2, ...)
// VALUES (value1, value2, ...)
// ON CONFLICT (conflict_column)
// DO NOTHING | DO UPDATE SET column1 = value1, column2 = value2, ...;

export class DeviceQueryHelper {
    public readonly getAllDevicesQueryText = `
        SELECT 
            id,
            certificate_thumbprint,
            ip_address,
            name,
            description,
            created_at,
            approved,
            enabled,
            device_group_id
        FROM device
    `;

    // private readonly getDeviceStatusQueryText = `
    //     SELECT 
    //         device_id,
    //         started,
    //         start_reason,
    //         started_at,
    //         stopped_at,
    //         total
    //     FROM device_status
    //     WHERE device_id = $1
    // `;
}
