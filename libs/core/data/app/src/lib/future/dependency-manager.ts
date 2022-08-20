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

import { ImmutableSlightlyDeep } from '@aglyn/shared-data-types'

export type AglynDependencyUid = string

export enum AglynDependencyStatus {
  WAITING = 'waiting',
  LOADING = 'loading',
  LOADED = 'loaded',
  UNLOADING = 'unloading',
}

export type AglynDependencyStatuses = Record<
  AglynDependencyUid,
  AglynDependencyStatus
>
export type AglynDependenciesById = Record<AglynDependencyUid, AglynDependency>
export type AglynDependencyDependencies = Record<AglynDependencyUid, true>
export type AglynDependents = Record<AglynDependencyUid, true>
export type AglynDependencyDependents = Record<
  AglynDependencyUid,
  AglynDependents
>

export interface AglynDependency {
  namespace: AglynDependencyUid
  dependencies?: AglynDependencyDependencies
  load(...args: any[]): void
  destroy(...args: any[]): void
}

export interface AglynDependencyMap {
  statusByDependencyId: AglynDependencyStatuses
  dependentsByDependencyId: AglynDependencyDependents
  __: AglynDependenciesById
}

export default class DependencyManager {
  readonly #dependencies: AglynDependencyMap = {
    statusByDependencyId: {},
    dependentsByDependencyId: {},
    __: {},
  }

  public get dependencies(): ImmutableSlightlyDeep<AglynDependencyMap> {
    const { statusByDependencyId, dependentsByDependencyId, __ } =
      this.#dependencies
    return {
      statusByDependencyId: { ...statusByDependencyId },
      dependentsByDependencyId: { ...dependentsByDependencyId },
      __: { ...__ },
    }
  }

  //region Private Methods
  #dependency(dependencyId: AglynDependencyUid): AglynDependency | undefined {
    return this.dependencies.__[dependencyId]
  }
  #dependents(dependencyId: AglynDependencyUid): AglynDependents | undefined {
    return this.dependencies.dependentsByDependencyId[dependencyId]
  }
  #dependencyStatus(
    dependencyId: AglynDependencyUid,
  ): AglynDependencyStatus | undefined {
    return this.dependencies.statusByDependencyId[dependencyId]
  }
  #hasDependency(dependencyId: AglynDependencyUid): boolean {
    return Boolean(dependencyId && this.#dependency(dependencyId))
  }
  #dependencyWaiting(dependencyId: AglynDependencyUid): boolean {
    return (
      this.#dependencyStatus(dependencyId) === AglynDependencyStatus.WAITING
    )
  }
  #dependencyLoading(dependencyId: AglynDependencyUid): boolean {
    return (
      this.#dependencyStatus(dependencyId) === AglynDependencyStatus.LOADING
    )
  }
  #dependencyLoaded(dependencyId: AglynDependencyUid): boolean {
    return this.#dependencyStatus(dependencyId) === AglynDependencyStatus.LOADED
  }
  #dependencyUnloading(dependencyId: AglynDependencyUid): boolean {
    return (
      this.#dependencyStatus(dependencyId) === AglynDependencyStatus.UNLOADING
    )
  }
  #allDependenciesLoaded(dependentId: AglynDependencyUid): boolean {
    for (const dependencyId of Object.keys(
      this.#dependency(dependentId)?.dependencies || {},
    )) {
      if (!this.#dependencyLoaded(dependencyId)) {
        return false
      }
    }
    return true
  }
  #setSelfDependencyProperties(
    dependencyId: AglynDependencyUid,
    dependency: AglynDependency,
  ): this {
    this.#dependencies.statusByDependencyId[dependencyId] =
      AglynDependencyStatus.WAITING
    this.#dependencies.dependentsByDependencyId[dependencyId] ||= {}
    this.#dependencies.__[dependencyId] = dependency
    return this
  }
  #setSelfDependencyDependents(dependencyId: AglynDependencyUid): this {
    for (const dependentId of Object.keys(
      this.#dependency(dependencyId)?.dependencies || {},
    )) {
      const dependents = (this.#dependencies.dependentsByDependencyId[
        dependentId
      ] ||= {})
      dependents[dependencyId] = true
    }
    return this
  }
  #loadDependencyDependents(dependencyId: AglynDependencyUid): this {
    for (const dependentId of Object.keys(
      this.#dependents(dependencyId) || {},
    )) {
      if (!this.#dependencyLoaded(dependentId)) {
        this.#handleLoadingDependencyAndDependents(dependentId)
      }
    }
    return this
  }
  #loadDependency(dependencyId: AglynDependencyUid): this {
    if (this.#dependencyWaiting(dependencyId)) {
      this.#dependencies.statusByDependencyId[dependencyId] =
        AglynDependencyStatus.LOADING
      this.#dependency(dependencyId)?.load?.()
      this.#dependencies.statusByDependencyId[dependencyId] =
        AglynDependencyStatus.LOADED
    }
    return this
  }
  #unloadDependencyDependents(dependencyId: AglynDependencyUid): this {
    for (const dependentId of Object.keys(
      this.#dependents(dependencyId) || {},
    )) {
      this.#handleUnloadingDependencyAndDependents(dependentId)
    }
    return this
  }
  #unloadDependency(dependencyId: AglynDependencyUid): this {
    if (this.#dependencyLoaded(dependencyId)) {
      this.#dependencies.statusByDependencyId[dependencyId] =
        AglynDependencyStatus.UNLOADING
      this.#dependency(dependencyId)?.destroy?.()
      this.#dependencies.statusByDependencyId[dependencyId] =
        AglynDependencyStatus.WAITING
    }
    return this
  }
  #removeSelfDependencyProperties(dependencyId: AglynDependencyUid): this {
    delete this.#dependencies.dependentsByDependencyId[dependencyId]
    delete this.#dependencies.statusByDependencyId[dependencyId]
    delete this.#dependencies.__[dependencyId]
    return this
  }
  #removeSelfDependencyDependents(dependencyId: AglynDependencyUid): this {
    for (const dependentId of Object.keys(
      this.#dependency(dependencyId)?.dependencies || {},
    )) {
      delete this.#dependencies.dependentsByDependencyId[dependentId]?.[
        dependencyId
      ]
    }
    return this
  }

  #handleAddingDependencyAndDependents(
    dependencyId: AglynDependencyUid,
    dependency: AglynDependency,
  ): this {
    if (!dependency) throw new Error('Invalid dependency')
    if (!dependencyId) throw new Error('Invalid dependencyId')
    /**
     * Set properties on local dependencies object
     */
    this.#setSelfDependencyProperties(dependencyId, dependency)
    /**
     * Set dependencies' dependent relationships
     */
    this.#setSelfDependencyDependents(dependencyId)
    /**
     * Load applicable dependencies
     */
    this.#handleLoadingDependencyAndDependents(dependencyId)
    return this
  }
  #handleLoadingDependencyAndDependents(
    dependencyId: AglynDependencyUid,
  ): this {
    if (!this.#hasDependency(dependencyId)) return this
    /**
     * Verify all dependencies are loaded
     */
    if (!this.#allDependenciesLoaded(dependencyId)) {
      return this
    }
    /**
     * Load the self dependency
     */
    this.#loadDependency(dependencyId)
    /**
     * Load waiting dependents
     */
    this.#loadDependencyDependents(dependencyId)
    return this
  }
  #handleUnloadingDependencyAndDependents(
    dependencyId: AglynDependencyUid,
  ): this {
    if (!this.#hasDependency(dependencyId)) return this
    /**
     * Unload all dependents of the dependency
     */
    this.#unloadDependencyDependents(dependencyId)
    /**
     * Unload self dependency
     */
    this.#unloadDependency(dependencyId)
    return this
  }
  #handleRemovingDependencyAndDependents(
    dependencyId: AglynDependencyUid,
  ): this {
    if (!this.#hasDependency(dependencyId)) return this
    /**
     * Unload dependency and its dependents
     */
    this.#handleUnloadingDependencyAndDependents(dependencyId)

    /**
     * Remove dependencies dependent relationships
     */
    this.#removeSelfDependencyDependents(dependencyId)

    /**
     * Remove self from local dependencies property
     */
    this.#removeSelfDependencyProperties(dependencyId)
    return this
  }
  //endregion

  //region Public Methods
  /**
   * Check if the dependency has 'waiting' status
   */
  public dependencyWaiting(dependencyId: AglynDependencyUid): boolean {
    return this.#dependencyWaiting(dependencyId)
  }
  /**
   * Check if the dependency has 'loading' status
   */
  public dependencyLoading(dependencyId: AglynDependencyUid): boolean {
    return this.#dependencyLoading(dependencyId)
  }
  /**
   * Check if the dependency has 'loaded' status
   */
  public dependencyLoaded(dependencyId: AglynDependencyUid): boolean {
    return this.#dependencyLoaded(dependencyId)
  }
  /**
   * Check if the dependency has 'unloaded' status
   */
  public dependencyUnloading(dependencyId: AglynDependencyUid): boolean {
    return this.#dependencyUnloading(dependencyId)
  }
  /**
   * Get a copy of the local dependency object
   */
  public dependency(
    dependencyId: AglynDependencyUid,
  ): Readonly<AglynDependency> | undefined {
    const dependency = this.#dependency(dependencyId)
    return dependency ? { ...dependency } : undefined
  }

  /**
   * Adds a new dependency and if dependencies are loaded it loads, then
   * loads checks all waiting dependencies if they can now load as well.
   * Step 1: Set properties on local dependencies object Step 2: Set
   * dependencies' dependent relationships Step 3: Load dependencies
   * waiting with all requirements met
   */
  public addDependency(dependency: AglynDependency): this {
    return this.#handleAddingDependencyAndDependents(
      dependency?.namespace,
      dependency,
    )
  }

  /**
   * Loads a dependency and its dependents. Do not call unless necessary.
   * Process flow automatically handles loading/unloading dependency when
   * all required dependencies have been loaded for itself. However, if
   * called should be ok as it checks if dependencies are loaded first.
   * Step 1: Verify all dependencies are loaded Step 2: Load the self
   * dependency Step 3: Load waiting dependents
   */
  public loadDependency(id: AglynDependencyUid): this {
    return this.#handleLoadingDependencyAndDependents(id)
  }

  /**
   * Unloads a dependency and its dependents. Do not call unless necessary.
   * Process flow automatically handles loading/unloading dependency when
   * all required dependencies have been unloaded for itself. However, if
   * called should be ok as it checks if dependencies are unloaded first.
   * Step 1: Unload all dependents of the dependency Step 2: Unload self
   * dependency
   */
  public unloadDependency(id: AglynDependencyUid): this {
    return this.#handleUnloadingDependencyAndDependents(id)
  }

  /**
   * Unloads all dependency dependents and then removes the dependency.
   * Step 1: Unload dependency and its dependents
   * Step 2: Remove dependencies dependent relationships
   * Step 3: Remove self from local dependencies property
   */
  public removeDependency(id: AglynDependencyUid): this {
    return this.#handleRemovingDependencyAndDependents(id)
  }
  //endregion
}
