import QRCode from 'qrcode';
import { getMapsUrl } from '../config/wedding.js';

export function createVenueQr(venue) {
  return QRCode.toDataURL(getMapsUrl(venue), {
    errorCorrectionLevel: 'M', margin: 4, width: 768,
    color: { dark: '#231913', light: '#ffffff' },
  });
}
