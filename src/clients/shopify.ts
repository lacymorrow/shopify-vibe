import 'dotenv/config';

export type GraphQLRequest = {
  query: string;
  variables?: Record<string, unknown>;
};

export async function adminGraphQL<T>(body: GraphQLRequest): Promise<T> {
  const url = process.env.SHOPIFY_ADMIN_API_URL;
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!url || !token) {
    throw new Error('Missing SHOPIFY_ADMIN_API_URL or SHOPIFY_ADMIN_TOKEN');
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GraphQL HTTP ${res.status}: ${text}`);
  }
  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}


