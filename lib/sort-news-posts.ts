type FeatureableNewsPost = {
  featuredOrder: number | null;
  featuredUntil: Date | null;
  publishedAt: Date;
};

export function isNewsPostFeatured(post: Pick<FeatureableNewsPost, "featuredUntil">, now = new Date()) {
  return Boolean(post.featuredUntil && post.featuredUntil.getTime() >= now.getTime());
}

export function sortNewsPosts<T extends FeatureableNewsPost>(posts: T[], now = new Date()) {
  return [...posts].sort((first, second) => {
    const firstIsFeatured = isNewsPostFeatured(first, now);
    const secondIsFeatured = isNewsPostFeatured(second, now);

    if (firstIsFeatured !== secondIsFeatured) return firstIsFeatured ? -1 : 1;
    if (firstIsFeatured && secondIsFeatured) {
      const orderDifference = (first.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (second.featuredOrder ?? Number.MAX_SAFE_INTEGER);
      if (orderDifference !== 0) return orderDifference;
    }

    return second.publishedAt.getTime() - first.publishedAt.getTime();
  });
}
