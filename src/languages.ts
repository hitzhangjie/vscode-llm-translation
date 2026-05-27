export interface LanguageOption {
  label: string;
  code: string;
  promptName: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { label: '中文', code: 'zh-CN', promptName: '简体中文' },
  { label: '中文繁体', code: 'zh-TW', promptName: '繁體中文' },
  { label: '英语', code: 'en', promptName: 'English' },
  { label: '法语', code: 'fr', promptName: 'French' },
  { label: '德语', code: 'de', promptName: 'German' },
  { label: '俄语', code: 'ru', promptName: 'Russian' },
];

export function findLanguageByCode(code: string): LanguageOption | undefined {
  return LANGUAGE_OPTIONS.find((lang) => lang.code === code);
}
