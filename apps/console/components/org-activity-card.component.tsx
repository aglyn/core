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

import { CardDisplay } from '@aglyn/shared-ui-jsx'
import {
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material'
import { collection, limit, query } from 'firebase/firestore'
import { useMemo } from 'react'
import { useFirestore } from '@aglyn/tenant-feature-instance'
import useFirestoreCollection from '../hooks/use-firestore-collection'

export interface OrgActivityCardProps {
  orgId: string
  max?: number
  header?: string
}

/**
 * Org-level counterpart to `HostActivityCard` (AGL-118): newest-first feed
 * from `orgs/{orgId}/activity`, populated by the org settings/members/
 * invites API routes.
 */
export function OrgActivityCard(props: OrgActivityCardProps) {
  const { orgId, max = 20, header = 'Recent Activity' } = props
  const firestore = useFirestore()
  const { data: entries } = useFirestoreCollection<any>(
    () => query(collection(firestore, 'orgs', orgId, 'activity'), limit(200)),
    [firestore, orgId],
    { idField: '$id' },
  )
  const items = useMemo(
    () =>
      [...(entries ?? [])]
        .sort(
          (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0),
        )
        .slice(0, max),
    [entries, max],
  )

  return (
    <CardDisplay
      header={header}
      contentGutterX
      contentGutterY
      contentBordered="all"
    >
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {'No activity yet — changes made in the console appear here.'}
        </Typography>
      ) : (
        <List dense disablePadding>
          {items.map((entry) => (
            <ListItem key={entry.$id} disableGutters dense>
              <ListItemText
                primary={entry.action}
                secondary={`${entry.actorEmail ?? 'Someone'} · ${
                  entry.createdAt?.toDate?.().toLocaleString() ?? ''
                }`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </CardDisplay>
  )
}
OrgActivityCard.displayName = 'OrgActivityCard'

export default OrgActivityCard
