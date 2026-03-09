# @outro-health/helpscout-docs-client

Typed client for the Help Scout Docs API v1. Manage knowledge base sites, collections, categories, and articles. Zero dependencies (uses native `fetch`).

## Install

```sh
yarn add @outro-health/helpscout-docs-client
```

## Usage

```ts
import { HelpScoutDocsClient } from "@outro-health/helpscout-docs-client"

const client = new HelpScoutDocsClient({
  apiKey: process.env.HELP_SCOUT_DOCS_API_KEY,
})
```

### Sites

```ts
const sites = await client.listSites()
const site = await client.getSite("site_id")
```

### Collections

```ts
const collections = await client.listCollections()
const collection = await client.getCollection("collection_id")

await client.createCollection({
  siteId: "site_id",
  name: "FAQs",
})

await client.updateCollection("collection_id", { name: "Updated FAQs" })
await client.deleteCollection("collection_id")
```

### Categories

```ts
const categories = await client.listCategories("collection_id")
const category = await client.getCategory("category_id")

await client.createCategory({
  collectionId: "collection_id",
  name: "Getting Started",
})

await client.updateCategory("category_id", { name: "Quick Start" })
await client.deleteCategory("category_id")
```

### Articles

```ts
// List by collection or category
const articles = await client.listArticles({ collectionId: "collection_id" })
const articles = await client.listArticles({ categoryId: "category_id" })

// Search
const results = await client.searchArticles({ query: "how to" })

// CRUD
const article = await client.getArticle("article_id")

await client.createArticle({
  collectionId: "collection_id",
  name: "How to get started",
  text: "<p>Welcome!</p>",
})

await client.updateArticle("article_id", { name: "Updated title" })
await client.deleteArticle("article_id")
```

### Pagination

List methods return `{ page, pages, count, items }`:

```ts
const { items, page, pages, count } = await client.listArticles({
  collectionId: "collection_id",
  page: 2,
  pageSize: 25,
})
```

## Auth

Uses Basic auth with a Docs API key. Get yours from Help Scout under Manage > Docs > API Keys.

## License

MIT
