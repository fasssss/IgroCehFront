import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { igroCehApiBaseUrl } from 'root/shared/constants';
import { router } from './router';

// Define a service using a base URL and expected endpoints
const baseQuery = fetchBaseQuery({ baseUrl: igroCehApiBaseUrl })
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)
  if (result.error?.status === 401) {
    router.navigate("/login");
  }
  return result
}

export const igroCehApi = createApi({
  reducerPath: 'igroCehApi',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
})



export const igroCehApiReducer = igroCehApi.reducer;
export const igroCehApiMiddleware = igroCehApi.middleware;