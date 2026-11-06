/**
 * Elementga ta'sir qilayotgan umumiy CSS `zoom` qiymati (katta ekranlarda
 * App.css dagi --content-scale orqali beriladi).
 *
 * getBoundingClientRect() ekrandagi (zoom qilingan) o'lchamni qaytaradi, lekin
 * style.height / scrollTop kabi qiymatlar elementning o'z px birligida bo'ladi.
 * Shuning uchun o'lchovni o'z birligiga o'tkazishda shu qiymatga bo'lish kerak.
 */
export function getCssZoom(element) {
  const zoom = element?.currentCSSZoom;
  return typeof zoom === 'number' && zoom > 0 ? zoom : 1;
}
