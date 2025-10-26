import { ProductDetailClient } from "./product-detail-client";

// Allow dynamic params for this route
export const dynamicParams = true;

// Generate static params for dynamic route
export async function generateStaticParams() {
  // Return empty array - pages will be generated on-demand client-side
  return [];
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
