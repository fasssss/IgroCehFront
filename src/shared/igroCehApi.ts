import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { igroCehApiBaseUrl } from 'root/shared/constants';

// Define a service using a base URL and expected endpoints
export const igroCehApi = createApi({
  reducerPath: 'igroCehApi',
  baseQuery: fetchBaseQuery({ baseUrl: igroCehApiBaseUrl }),
  endpoints: () => ({}),
})



export const igroCehApiReducer = igroCehApi.reducer;
export const igroCehApiMiddleware = igroCehApi.middleware;