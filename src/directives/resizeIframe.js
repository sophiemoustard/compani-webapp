import iFrameResize from 'iframe-resizer/js/iframeResizer';
import { Platform } from 'quasar';

export const resize = (el) => {
  iFrameResize({ log: true, scrolling: Platform.is.desktop }, '#' + el.id);
}
