function canAlert(): boolean {
  return typeof window !== 'undefined' && typeof window.alert === 'function';
}

export const toast = {
  success: (m: string) => (canAlert() ? window.alert(m) : console.log('✅', m)),
  error:   (m: string) => (canAlert() ? window.alert(m) : console.error('❌', m)),
  info:    (m: string) => (canAlert() ? window.alert(m) : console.log('ℹ️', m)),
};
