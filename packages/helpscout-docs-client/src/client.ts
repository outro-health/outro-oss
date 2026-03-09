import type {
  Article,
  Category,
  Collection,
  CreateArticleInput,
  CreateCategoryInput,
  CreateCollectionInput,
  DocsItem,
  DocsListResponse,
  HelpScoutDocsConfig,
  ListArticlesInput,
  SearchArticlesInput,
  Site,
  UpdateArticleInput,
  UpdateCategoryInput,
  UpdateCollectionInput,
} from "./types.js"

const BASE_URL = "https://docsapi.helpscout.net/v1"

type QueryValue = string | number | boolean | undefined | null

function toBasicAuthHeader(apiKey: string): string {
  return `Basic ${btoa(`${apiKey}:X`)}`
}

function toQueryStringValue(value: QueryValue): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === "boolean") return value ? "true" : "false"
  return String(value)
}

/**
 * The Docs API wraps list responses under a named key, e.g.
 * `{ sites: { page, pages, count, items: [...] } }`.
 * This extracts the inner list response from the first object-valued key.
 */
function unwrapListResponse<T extends DocsItem>(
  data: Record<string, unknown> | undefined,
): DocsListResponse<T> {
  if (!data) return {}
  // If the response already has `items` at the top level, return as-is
  if ("items" in data) return data as DocsListResponse<T>
  // Otherwise find the nested wrapper (e.g. "sites", "collections", etc.)
  for (const value of Object.values(data)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as DocsListResponse<T>
    }
  }
  return {}
}

export class HelpScoutDocsClient {
  #config: HelpScoutDocsConfig

  constructor(config: HelpScoutDocsConfig) {
    this.#config = config
  }

  async #request<T>(
    path: string,
    options?: {
      method?: "GET" | "POST" | "PUT" | "DELETE"
      query?: Record<string, QueryValue>
      body?: unknown
    },
  ): Promise<{ data: T | undefined; headers: Headers }> {
    const url = new URL(path, `${BASE_URL}/`)

    for (const [key, value] of Object.entries(options?.query ?? {})) {
      const stringValue = toQueryStringValue(value)
      if (stringValue !== undefined) {
        url.searchParams.set(key, stringValue)
      }
    }

    const response = await fetch(url, {
      method: options?.method ?? "GET",
      headers: {
        Authorization: toBasicAuthHeader(this.#config.apiKey),
        Accept: "application/json",
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    })

    const responseText = await response.text()

    if (!response.ok) {
      const correlationId =
        response.headers.get("Correlation-Id") ??
        response.headers.get("correlation-id")
      const correlationSuffix = correlationId
        ? ` [Correlation-Id: ${correlationId}]`
        : ""

      throw new Error(
        `Help Scout Docs API error (${response.status}) for ${options?.method ?? "GET"} ${url.pathname}${url.search}${correlationSuffix}: ${responseText || response.statusText}`,
      )
    }

    return {
      data: responseText ? (JSON.parse(responseText) as T) : undefined,
      headers: response.headers,
    }
  }

  // --- Sites ---

  async listSites(page?: number): Promise<DocsListResponse<Site>> {
    const { data } = await this.#request<Record<string, unknown>>("sites", {
      query: { page },
    })
    return unwrapListResponse<Site>(data)
  }

  async getSite(siteId: string): Promise<Site | null> {
    const { data } = await this.#request<{ site?: Site }>(`sites/${siteId}`)
    return data?.site ?? null
  }

  // --- Collections ---

  async listCollections(page?: number): Promise<DocsListResponse<Collection>> {
    const { data } = await this.#request<Record<string, unknown>>(
      "collections",
      { query: { page } },
    )
    return unwrapListResponse<Collection>(data)
  }

  async getCollection(collectionId: string): Promise<Collection | null> {
    const { data } = await this.#request<{ collection?: Collection }>(
      `collections/${collectionId}`,
    )
    return data?.collection ?? null
  }

  async createCollection(
    input: CreateCollectionInput,
  ): Promise<Collection | null> {
    const { data } = await this.#request<{ collection?: Collection }>(
      "collections",
      {
        method: "POST",
        query: { reload: input.reload },
        body: {
          collection: {
            siteId: input.siteId,
            name: input.name,
            visibility: input.visibility,
            order: input.order,
            description: input.description,
          },
        },
      },
    )
    return data?.collection ?? null
  }

  async updateCollection(
    collectionId: string,
    input: UpdateCollectionInput,
  ): Promise<Collection | null> {
    const { data } = await this.#request<{ collection?: Collection }>(
      `collections/${collectionId}`,
      {
        method: "PUT",
        query: { reload: input.reload },
        body: {
          collection: {
            name: input.name,
            visibility: input.visibility,
            order: input.order,
            description: input.description,
          },
        },
      },
    )
    return data?.collection ?? null
  }

  async deleteCollection(collectionId: string): Promise<void> {
    await this.#request<undefined>(`collections/${collectionId}`, {
      method: "DELETE",
    })
  }

  // --- Categories ---

  async listCategories(
    collectionId: string,
    page?: number,
  ): Promise<DocsListResponse<Category>> {
    const { data } = await this.#request<Record<string, unknown>>(
      `collections/${collectionId}/categories`,
      { query: { page } },
    )
    return unwrapListResponse<Category>(data)
  }

  async getCategory(categoryId: string): Promise<Category | null> {
    const { data } = await this.#request<{ category?: Category }>(
      `categories/${categoryId}`,
    )
    return data?.category ?? null
  }

  async createCategory(input: CreateCategoryInput): Promise<Category | null> {
    const { data } = await this.#request<{ category?: Category }>(
      "categories",
      {
        method: "POST",
        query: { reload: input.reload },
        body: {
          category: {
            collectionId: input.collectionId,
            name: input.name,
            slug: input.slug,
            visibility: input.visibility,
            order: input.order,
            defaultSort: input.defaultSort,
          },
        },
      },
    )
    return data?.category ?? null
  }

  async updateCategory(
    categoryId: string,
    input: UpdateCategoryInput,
  ): Promise<Category | null> {
    const { data } = await this.#request<{ category?: Category }>(
      `categories/${categoryId}`,
      {
        method: "PUT",
        query: { reload: input.reload },
        body: {
          category: {
            name: input.name,
            slug: input.slug,
            visibility: input.visibility,
            order: input.order,
            defaultSort: input.defaultSort,
          },
        },
      },
    )
    return data?.category ?? null
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await this.#request<undefined>(`categories/${categoryId}`, {
      method: "DELETE",
    })
  }

  // --- Articles ---

  async listArticles(
    input: ListArticlesInput,
  ): Promise<DocsListResponse<Article>> {
    const path = input.collectionId
      ? `collections/${input.collectionId}/articles`
      : `categories/${input.categoryId}/articles`

    const { data } = await this.#request<Record<string, unknown>>(path, {
      query: {
        page: input.page,
        pageSize: input.pageSize,
        status: input.status,
        sort: input.sort,
        order: input.order,
      },
    })
    return unwrapListResponse<Article>(data)
  }

  async searchArticles(
    input: SearchArticlesInput,
  ): Promise<DocsListResponse<Article>> {
    const { data } = await this.#request<Record<string, unknown>>(
      "search/articles",
      {
        query: {
          query: input.query,
          page: input.page,
          collectionId: input.collectionId,
          siteId: input.siteId,
          status: input.status,
          visibility: input.visibility,
        },
      },
    )
    return unwrapListResponse<Article>(data)
  }

  async getArticle(articleId: string): Promise<Article | null> {
    const { data } = await this.#request<{ article?: Article }>(
      `articles/${articleId}`,
    )
    return data?.article ?? null
  }

  async createArticle(input: CreateArticleInput): Promise<Article | null> {
    const { data } = await this.#request<{ article?: Article }>("articles", {
      method: "POST",
      query: { reload: input.reload },
      body: {
        article: {
          collectionId: input.collectionId,
          status: input.status,
          slug: input.slug,
          name: input.name,
          text: input.text,
          categories: input.categories,
          related: input.related,
          keywords: input.keywords,
        },
      },
    })
    return data?.article ?? null
  }

  async updateArticle(
    articleId: string,
    input: UpdateArticleInput,
  ): Promise<Article | null> {
    const { data } = await this.#request<{ article?: Article }>(
      `articles/${articleId}`,
      {
        method: "PUT",
        query: { reload: input.reload },
        body: {
          article: {
            status: input.status,
            slug: input.slug,
            name: input.name,
            text: input.text,
            categories: input.categories,
            related: input.related,
            keywords: input.keywords,
          },
        },
      },
    )
    return data?.article ?? null
  }

  async deleteArticle(articleId: string): Promise<void> {
    await this.#request<undefined>(`articles/${articleId}`, {
      method: "DELETE",
    })
  }
}
