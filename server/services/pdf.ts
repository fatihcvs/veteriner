import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export interface VaccinationCardData {
  pet: {
    name: string;
    species: string;
    breed?: string;
    birthDate?: string;
    microchipNo?: string;
    owner: string;
  };
  clinic: {
    name: string;
    address?: string;
    phone?: string;
    logoUrl?: string;
  };
  vaccinations: Array<{
    vaccineName: string;
    administeredAt: string;
    vetName: string;
    lotNo?: string;
    nextDueAt?: string;
  }>;
}

export class PDFService {
  async generateVaccinationCard(data: VaccinationCardData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = page.getSize();
    const margin = 50;
    
    // Header
    page.drawText('DİJİTAL AŞI KARTI', {
      x: margin,
      y: height - margin,
      size: 24,
      font: boldFont,
      color: rgb(0.149, 0.388, 0.925), // medical-blue
    });
    
    page.drawText(data.clinic.name, {
      x: margin,
      y: height - margin - 30,
      size: 16,
      font: boldFont,
    });
    
    if (data.clinic.address) {
      page.drawText(data.clinic.address, {
        x: margin,
        y: height - margin - 50,
        size: 10,
        font: font,
      });
    }
    
    if (data.clinic.phone) {
      page.drawText(`Tel: ${data.clinic.phone}`, {
        x: margin,
        y: height - margin - 65,
        size: 10,
        font: font,
      });
    }
    
    // Pet Information
    let currentY = height - margin - 120;
    
    page.drawText('HAYVAN BİLGİLERİ', {
      x: margin,
      y: currentY,
      size: 14,
      font: boldFont,
    });
    
    currentY -= 25;
    page.drawText(`Ad: ${data.pet.name}`, {
      x: margin,
      y: currentY,
      size: 12,
      font: font,
    });
    
    currentY -= 20;
    page.drawText(`Tür: ${data.pet.species}`, {
      x: margin,
      y: currentY,
      size: 12,
      font: font,
    });
    
    if (data.pet.breed) {
      currentY -= 20;
      page.drawText(`Cins: ${data.pet.breed}`, {
        x: margin,
        y: currentY,
        size: 12,
        font: font,
      });
    }
    
    if (data.pet.birthDate) {
      currentY -= 20;
      page.drawText(`Doğum Tarihi: ${data.pet.birthDate}`, {
        x: margin,
        y: currentY,
        size: 12,
        font: font,
      });
    }
    
    if (data.pet.microchipNo) {
      currentY -= 20;
      page.drawText(`Mikroçip No: ${data.pet.microchipNo}`, {
        x: margin,
        y: currentY,
        size: 12,
        font: font,
      });
    }
    
    currentY -= 20;
    page.drawText(`Sahibi: ${data.pet.owner}`, {
      x: margin,
      y: currentY,
      size: 12,
      font: font,
    });
    
    // QR Code
    const qrCodeData = `${data.pet.name.substring(0, 2)}****${data.pet.microchipNo?.slice(-4) || '****'}`;
    const qrCodeDataURL = await QRCode.toDataURL(qrCodeData);
    const qrCodeImageBytes = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
    const qrCodeImage = await pdfDoc.embedPng(qrCodeImageBytes);
    
    page.drawImage(qrCodeImage, {
      x: width - margin - 100,
      y: height - margin - 180,
      width: 100,
      height: 100,
    });
    
    page.drawText('Doğrulama Kodu', {
      x: width - margin - 100,
      y: height - margin - 190,
      size: 8,
      font: font,
    });
    
    // Vaccination History
    currentY -= 50;
    page.drawText('AŞI GEÇMİŞİ', {
      x: margin,
      y: currentY,
      size: 14,
      font: boldFont,
    });
    
    // Table headers
    currentY -= 30;
    page.drawText('Aşı Adı', {
      x: margin,
      y: currentY,
      size: 10,
      font: boldFont,
    });
    
    page.drawText('Uygulama Tarihi', {
      x: margin + 150,
      y: currentY,
      size: 10,
      font: boldFont,
    });
    
    page.drawText('Veteriner', {
      x: margin + 270,
      y: currentY,
      size: 10,
      font: boldFont,
    });
    
    page.drawText('Sonraki Tarih', {
      x: margin + 380,
      y: currentY,
      size: 10,
      font: boldFont,
    });
    
    // Table rows
    currentY -= 20;
    for (const vaccination of data.vaccinations) {
      page.drawText(vaccination.vaccineName, {
        x: margin,
        y: currentY,
        size: 9,
        font: font,
      });
      
      page.drawText(vaccination.administeredAt, {
        x: margin + 150,
        y: currentY,
        size: 9,
        font: font,
      });
      
      page.drawText(vaccination.vetName, {
        x: margin + 270,
        y: currentY,
        size: 9,
        font: font,
      });
      
      if (vaccination.nextDueAt) {
        page.drawText(vaccination.nextDueAt, {
          x: margin + 380,
          y: currentY,
          size: 9,
          font: font,
        });
      }
      
      currentY -= 15;
    }
    
    // Footer
    page.drawText('Bu belge dijital olarak oluşturulmuştur ve geçerlidir.', {
      x: margin,
      y: 50,
      size: 8,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}

export const pdfService = new PDFService();
