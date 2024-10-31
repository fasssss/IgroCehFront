export const igroCehApiBaseUrl: string = import.meta.env.VITE_IGRO_CEH_API;

export const EVENT_STATUS = [
    'Players registration',
    'Auction',
    'Active',
    'Finished'
]

export const EVENT_STATUS_COLOR: { [x:string]: "error" | "success" | "warning" } = {
    [EVENT_STATUS[0]]: 'warning' as 'warning',
    [EVENT_STATUS[1]]: 'warning' as 'warning',
    [EVENT_STATUS[2]]: 'success' as 'success',
    [EVENT_STATUS[3]]: 'error' as 'error',
}