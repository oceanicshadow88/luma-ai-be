const { DEFAULT_COMPANY_PLAN, DEFAULT_LOCALE, DEFAULT_TIMEZONE } = require('../../../dist/src/config');
const { default: CompanyModel } = require('../../../dist/src/models/company');

class CompanyBuilder {
    constructor() {
        this.company = {
            companyName: 'Default Company',
            slug: 'lumaai',
            plan: DEFAULT_COMPANY_PLAN,
            owner: null, // Will need to be set with a valid ObjectId
            logoUrl: '',
            settings: {
                timezone: DEFAULT_TIMEZONE,
                locale: DEFAULT_LOCALE,
                primaryColor: '#000000',
            },
            active: true,
        };
        return this;
    }

    withCompanyName(companyName) {
        this.company.companyName = companyName;
        return this;
    }

    withSlug(slug) {
        this.company.slug = slug;
        return this;
    }

    withPlan(plan) {
        this.company.plan = plan;
        return this;
    }

    withOwner(owner) {
        this.company.owner = owner;
        return this;
    }

    withLogoUrl(logoUrl) {
        this.company.logoUrl = logoUrl;
        return this;
    }

    withSettings(settings) {
        this.company.settings = { ...this.company.settings, ...settings };
        return this;
    }

    withTimezone(timezone) {
        this.company.settings.timezone = timezone;
        return this;
    }

    withLocale(locale) {
        this.company.settings.locale = locale;
        return this;
    }

    withPrimaryColor(primaryColor) {
        this.company.settings.primaryColor = primaryColor;
        return this;
    }

    withActive(active) {
        this.company.active = active;
        return this;
    }

    build() {
        return this.company;
    }

    save() {
        return new CompanyModel(this.company).save();
    }
}

module.exports = CompanyBuilder;
