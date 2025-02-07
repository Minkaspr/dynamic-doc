import { Injectable } from '@angular/core';
//import * as pdfMake from 'pdfmake/build/pdfmake';
//import * as pdfFonts from 'pdfmake/build/vfs_fonts';
//const pdfFonts = require('./vfs_fonts.js');

//(<any>pdfMake).addVirtualFileSystem(pdfFonts);

/* const fonts = {
  Poppins:{
    //thin: 'Poppins-Thin.ttf',                    // 100
    //extra_light: 'Poppins-ExtraLight.ttf',       // 200
    italics: 'Poppins-Light.ttf',                  // 300
    normal: 'Poppins-Regular.ttf',                 // 400
    //medium: 'Poppins-Medium.ttf',                // 500
    bold: 'Poppins-SemiBold.ttf',                  // 600
    //bold: 'Poppins-Bold.ttf',                    // 700
    bolditalics: 'Poppins-Bold.ttf',               // 800
    //black: 'Poppins-Black.ttf'                   // 900
  },
  Roboto:{
    italics: 'Roboto-Light.ttf',
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    bolditalics: 'Roboto-SemiBold.ttf'
  }
} */

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  constructor() {  }

  // Método para generar el PDF y descargarlo
  async generatePdf(template: any, data: any) {
    const pdfMake = await this.loadPdfMake();
    const documentDefinition = this.prepareDocument(template, data);
    pdfMake.createPdf(documentDefinition).download('generated-document.pdf');
  }

  // Método para generar el PDF y previsualizarlo en una nueva pestaña
  async previewPdf(template: any, data: any) {
    const pdfMake = await this.loadPdfMake();
    const documentDefinition = this.prepareDocument(template, data);
    pdfMake.createPdf(documentDefinition).open();
  }

  // Método para generar el PDF y enviarlo a la impresora
  async printPdf(template: any, data: any) {
    const pdfMake = await this.loadPdfMake();
    const documentDefinition = this.prepareDocument(template, data);
    pdfMake.createPdf(documentDefinition).print();
  }

  private async loadPdfMake() {
    const pdfMakeModule = await import('pdfmake/build/pdfmake'); 
    const pdfFonts = await import('pdfmake/build/vfs_fonts');
    if ((<any>pdfFonts).pdfMake) {
      (<any>pdfMakeModule).vfs = (<any>pdfFonts).pdfMake.vfs;
    }
    return pdfMakeModule.default || pdfMakeModule;
    //(<any>pdfMake).addVirtualFileSystem(pdfFonts);
    //return pdfMake.default || pdfMake;
  }

  // Para manejar diferentes plantillas y formateos
  private prepareDocument(template: any, data: any): any {
    const content = template(data); // Llamamos a la plantilla y le pasamos los datos
    return {
      header: {
        columns: [
          { text: "Evento de Innovación - Hackathon 2025", alignment: 'right', fontSize: 10, margin: [20, 20] }
        ]
      },
      footer: function (currentPage: number, pageCount: number) {
        return {
          stack: [
            { text: '\n' }, // Agregamos dos saltos de línea para empujar el contenido hacia abajo
            {
              columns: [
                { text: `Elaborado por Minkaspr`, alignment: 'left', fontSize: 10 },
                { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', fontSize: 10 }
              ],
              margin: [20,0,20,0]
            }
          ]
        };
      },
      content: content,
      pageSize: 'A4', // Tamaño A4, A5, etc.
      pageOrientation: 'portrait', // Puede ser 'portrait' o 'landscape'
      pageMargins: [40, 60, 40, 40],
      /* defaultStyle: {
        font: 'Roboto'  // Fuente predeterminada
      }, */
      styles: {
        h1: {
          //font: 'Poppins',   
          fontSize: 16,   
          bold: true,
        },
        h2: {
          //font: 'Roboto',    
          fontSize: 14,     
          bold: true,
        },
        h3: {
          //font: 'Roboto',    
          fontSize: 13,   
          bold: true,
        }
      }
    };
  }
}
