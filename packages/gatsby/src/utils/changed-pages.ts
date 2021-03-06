import { boundActionCreators } from "../redux/actions"
const { deletePage, deleteComponentsDependencies } = boundActionCreators

import { isEqualWith, IsEqualCustomizer } from "lodash"
import { IGatsbyPage } from "../redux/types"

export function deleteUntouchedPages(
  currentPages: Map<string, IGatsbyPage>,
  timeBeforeApisRan: number
): string[] {
  const deletedPages: string[] = []

  // Delete pages that weren't updated when running createPages.
  currentPages.forEach(page => {
    if (
      !page.isCreatedByStatefulCreatePages &&
      page.updatedAt < timeBeforeApisRan &&
      page.path !== `/404.html`
    ) {
      deleteComponentsDependencies([page.path])
      deletePage(page)
      deletedPages.push(page.path, `/page-data${page.path}`)
    }
  })
  return deletedPages
}

export function findChangedPages(
  oldPages: Map<string, IGatsbyPage>,
  currentPages: Map<string, IGatsbyPage>
): {
  changedPages: string[]
  deletedPages: string[]
} {
  const changedPages: string[] = []

  const compareWithoutUpdated: IsEqualCustomizer = (_left, _right, key) =>
    key === `updatedAt` || undefined

  currentPages.forEach((newPage, path) => {
    const oldPage = oldPages.get(path)
    if (!oldPage || !isEqualWith(newPage, oldPage, compareWithoutUpdated)) {
      changedPages.push(path)
    }
  })
  const deletedPages: string[] = []
  oldPages.forEach((_page, key) => {
    if (!currentPages.has(key)) {
      deletedPages.push(key)
    }
  })

  return { changedPages, deletedPages }
}
