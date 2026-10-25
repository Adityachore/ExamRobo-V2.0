export const SEB_DOWNLOAD_PATH = '/api/seb/config';
export const SEB_HELP_PATH = '/seb';

export function isSebBrowser(userAgent = globalThis.navigator?.userAgent || '') {
  return /Safe\s*Exam\s*Browser|SEB[\s/]/i.test(String(userAgent));
}

export function sebDownloadHref() {
  return SEB_DOWNLOAD_PATH;
}
