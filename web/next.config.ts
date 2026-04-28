import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // typedRoutes was enabled before the multilingual-german change. With locale
  // prefixes resolved dynamically (`/de/recipe`), Link href values are
  // computed strings not statically-known route literals. Disabling
  // typedRoutes lets the i18n helper return strings; runtime correctness is
  // covered by the tests + middleware path resolution.
  typedRoutes: false,
};

export default nextConfig;
