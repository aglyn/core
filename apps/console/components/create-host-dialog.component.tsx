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

import { useSnackbar } from '@aglyn/shared-ui-snackstack'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { useUser } from 'reactfire'
import { buildRoute, Route } from '../constants/route-links'

const SUBDOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]{2,29}$/

export interface CreateHostDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * Create-a-host dialog (user request 2026-07-07): posts to /api/hosts/create
 * (server enforces subdomain uniqueness + the hostLimit quota) and lands on
 * the new host's Setup page.
 */
export function CreateHostDialog(props: CreateHostDialogProps) {
  const { open, onClose } = props
  const router = useRouter()
  const { data: user } = useUser()
  const { enqueueSnackbar } = useSnackbar()
  const [name, setName] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [busy, setBusy] = useState(false)
  const validSubdomain = SUBDOMAIN_PATTERN.test(subdomain)

  const handleCreate = useCallback(async () => {
    if (!name.trim() || !validSubdomain || busy) return
    setBusy(true)
    try {
      const idToken = await (user as any)?.getIdToken?.()
      const response = await fetch('/api/hosts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ displayName: name.trim(), subdomain }),
      })
      const payload = await response.json()
      if (!response.ok || !payload?.hostId) {
        return void enqueueSnackbar(payload?.error ?? 'Host creation failed', {
          variant: response.status === 409 ? 'warning' : 'error',
          allowDuplicate: true,
        })
      }
      enqueueSnackbar(`Created "${name.trim()}"`, {
        variant: 'success',
        persist: false,
      })
      void router.push(
        buildRoute(Route.HOST_SETUP, { hostId: payload.hostId }),
      )
    } catch (error) {
      console.error(error)
      enqueueSnackbar('An error has occurred', {
        variant: 'error',
        allowDuplicate: true,
      })
    } finally {
      setBusy(false)
    }
  }, [name, subdomain, validSubdomain, busy, user, router, enqueueSnackbar])

  return (
    <Dialog
      open={open}
      onClose={() => (busy ? null : onClose())}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{'Create a new site'}</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
      >
        <Typography variant="body2" color="text.secondary">
          {'Your site goes live on its Aglyn subdomain immediately; connect ' +
            'a custom domain any time from Setup.'}
        </Typography>
        <TextField
          label="Site name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          size="small"
          autoFocus
        />
        <TextField
          label="Subdomain"
          value={subdomain}
          onChange={(event) =>
            setSubdomain(event.target.value.toLowerCase())
          }
          error={Boolean(subdomain) && !validSubdomain}
          helperText={
            Boolean(subdomain) && !validSubdomain
              ? '3–30 chars: lowercase letters, digits, dashes'
              : ' '
          }
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">{'.aglyn.app'}</InputAdornment>
              ),
            },
          }}
          size="small"
        />
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose}>
          {'Cancel'}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          disabled={!name.trim() || !validSubdomain || busy}
          onClick={handleCreate}
        >
          {busy ? 'Creating…' : 'Create site'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
CreateHostDialog.displayName = 'CreateHostDialog'

export default CreateHostDialog
