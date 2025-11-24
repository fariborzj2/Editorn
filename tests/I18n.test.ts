import { describe, it, expect } from 'vitest';
import { I18n } from '../src/core/I18n';
import { en } from '../src/locales/en';
import { fa } from '../src/locales/fa';

describe('I18n System', () => {
    it('should initialize with default locale (en)', () => {
        const i18n = new I18n({ messages: { en } });
        expect(i18n.t('slash_menu.heading1')).toBe('Heading 1');
    });

    it('should switch to Persian correctly', () => {
        const i18n = new I18n({ locale: 'fa', messages: { fa, en } });
        expect(i18n.t('slash_menu.heading1')).toBe('عنوان ۱');
        expect(i18n.isRTL()).toBe(true);
    });

    it('should fallback to English if key missing', () => {
        // Mock a missing key in FA
        const incompleteFa = { slash_menu: { } };
        const i18n = new I18n({ locale: 'fa', messages: { fa: incompleteFa, en: en } });

        expect(i18n.t('slash_menu.heading1')).toBe('Heading 1');
    });

    it('should return key if missing in both', () => {
        const i18n = new I18n({ messages: { en } });
        expect(i18n.t('missing.key')).toBe('missing.key');
    });
});
