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

import * as Aglyn from '@aglyn/aglyn'
import { CardDisplay, useConfirmationContext } from '@aglyn/shared-ui-jsx'
import { useSnackbar } from '@aglyn/shared-ui-snackstack'
import { Timestamp } from '@aglyn/shared-util-timestamp'
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import {
  collection,
  doc,
  limit,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { useCallback, useMemo, useState } from 'react'
import { useFirestore } from '@aglyn/tenant-feature-instance'
import useFirestoreCollection from '../../hooks/use-firestore-collection'
import ProductEditorDialog from './product-editor-dialog.component'

export interface ProductsHubCardProps {
  hostId: string
}

type ProductRow = Aglyn.HostProduct & { $id: string }

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning'> = {
  active: 'success',
  draft: 'warning',
  archived: 'default',
}

/**
 * Products hub v1 (AGL-279): the catalog manager replacing the Commerce
 * Starter card — search + status filter over `hosts/{hostId}/products`,
 * full editor dialog, duplicate, archive/activate, soft delete (past
 * order rows keep resolving). Product cap enforced per plan (AGL-278) by
 * the storefront APIs; the hub shows the count.
 */
export function ProductsHubCard(props: ProductsHubCardProps) {
  const { hostId } = props
  const firestore = useFirestore()
  const { enqueueSnackbar } = useSnackbar()
  const { confirm } = useConfirmationContext()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editing, setEditing] = useState<ProductRow | null>(null)
  const [creating, setCreating] = useState(false)

  const { data: productDocs } = useFirestoreCollection<any>(
    () =>
      query(collection(firestore, 'hosts', hostId, 'products'), limit(500)),
    [firestore, hostId],
    { idField: '$id' },
  )
  const products = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return [...(productDocs ?? [])]
      .filter((product: any) => !product.deletedAt)
      .map((product: any) => ({
        ...Aglyn.liftLegacyProduct(product),
        $id: product.$id,
      }))
      .filter((product: ProductRow) => {
        if (statusFilter !== 'all' && product.status !== statusFilter) {
          return false
        }
        if (!needle) return true
        return (
          product.name.toLowerCase().includes(needle) ||
          product.slug.includes(needle) ||
          (product.tags ?? []).some((tag) =>
            tag.toLowerCase().includes(needle),
          ) ||
          product.variants.some((variant) =>
            variant.sku?.toLowerCase().includes(needle),
          )
        )
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [productDocs, search, statusFilter])

  const handleDuplicate = useCallback(
    (product: ProductRow) => async () => {
      const id = Aglyn.createResourceUid()
      const { $id: _sourceId, ...copy } = product
      await setDoc(doc(firestore, 'hosts', hostId, 'products', id), {
        ...copy,
        name: `${product.name} (copy)`,
        slug: Aglyn.commerceSlug(`${product.slug}-copy`),
        status: 'draft',
        createdAtMs: Date.now(),
        updatedAtMs: Date.now(),
        updatedAt: Timestamp.now(),
      })
      enqueueSnackbar('Product duplicated as draft', {
        variant: 'success',
        persist: false,
      })
    },
    [firestore, hostId, enqueueSnackbar],
  )

  const handleStatus = useCallback(
    (product: ProductRow, status: Aglyn.ProductStatus) => async () => {
      await updateDoc(doc(firestore, 'hosts', hostId, 'products', product.$id), {
        status,
        updatedAtMs: Date.now(),
        updatedAt: Timestamp.now(),
      })
    },
    [firestore, hostId],
  )

  const handleDelete = useCallback(
    (product: ProductRow) => async () => {
      const confirmed = await confirm({
        title: 'Delete this product?',
        description:
          `"${product.name}" stops being purchasable; blocks referencing ` +
          'it show a checkout error until repointed.',
        confirmationText: 'Delete',
        confirmationButtonProps: { color: 'error' },
      })
        .then(() => true)
        .catch(() => false)
      if (!confirmed) return
      await updateDoc(doc(firestore, 'hosts', hostId, 'products', product.$id), {
        deletedAt: Timestamp.now(),
      })
      enqueueSnackbar('Product deleted', { variant: 'success', persist: false })
    },
    [confirm, firestore, hostId, enqueueSnackbar],
  )

  const formatPrice = (product: ProductRow) => {
    const [min, max] = Aglyn.productPriceRange(product)
    return min === max ? `$${min}` : `$${min}–$${max}`
  }
  const formatStock = (product: ProductRow) => {
    const total = Aglyn.productInventory(product)
    if (total == null) return '—'
    return total > 0 ? String(total) : 'Sold out'
  }

  return (
    <CardDisplay
      header={`Products${products.length ? ` (${products.length})` : ''}`}
      contentGutterX
      contentGutterY
    >
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            label="Search"
            placeholder="Name, slug, tag, or SKU"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
          <TextField
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            size="small"
            select
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="all">{'All'}</MenuItem>
            <MenuItem value="active">{'Active'}</MenuItem>
            <MenuItem value="draft">{'Draft'}</MenuItem>
            <MenuItem value="archived">{'Archived'}</MenuItem>
          </TextField>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => setCreating(true)}
          >
            {'Add product'}
          </Button>
        </Stack>
        {products.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {search || statusFilter !== 'all'
              ? 'No products match the current filters.'
              : 'Build your catalog: add a product, then drop commerce ' +
                'blocks on any screen in the besigner.'}
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{'Product'}</TableCell>
                  <TableCell>{'Status'}</TableCell>
                  <TableCell>{'Type'}</TableCell>
                  <TableCell>{'Price'}</TableCell>
                  <TableCell>{'Stock'}</TableCell>
                  <TableCell>{'Variants'}</TableCell>
                  <TableCell align="right">{'Actions'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.$id} hover>
                    <TableCell sx={{ maxWidth: 260 }}>
                      <Typography variant="body2" noWrap>
                        {product.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ display: 'block' }}
                      >
                        {`/${product.slug} · id: ${product.$id}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.status}
                        size="small"
                        color={STATUS_COLOR[product.status] ?? 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{product.type}</TableCell>
                    <TableCell>{formatPrice(product)}</TableCell>
                    <TableCell>{formatStock(product)}</TableCell>
                    <TableCell>{product.variants.length}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Button size="small" onClick={() => setEditing(product)}>
                        {'Edit'}
                      </Button>
                      <Button size="small" onClick={handleDuplicate(product)}>
                        {'Duplicate'}
                      </Button>
                      <Button
                        size="small"
                        onClick={handleStatus(
                          product,
                          product.status === 'archived' ? 'active' : 'archived',
                        )}
                      >
                        {product.status === 'archived' ? 'Activate' : 'Archive'}
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={handleDelete(product)}
                      >
                        {'Delete'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Stack>
      <ProductEditorDialog
        key={editing?.$id ?? (creating ? 'new' : 'closed')}
        hostId={hostId}
        product={editing}
        open={creating || editing !== null}
        onClose={() => {
          setEditing(null)
          setCreating(false)
        }}
      />
    </CardDisplay>
  )
}
ProductsHubCard.displayName = 'ProductsHubCard'

export default ProductsHubCard
