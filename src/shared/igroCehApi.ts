import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { igroCehApiBaseUrl } from 'root/shared/constants';

const baseQuery = fetchBaseQuery({ baseUrl: igroCehApiBaseUrl, credentials: 'include' })

// any 401 makes the user query refetch, its failure redirects to the login page (see Layout)
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions)
  if (result.error?.status === 401 && api.endpoint !== 'getUserObject') {
    api.dispatch(igroCehApi.util.invalidateTags(['User']));
  }
  return result
}

export const igroCehApi = createApi({
  reducerPath: 'igroCehApi',
  baseQuery: baseQueryWithReauth,
  // ReviewLists covers the reviews of a player, the reviews to write or answer and the community reviews
  tagTypes: ['User', 'Event', 'Review', 'ReviewLists', 'NewcomerPool', 'GlobalEvent', 'SteamProfile', 'GlobalEventClaims', 'Badge'],
  endpoints: () => ({}),
})

export const isUnauthorizedError = (error: unknown) =>
  typeof error === 'object' && error !== null && 'status' in error && error.status === 401;

export const isConflictError = (error: unknown) =>
  typeof error === 'object' && error !== null && 'status' in error && error.status === 409;

export const igroCehApiReducer = igroCehApi.reducer;
export const igroCehApiMiddleware = igroCehApi.middleware;
