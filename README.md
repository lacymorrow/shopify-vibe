# Shopify Seeding Toolkit

Scripts to seed products, variants, media, and collections into your Shopify store using the Admin GraphQL API.

## Setup

1. Create a `.env` file with:

```
SHOPIFY_ADMIN_API_URL=https://your-store-name.myshopify.com/admin/api/2025-07/graphql.json
SHOPIFY_ADMIN_TOKEN=shpat_your_admin_api_access_token
```

2. Install deps:

```
pnpm i || npm i || yarn
```

## Run

```
npm run seed
```

The script will:
- Create collections (Meats, Cheeses, Handmade Goods, Farm Fresh)
- Create products with variants and placeholder prices for meats, cheeses, soaps, shampoos, plushies
- Publish items to the current channel


