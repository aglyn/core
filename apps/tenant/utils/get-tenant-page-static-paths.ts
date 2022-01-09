/**
 * @license
 * Copyright 2022 Aglyn LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {GetStaticPaths, GetStaticPathsContext, GetStaticPathsResult} from 'next/types'
import type {ParsedUrlQuery} from 'querystring'
import {mockDB, type TenantSite} from '../constants/mock-data'


export interface StaticPaths extends ParsedUrlQuery, TenantSite {}

/**
 * @see {@link https://vercel.com/docs/concepts/next.js/incremental-static-regeneration#generating-paths|Generating paths for ISR}
 * @param context
 */
export const getTenantPageStaticPaths: GetStaticPaths = async (
  context: GetStaticPathsContext,
): Promise<GetStaticPathsResult<StaticPaths>> => {
  function mapTenants(sites: TenantSite[]) {
    const mapPages = (pages, host) =>
      pages.map((pg) => ({
        params: {host, page: pg.split('/').filter((i) => Boolean(i))},
      }))
    return sites.reduce((prev, {subdomain, customDomain, pages}) => ([
      ...prev,
      ...mapPages(pages, subdomain),
      ...(customDomain ? mapPages(pages, customDomain) : []),
    ]), [])
  }

  // build paths for each of the sites in the previous two lists
  const paths = mapTenants(mockDB)

  return {
    paths: paths,
    fallback: "blocking", // ISR server-render if static cache is not available
  }
}
export default getTenantPageStaticPaths
