import * as QRCode from "qrcode";

export interface UPIPaymentInfo {
  upiId: string;
  name: string;
  amount: number;
  invoiceNumber: string;
}

export const generateUPIString = ({ upiId, name, amount, invoiceNumber }: UPIPaymentInfo): string => {
  return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoiceNumber}`)}`;
};

export const generateQRCode = async (upiString: string): Promise<string> => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(upiString, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export const generateUPIQRCode = async (paymentInfo: UPIPaymentInfo): Promise<string> => {
  const upiString = generateUPIString(paymentInfo);
  return await generateQRCode(upiString);
};
