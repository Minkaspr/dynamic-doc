export function invoiceTemplate(data: any): any {
  return [
    { text: `Contrato de Participación en la Hackathon`, style: 'h1', alignment: 'center'},
    { text: '\n' },
    { text: `${data.fechaHoy || "___"}`, style: 'date', alignment: 'right' },
    { text: '\n\n' },
    { text: 'PARTICIPACIÓN EN EL EVENTO', style: 'h2' },
    {
      text: [
        `En este documento, el participante se compromete a su participación en la hackathon titulada ${data.nombreEvento || "___"}, `,
        `la cual se llevará a cabo en ${data.lugarEvento || "___"} el ${data.fechaInicioEvento || "___"}. `,
        `El evento será de modalidad ${data.modalidadEvento || "___"}, y está auspiciado por  ${data.auspiciadoPor || "___"}.`
      ],
      margin: [0, 5, 0, 10]
    },

    { text: 'DATOS DEL PARTICIPANTE', style: 'h2' },
    { 
      text: [
        `El participante que firma este documento, con nombre ${data.participante.nombre || "___"}, `,
        `portador del documento de identificación ${data.participante.documento || "___"} - ${data.participante.numeroDocumento || "___"}, `,
        `perteneciente a la universidad ${data.participante.universidad || "___"} y actualmente cursando el ciclo ${data.participante.cicloActual || "___"}, `,
        'y declara la veracidad de la información proporcionada en este contrato. ',
        `Además, incluye su correo electrónico ${data.participante.email || "___"} y número de teléfono ${data.participante.telefono || "___"}, `,
        `así como su nacionalidad ${data.participante.nacionalidad || "___"}, y su dirección en ${data.participante.direccion || "___"}.`
      ],
      margin: [0, 5, 0, 10]
    },

    { text: 'DECLARACIONES', style: 'h2' },
    { text: 'El participante:', margin: [0, 5, 0, 0]},
    {
      ol: [
        {
          text: [
            `Que el participante, identificado como ${data.participante.nombre || "___"}, `,
            `ha decidido participar voluntariamente en la hackathon organizada por ${data.auspiciadoPor || "___"}.`,
          ]
        },
        {
          text: [
            'Declara que ha leído y comprendido las reglas del evento y se compromete a cumplir con ',
            `los términos establecidos por los organizadores de ${data.nombreEvento || "___"}.`,
          ]
        },
        {
          text: [
            'Certifica que toda la información proporcionada es veraz y que el proyecto o trabajo a presentar ',
            'en el evento será de su autoría, sin plagio ni violación de derechos de propiedad intelectual.',
          ]
        }
      ],
      margin: [0, 5, 0, 10]
    },
    
    { text: 'CONDICIONES GENERALES', style: 'h2'},
    {
      ul: [
        {
          text: [
            { text: 'Modalidad y Duración: ', bold: true },
            `El evento se llevará a cabo de forma ${data.modalidadEvento || "___"}, con una duración total de ${data.duracionEvento || "___"}. `,
            `Se iniciará el ${data.fechaInicioEvento || "___"} a las ${data.horaInicioEvento || "___"} y `,
            `finalizará el ${data.fechaFinEvento || "___"}, a las ${data.horaFinEvento || "___"}.`
          ]
        },
        {
          text: [
            { text: 'Uso del proyecto: ', bold: true },
            'En caso de ser seleccionado como ganador, el participante concede a los organizadores el derecho de presentar ',
            'y difundir públicamente su proyecto con fines académicos y promocionales.'
          ]
        },
        {
          text: [
            { text: 'Descalificación: ', bold: true },
            'Cualquier incumplimiento de las normas podrá derivar en la descalificación inmediata del participante.'
          ]
        },
      ],
      margin: [0, 5, 0, 10]
    },

    { text: 'FIRMA Y CONFIRMACIÓN', style: 'h2' },
    { 
      text: 'Por medio de este contrato, el participante confirma su participación y acepta los términos y condiciones descritos.', 
      margin: [0, 5, 0, 10] 
    },
    { text: '\n\n\n' },
    {
      table: {
        widths: ['50%', '50%'], // Ambas columnas tienen el mismo ancho
        body: [
          [
            { text: 'Firma del Participante:', alignment: 'right', margin: [0, 20, 0, 10] },
            { text: '__________________________', alignment: 'left', margin: [0, 20, 0, 10] }
          ],
          [
            { text: 'Fecha de Firma:', alignment: 'right', margin: [0, 5, 0, 20] },
            { text: '___ / ___ / ______', alignment: 'left', margin: [0, 5, 0, 20] }
          ]
        ]
      },
      layout: 'noBorders' // Elimina los bordes de la tabla para un diseño limpio
    }
  ];
}
