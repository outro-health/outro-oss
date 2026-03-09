export type HelpScoutDocsConfig = {
  apiKey: string
}

export type DocsItem = Record<string, unknown>

export type DocsListResponse<T extends DocsItem = DocsItem> = {
  page?: number
  pages?: number
  count?: number
  items?: T[]
}

export type Site = DocsItem & {
  id?: string
  status?: string
  subDomain?: string
  cname?: string
  title?: string
}

export type Collection = DocsItem & {
  id?: string
  siteId?: string
  number?: number
  slug?: string
  name?: string
  visibility?: string
  order?: number
  description?: string
}

export type Category = DocsItem & {
  id?: string
  collectionId?: string
  number?: number
  slug?: string
  name?: string
  visibility?: string
  order?: number
  defaultSort?: string
}

export type Article = DocsItem & {
  id?: string
  collectionId?: string
  number?: number
  slug?: string
  name?: string
  text?: string
  status?: string
  visibility?: string
  categories?: string[]
  related?: string[]
  keywords?: string[]
}

export type Visibility = "public" | "private"
export type ArticleStatus = "published" | "notpublished"
export type ArticleListStatus = "all" | "published" | "notpublished"
export type SortOrder = "asc" | "desc"
export type ArticleSort =
  | "order"
  | "number"
  | "status"
  | "name"
  | "popularity"
  | "createdAt"
  | "updatedAt"
export type CategoryDefaultSort = "popularity" | "name"

export type CreateCollectionInput = {
  siteId: string
  name: string
  visibility?: Visibility
  order?: number
  description?: string
  reload?: boolean
}

export type UpdateCollectionInput = {
  name?: string
  visibility?: Visibility
  order?: number
  description?: string
  reload?: boolean
}

export type CreateCategoryInput = {
  collectionId: string
  name: string
  slug?: string
  visibility?: Visibility
  order?: number
  defaultSort?: CategoryDefaultSort
  reload?: boolean
}

export type UpdateCategoryInput = {
  name?: string
  slug?: string
  visibility?: Visibility
  order?: number
  defaultSort?: CategoryDefaultSort
  reload?: boolean
}

export type ListArticlesInput = {
  collectionId?: string
  categoryId?: string
  page?: number
  pageSize?: number
  status?: ArticleListStatus
  sort?: ArticleSort
  order?: SortOrder
}

export type SearchArticlesInput = {
  query: string
  page?: number
  collectionId?: string
  siteId?: string
  status?: ArticleListStatus
  visibility?: "all" | Visibility
}

export type CreateArticleInput = {
  collectionId: string
  name: string
  text: string
  status?: ArticleStatus
  slug?: string
  categories?: string[] | null
  related?: string[] | null
  keywords?: string[] | null
  reload?: boolean
}

export type UpdateArticleInput = {
  status?: ArticleStatus
  slug?: string
  name?: string
  text?: string
  categories?: string[] | null
  related?: string[] | null
  keywords?: string[] | null
  reload?: boolean
}
