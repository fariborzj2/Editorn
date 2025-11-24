export interface I18nConfig {
    locale?: string;
    messages?: Record<string, any>;
}

export class I18n {
    private locale: string = 'en';
    private messages: Record<string, any> = {};

    constructor(config?: I18nConfig) {
        if (config?.locale) {
            this.locale = config.locale;
        }
        if (config?.messages) {
            this.messages = config.messages;
        }
    }

    public t(key: string): string {
        const keys = key.split('.');
        let current = this.messages[this.locale] || {};

        for (const k of keys) {
            if (current[k] === undefined) {
                // Fallback to English if not found in current locale
                if (this.locale !== 'en') {
                    let fallback = this.messages['en'] || {};
                    for (const fk of keys) {
                        if (fallback[fk] === undefined) return key;
                        fallback = fallback[fk];
                    }
                    return fallback;
                }
                return key;
            }
            current = current[k];
        }

        return current;
    }

    public isRTL(): boolean {
        return ['fa', 'ar', 'he'].includes(this.locale);
    }

    public setLocale(locale: string) {
        this.locale = locale;
    }
}
