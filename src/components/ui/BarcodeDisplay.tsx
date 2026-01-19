import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeDisplayProps {
  value: string;
  format?: 'CODE128' | 'EAN13' | 'CODE39' | 'ITF14' | 'MSI' | 'pharmacode' | 'codabar';
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  className?: string;
}

export function BarcodeDisplay({
  value,
  format = 'CODE128',
  width = 2,
  height = 50,
  displayValue = true,
  fontSize = 12,
  className = ''
}: BarcodeDisplayProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && value) {
      try {
        JsBarcode(barcodeRef.current, value, {
          format,
          width,
          height,
          displayValue,
          fontSize,
          background: '#ffffff',
          lineColor: '#000000',
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    }
  }, [value, format, width, height, displayValue, fontSize]);

  if (!value) {
    return null;
  }

  return <svg ref={barcodeRef} className={className}></svg>;
}
