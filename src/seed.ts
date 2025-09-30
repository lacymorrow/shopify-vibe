import { adminGraphQL } from './clients/shopify.js';
import {
  MUTATION_COLLECTION_CREATE,
  MUTATION_PRODUCT_CREATE,
  MUTATION_PRODUCT_VARIANTS_BULK_CREATE,
  MUTATION_PUBLISHABLE_PUBLISH_CURRENT,
  QUERY_COLLECTION_BY_HANDLE,
  QUERY_PRODUCT_BY_HANDLE,
} from './graphql.js';
import catalog from '../data/catalog.json' assert { type: 'json' };

type CreatedCollection = { handle: string; id: string };

async function getCollectionIdByHandle(handle: string): Promise<string | undefined> {
  const res = await adminGraphQL<{ collections: { edges: { node: { id: string; handle: string } }[] } }>({
    query: QUERY_COLLECTION_BY_HANDLE,
    variables: { query: `handle:${handle}` },
  });
  return res.collections.edges[0]?.node.id;
}

async function ensureCollections(): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const col of catalog.collections) {
    const existingId = await getCollectionIdByHandle(col.handle);
    if (existingId) {
      map[col.handle] = existingId;
      continue;
    }
    const res = await adminGraphQL<{ collectionCreate: { collection?: { id: string; handle: string }; userErrors: { message: string }[] } }>({
      query: MUTATION_COLLECTION_CREATE,
      variables: { input: { title: col.title, handle: col.handle } },
    });
    const payload = res.collectionCreate;
    if (payload.collection) {
      map[col.handle] = payload.collection.id;
      await adminGraphQL({ query: MUTATION_PUBLISHABLE_PUBLISH_CURRENT, variables: { id: payload.collection.id } });
    }
  }
  return map;
}

async function getProductIdByHandle(handle: string): Promise<string | undefined> {
  const res = await adminGraphQL<{ products: { edges: { node: { id: string; handle: string } }[] } }>({
    query: QUERY_PRODUCT_BY_HANDLE,
    variables: { query: `handle:${handle}` },
  });
  return res.products.edges[0]?.node.id;
}

async function createProduct(p: any, collectionsMap: Record<string, string>): Promise<string> {
  const existing = await getProductIdByHandle(p.handle);
  if (existing) return existing;
  const input = {
    title: p.title,
    handle: p.handle,
    productType: p.productType,
    tags: p.tags,
    descriptionHtml: p.descriptionHtml,
    productOptions: p.options?.map((o: any, idx: number) => ({ name: o.name, position: idx + 1, values: o.values })),
    collectionsToJoin: (p.collections || []).map((h: string) => collectionsMap[h]).filter(Boolean),
  };

  const res = await adminGraphQL<{ productCreate: { product?: { id: string }; userErrors: { message: string }[] } }>({
    query: MUTATION_PRODUCT_CREATE,
    variables: { input },
  });
  const payload = res.productCreate;
  if (!payload.product) {
    throw new Error(`Failed to create product ${p.title}: ${JSON.stringify(payload.userErrors)}`);
  }
  const productId = payload.product.id;
  // publish product
  await adminGraphQL({ query: MUTATION_PUBLISHABLE_PUBLISH_CURRENT, variables: { id: productId } });
  return productId;
}

async function createVariants(productId: string, variants: any[]) {
  if (!variants?.length) return;
  const formatted = variants.map((v) => ({
    optionValues: v.optionValues,
    price: v.price,
    inventoryQuantities: v.inventoryQuantities?.map((q: any) => ({ availableQuantity: q.availableQuantity })),
    taxable: true,
  }));
  const res = await adminGraphQL<{ productVariantsBulkCreate: { userErrors: { message: string }[] } }>({
    query: MUTATION_PRODUCT_VARIANTS_BULK_CREATE,
    variables: { productId, variants: formatted },
  });
  const errors = res.productVariantsBulkCreate.userErrors;
  if (errors?.length) {
    throw new Error(`Variant errors: ${JSON.stringify(errors)}`);
  }
}

async function main() {
  console.log('Seeding collections...');
  const collectionsMap = await ensureCollections();
  console.log('Seeding products...');
  for (const p of catalog.products) {
    const productId = await createProduct(p, collectionsMap);
    await createVariants(productId, p.variants || []);
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


