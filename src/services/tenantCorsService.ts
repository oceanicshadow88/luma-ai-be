import CompanyModel from '../models/company';

class TenantCorsService {
  private readonly cache = new Map<string, { result: boolean; timestamp: number }>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes cache expiration

  private async checkCache(
    slug: string,
    key: string,
    fn: () => Promise<boolean>,
  ): Promise<boolean> {
    const cacheKey = `${key}:${slug}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result;
    }

    const result = await fn();

    this.cache.set(cacheKey, { result, timestamp: Date.now() });

    return result;
  }

  /** Check if tenant exists */
  async exists(slug: string): Promise<boolean> {
    return this.checkCache(slug, 'exists', async () => {
      const tenant = await CompanyModel.findOne({ slug }).lean();
      return !!tenant;
    });
  }

  /** Check if tenant is active */
  async isActive(slug: string): Promise<boolean> {
    return this.checkCache(slug, 'isActive', async () => {
      const tenant = await CompanyModel.findOne({ slug, active: true }).lean();
      return !!tenant;
    });
  }

  /** Invalidate cache for a slug (e.g. after tenant update) */
  invalidateCache(slug: string) {
    ['exists', 'isActive', 'hasValidSubscription'].forEach(key => {
      this.cache.delete(`${key}:${slug}`);
    });
  }
}

export default new TenantCorsService();
