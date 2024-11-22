export const igroCehApiBaseUrl: string = import.meta.env.VITE_IGRO_CEH_API;
export const igroCehWebSocketBaseUrl: string = import.meta.env.VITE_IGRO_CEH_WEB_SOCKET;

export const EVENT_STATUS = [
    'Players registration',
    'Players shuffle',
    'Guessing games',
    'Revealing games',
    'Active',
    'Finished'
]

export const EVENT_STATUS_COLOR: { [x:string]: "error" | "success" | "warning" } = {
    [EVENT_STATUS[0]]: 'warning' as 'warning',
    [EVENT_STATUS[1]]: 'warning' as 'warning',
    [EVENT_STATUS[2]]: 'warning' as 'warning',
    [EVENT_STATUS[3]]: 'warning' as 'warning',
    [EVENT_STATUS[4]]: 'success' as 'success',
    [EVENT_STATUS[5]]: 'error' as 'error',
}