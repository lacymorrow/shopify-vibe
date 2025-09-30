export const MUTATION_PRODUCT_CREATE = `#graphql
mutation productCreate($input: ProductInput, $product: ProductCreateInput, $media: [CreateMediaInput!]) {
  productCreate(input: $input, product: $product, media: $media) {
    product { id title handle }
    userErrors { field message }
  }
}`;

export const MUTATION_PRODUCT_VARIANTS_BULK_CREATE = `#graphql
mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkCreate(productId: $productId, variants: $variants) {
    product { id title }
    userErrors { field message }
  }
}`;

export const MUTATION_PUBLISHABLE_PUBLISH_CURRENT = `#graphql
mutation publishablePublishToCurrentChannel($id: ID!) {
  publishablePublishToCurrentChannel(id: $id) {
    publishable { __typename ... on Product { id } ... on Collection { id } }
    userErrors { field message }
  }
}`;

export const MUTATION_COLLECTION_CREATE = `#graphql
mutation collectionCreate($input: CollectionInput!) {
  collectionCreate(input: $input) {
    collection { id handle title }
    userErrors { field message }
  }
}`;

export const QUERY_COLLECTION_BY_HANDLE = `#graphql
query collectionsByHandle($query: String!) {
  collections(first: 1, query: $query) {
    edges { node { id handle title } }
  }
}`;

export const QUERY_PRODUCT_BY_HANDLE = `#graphql
query productsByHandle($query: String!) {
  products(first: 1, query: $query) {
    edges { node { id handle title } }
  }
}`;


