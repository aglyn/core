/**
 * @license
 * Copyright 2026 Aglyn LLC
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
'use client'

import { resolveTenantEntitlements, UNLIMITED } from '@aglyn/aglyn'
import { Alert, Button } from '@mui/material'
import { collection, doc, getCountFromServer, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { useFirestore } from 'reactfire'
import { buildRoute, Route } from '../constants/route-links'
import useCurrentTenant from '../hooks/use-current-tenant'

export interface QuotaWarningsBannerProps {
  hostId: string
}

interface QuotaState {
  label: string
  used: number
  limit: number
}

/**
 * Quota warnings (Metering v2, AGL-98): one banner on the host dashboard
 * when any plan quota crosses 80% (warning) or 100% (error), linking to
 * Billing. Consistent with the dark-launch rule, tenants without an
 * explicit plan see nothing — quotas aren't enforced for them.
 */
export function QuotaWarningsBanner(props: QuotaWarningsBannerProps) {
  const { hostId } = props
  const firestore = useFirestore()
  const { tenant } = useCurrentTenant()
  const [quotas, setQuotas] = useState<QuotaState[]>([])

  const plan = tenant?.plan
  useEffect(() => {
    if (!plan) return
    let active = true
    const entitlements = resolveTenantEntitlements(tenant)
    void Promise.all([
      getCountFromServer(
        collection(firestore, 'hosts', hostId, 'screens'),
      ).catch(() => null),
      getDoc(doc(firestore, 'hosts', hostId, 'counters', 'media')).catch(
        () => null,
      ),
    ]).then(([screens, media]) => {
      if (!active) return
      const mediaBytes = media?.exists() ? (media.data()?.bytes ?? 0) : 0
      setQuotas([
        {
          label: 'screens',
          used: screens?.data().count ?? 0,
          limit: entitlements.screensPerHost,
        },
        {
          label: 'storage',
          used: mediaBytes / (1024 * 1024),
          limit: entitlements.storagePerHostMb,
        },
      ])
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, hostId, plan])

  if (!plan) return null
  const breached = quotas.filter(
    (quota) =>
      quota.limit !== UNLIMITED &&
      quota.limit > 0 &&
      quota.used / quota.limit >= 0.8,
  )
  if (!breached.length) return null
  const exceeded = breached.some((quota) => quota.used >= quota.limit)
  const names = breached.map((quota) => quota.label).join(' and ')

  return (
    <Alert
      severity={exceeded ? 'error' : 'warning'}
      sx={{ mb: 2 }}
      action={
        <Button
          color="inherit"
          size="small"
          href={buildRoute(Route.MANAGE_BILLING)}
        >
          {'View plans'}
        </Button>
      }
    >
      {exceeded
        ? `This site has reached its ${names} limit — upgrade to keep adding.`
        : `This site is above 80% of its ${names} quota.`}
    </Alert>
  )
}
QuotaWarningsBanner.displayName = 'QuotaWarningsBanner'

export default QuotaWarningsBanner
