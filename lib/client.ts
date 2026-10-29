export async function api(path: string, options: RequestInit = {}) {
  const response = await fetch(`/api/${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  const result: any = await response.json();
  if (!response.ok) throw Error(result.error || "تعذر إتمام العملية");
  return result;
}
export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  active: boolean;
  sort: number;
};
