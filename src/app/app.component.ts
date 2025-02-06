import { DatePipe, registerLocaleData } from '@angular/common';
import localEs from '@angular/common/locales/es';
import { LOCALE_ID, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl, AbstractControl } from '@angular/forms';
import { PdfGeneratorService } from './pdf-make/pdf-generator.service';
import { invoiceTemplate } from './pdf-make/template'

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  providers: [DatePipe, { provide: LOCALE_ID, useValue: 'es' }],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  DataForm!: FormGroup;

  currentGroup = 0;  // El grupo en el que estamos
  currentFieldIndex = 0; // El campo dentro del grupo actual
  focusedField: string = ''; // Campo en el que estamos enfocando
  todaysDate: string = '';
  totalEventDuration: string = '0';

  // Definimos los grupos y campos
  formGroups = [
    {
      title: 'Datos del Evento',
      fields: [
        {
          key: 'nombreEvento',
          label: 'Nombre del Evento',
          small: 'Ingrese el nombre oficial del evento tal como aparece en la convocatoria.',
          type: 'text',
          placeholder: 'Ejemplo: Hackathon Innovate 2025'
        },
        {
          key: 'lugarEvento',
          label: 'Lugar del Evento',
          small: 'Especifique la ciudad o sede donde se llevará a cabo el evento.',
          type: 'text',
          placeholder: 'Ejemplo: Lima, Perú'
        },
        {
          key: 'fechaInicioEvento',
          label: 'Fecha de Inicio del Evento',
          small: 'Seleccione la fecha en la que comienza el evento. La fecha de finalización debe ser posterior.',
          type: 'date',
          placeholder: ''
        },
        {
          key: 'fechaFinEvento',
          label: 'Fecha de Fin del Evento',
          small: 'Seleccione la fecha de finalización del evento. No puede ser anterior a la fecha de inicio.',
          type: 'date',
          placeholder: ''
        },
        {
          key: 'horaInicioEvento',
          label: 'Hora de Inicio del Evento',
          small: 'Seleccione la hora en la que comienza el evento.',
          type: 'time',
          placeholder: ''
        },
        {
          key: 'horaFinEvento',
          label: 'Hora de Fin del Evento',
          small: 'Seleccione la hora en la que finaliza el evento.',
          type: 'time',
          placeholder: ''
        },
        {
          key: 'modalidadEvento',
          label: 'Modalidad del Evento',
          small: 'Seleccione si el evento se realizará de manera presencial o virtual.',
          type: 'select',
          options: ['Presencial', 'Virtual']
        },
        {
          key: 'auspiciadoPor',
          label: 'Auspiciado por',
          small: 'Indique los organizadores o patrocinadores del evento. Puede listar varios.',
          type: 'text',
          placeholder: 'Ejemplo: Google, Microsoft, Universidad X'
        }
      ]
    },
    {
      title: 'Información del Participante',
      fields: [
        {
          key: 'nombre',
          label: 'Nombre Completo',
          small: 'Ingrese sus nombres y apellidos tal como aparecen en su documento de identidad.',
          type: 'text',
          placeholder: 'Ejemplo: Juan Pérez López'
        },
        {
          key: 'documento',
          label: 'Tipo de Documento',
          small: 'Seleccione el tipo de documento de identidad que usará para el registro.',
          type: 'select',
          options: ['DNI', 'Pasaporte', 'Otro']
        },
        {
          key: 'numeroDocumento',
          label: 'Número de Documento',
          small: 'Ingrese el número de su documento sin espacios ni caracteres especiales. Solo números.',
          type: 'text',
          placeholder: 'Ejemplo: 12345678'
        },
        {
          key: 'universidad',
          label: 'Universidad',
          small: 'Ingrese el nombre de la institución educativa donde estudia (si aplica).',
          type: 'text',
          placeholder: 'Ejemplo: Universidad Nacional de Ingeniería'
        },
        {
          key: 'cicloActual',
          label: 'Ciclo Actual',
          small: 'Ingrese el ciclo o semestre en el que se encuentra actualmente (solo estudiantes).',
          type: 'text',
          placeholder: 'Ejemplo: 5° ciclo'
        },
        {
          key: 'email',
          label: 'Correo Electrónico',
          small: 'Ingrese un correo válido. Se usará para notificaciones y confirmaciones.',
          type: 'email',
          placeholder: 'Ejemplo: juan.perez@email.com'
        },
        {
          key: 'telefono',
          label: 'Número de Teléfono',
          small: 'Ingrese un número de contacto válido. Solo números, sin espacios ni símbolos.',
          type: 'text',
          placeholder: 'Ejemplo: 987654321'
        },
        {
          key: 'nacionalidad',
          label: 'Nacionalidad',
          small: 'Seleccione su nacionalidad según su documento de identidad.',
          type: 'select',
          options: ['Peruana', 'Extranjera']
        },
        {
          key: 'direccion',
          label: 'Dirección',
          small: 'Ingrese su dirección completa: calle, número, distrito y ciudad.',
          type: 'text',
          placeholder: 'Ejemplo: Av. Siempre Viva 742, Lima'
        }
      ]
    }
  ];

  constructor(private fb: FormBuilder, private datePipe: DatePipe, private pdfService: PdfGeneratorService) {
    this.initializeForm();
    registerLocaleData(localEs);
    this.setTodaysDate();
  }

  ngOnInit(): void {
    // Escuchamos los cambios en `mismoDia`
    this.DataForm.get('mismoDia')?.valueChanges.subscribe((isSameDay) => {
      this.toggleFechaFin(isSameDay);
    });

    // Escuchamos los cambios en las horas
    this.DataForm.get('horaFinEvento')?.valueChanges.subscribe(() => {
      this.calculateEventDuration();
    });
  }

  /**
   * Inicializa el formulario con los campos requeridos y sus validaciones.
   */
  initializeForm() {
    this.DataForm = this.fb.group({
      nombreEvento: ['', [Validators.required, Validators.minLength(3)]],
      lugarEvento: ['', [Validators.required, Validators.minLength(3)]],
      fechaInicioEvento: ['', Validators.required],
      mismoDia: [false], // Checkbox para indicar si es un solo día
      fechaFinEvento: ['' ,[Validators.required, this.validateEndDate.bind(this)]], 
      horaInicioEvento: ['', Validators.required],
      horaFinEvento: ['', [Validators.required, this.validateEndTime.bind(this)]],
      modalidadEvento: ['', Validators.required],
      auspiciadoPor: ['', [Validators.required, Validators.minLength(3)]],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      documento: ['', Validators.required],
      numeroDocumento: ['', [Validators.required, Validators.pattern('^[0-9]+$')]], // Solo números
      universidad: ['', [Validators.required, Validators.minLength(3)]],
      cicloActual: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]], // Solo números
      nacionalidad: ['', Validators.required],
      direccion: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  /**
   * Valida que la fecha de fin no sea anterior a la de inicio.
   * @param control - Control de formulario correspondiente a la fecha de fin del evento.
   * @returns Un objeto de error `{ fechaInvalida: true }` si la fecha de fin es inválida, de lo contrario `null`.
   */
  validateEndDate(control: AbstractControl) {
    const startDate = this.DataForm?.get('fechaInicioEvento')?.value;
    const endDate = control.value;

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return { fechaInvalida: true }; // Asigna el error directamente al campo fechaFinEvento
    }
    return null; // Sin errores
  }

  /**
   * Valida que la hora de fin sea mayor a la de inicio si el evento es el mismo día.
   * @param control - Control de formulario correspondiente a la hora de fin del evento.
   * @returns Un objeto de error `{ horaInvalida: true }` si la hora de fin es inválida, de lo contrario `null`.
   */
  validateEndTime(control: AbstractControl) {
    const sameDay = this.DataForm?.get('mismoDia')?.value;
    const startTime = this.DataForm?.get('horaInicioEvento')?.value;
    const endTime = control.value;

    if (sameDay && startTime && endTime) {
      const [hStart, mStart] = startTime.split(':').map(Number);
      const [hEnd, mEnd] = endTime.split(':').map(Number);

      // Convertimos las horas a minutos para comparar fácilmente
      const startMinutes = hStart * 60 + mStart;
      const endMinutes = hEnd * 60 + mEnd;

      if (endMinutes <= startMinutes) {
        return { horaInvalida: true }; // Error si la hora final es menor o igual a la de inicio
      }
    }
    return null; // Sin errores
  }

  /**
   * Habilita o deshabilita el campo de fecha de finalización según el valor de `sameDay`.
   * @param isSameDay - Indica si el evento es de un solo día.
   */
  toggleFechaFin(isSameDay: boolean) {
    const endDateControl = this.DataForm.get('fechaFinEvento');

    if (isSameDay) {
      endDateControl?.setValue('');
      endDateControl?.clearValidators();
      endDateControl?.disable();
    } else {
      endDateControl?.setValidators([Validators.required, this.validateEndDate.bind(this)]);
      endDateControl?.enable();
    }
    endDateControl?.updateValueAndValidity();
  }

  /**
   * Calcula la duración del evento basándose en las fechas y horas ingresadas.
   * Actualiza la propiedad `totalEventDuration` con el resultado.
   */
  calculateEventDuration() {
    const startDate = this.DataForm.get('fechaInicioEvento')?.value;
    const endDate = this.DataForm.get('fechaFinEvento')?.value || startDate;
    const startTime = this.DataForm.get('horaInicioEvento')?.value;
    const endTime = this.DataForm.get('horaFinEvento')?.value;

    if (!startDate || !startTime || !endTime) {
      this.totalEventDuration = '';
      return;
    }
    this.totalEventDuration = this.calculateDuration(startDate, startTime, endDate, endTime);;
  }

  /**
   * Calcula la diferencia entre fecha y hora de inicio y fin en horas y minutos.
   * @param startDate - Fecha de inicio.
   * @param startTime - Hora de inicio.
   * @param endDate - Fecha de finalización.
   * @param endTime - Hora de finalización.
   * @returns La duración formateada en horas y minutos.
   */
  calculateDuration(startDate: string, startTime: string, endDate: string, endTime: string): string {
    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${endDate}T${endTime}:00`);

    if (endDateTime <= startDateTime) return '0 horas';

    // Calculamos la diferencia en milisegundos
    const diferenciaMs = endDateTime.getTime() - startDateTime.getTime();

    // Convertimos a horas y minutos
    const hours = Math.floor(diferenciaMs / (1000 * 60 * 60)); // Horas completas
    const minutes = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60)); // Minutos restantes

    // Formateamos la duración
    if (minutes === 0) {
      return `${hours} horas`;
    } else {
      return `${hours} horas y ${minutes} minutos`;
    }
  }

  /** 
   * Obtiene los campos del grupo actual del formulario.
   * @returns Un array con los campos del grupo actual.
   */
  get currentGroupFields() {
    return this.formGroups[this.currentGroup]?.fields;
  }

  /** 
   * Obtiene el campo actual dentro del grupo seleccionado.
   * @returns El campo actual dentro del grupo.
   */
  get currentField() {
    return this.currentGroupFields[this.currentFieldIndex];
  }

  /** 
   * Verifica si el campo actual es válido.
   * @returns `true` si el campo tiene una clave válida y cumple con las validaciones, de lo contrario `false`.
   */
  isValidCurrentField() {
    const key = this.currentField?.key;
    return key ? this.DataForm.get(key)?.valid : false
  }

  /** 
   * Avanza al siguiente campo del formulario.
   * Si se encuentra en el último campo del grupo, pasa al siguiente grupo.
   * Si el campo siguiente debe omitirse, se salta automáticamente.
   */
  nextStep() {
    let nextIndex = this.currentFieldIndex;
    let nextGroup = this.currentGroup;

    if (nextIndex < this.currentGroupFields.length - 1) {
      nextIndex++; // Avanzar dentro del grupo actual
    } else if (nextGroup < this.formGroups.length - 1) {
      nextGroup++; // Pasar al siguiente grupo
      nextIndex = 0; // Primer campo del nuevo grupo
    }

    // Si el siguiente campo debe ser omitido, saltarlo
    if (this.shouldSkipField(nextGroup, nextIndex)) {
      this.currentGroup = nextGroup;
      this.currentFieldIndex = nextIndex;
      this.nextStep(); // Salto automático al siguiente
    } else {
      this.currentGroup = nextGroup;
      this.currentFieldIndex = nextIndex;
    }
  }

  /** 
   * Retrocede al campo anterior en el formulario.
   * Si se encuentra en el primer campo de un grupo, regresa al último campo del grupo anterior.
   * Si el campo anterior debe omitirse, se salta automáticamente.
   */
  prevStep() {
    let prevIndex = this.currentFieldIndex;
    let prevGroup = this.currentGroup;

    if (prevIndex > 0) {
      prevIndex--; // Retroceder dentro del grupo actual
    } else if (prevGroup > 0) {
      prevGroup--; // Volver al grupo anterior
      prevIndex = this.formGroups[prevGroup].fields.length - 1; // Último campo del grupo anterior
    }

    // Si el campo anterior debe ser omitido, saltarlo
    if (this.shouldSkipField(prevGroup, prevIndex)) {
      this.currentGroup = prevGroup;
      this.currentFieldIndex = prevIndex;
      this.prevStep(); // Salto automático al anterior
    } else {
      this.currentGroup = prevGroup;
      this.currentFieldIndex = prevIndex;
    }
  }

  /** 
   * Determina si un campo debe ser omitido en la navegación.
   * En este caso, omite `fechaFinEvento` si el evento es el mismo día.
   * @param groupIndex - Índice del grupo de campos.
   * @param fieldIndex - Índice del campo dentro del grupo.
   * @returns `true` si el campo debe ser omitido, `false` en caso contrario.
   */
  shouldSkipField(groupIndex: number, fieldIndex: number): boolean {
    const field = this.formGroups[groupIndex].fields[fieldIndex];
    return field?.key === 'fechaFinEvento' && this.DataForm.get('mismoDia')?.value;
  }

  /** 
   * Establece la fecha actual en formato "dd de MMMM del yyyy".
   * Utiliza `datePipe` para formatear la fecha.
   */
  setTodaysDate() {
    const now = new Date();
    this.todaysDate = this.datePipe.transform(now, 'dd \'de\' MMMM \'del\' yyyy') || '';
  }

  /** 
   * Resalta un campo si es el campo actual y tiene un valor ingresado.
   * @param currentKey - Clave del campo a evaluar.
   * @returns `true` si el campo debe resaltarse, de lo contrario `false`.
   */
  isHighlighted(currentKey: string) {
    return this.currentField.key === currentKey && this.DataForm.getRawValue()[currentKey]?.trim();
  }

  /** 
   * Obtiene un control del formulario por su clave.
   * @param fieldKey - Clave del campo a obtener.
   * @returns `FormControl` correspondiente al campo.
   */
  getFormControl(fieldKey: string): FormControl {
    return this.DataForm.get(fieldKey) as FormControl;
  }

  /**
   * Formatea la fecha en `dd-MM-yyyy`.
   * @param date - Fecha a formatear.
   * @returns Fecha formateada o una cadena vacía.
   */
  formatDate(date: string | null): string {
    return date ? this.datePipe.transform(date, 'dd-MM-yyyy') || '' : '';
  }

  /**
   * Convierte la hora a formato de 12 horas con AM/PM.
   * @param time - Hora en formato 24 horas.
   * @returns Hora en formato 12 horas con AM/PM.
   */
  formatTime(time: string | null): string {
    return time ? this.datePipe.transform(`1970-01-01T${time}`, 'h:mm a') || '' : '';
  }

  /**
   * Genera los datos de la factura a partir del formulario y los envía al servicio de generación de PDF.
   * - Formatea las fechas y horas según el formato especificado.
   * - Recoge y organiza los datos del formulario en un objeto `invoiceData`.
   * - Llama al servicio `pdfService` para previsualizar el PDF con la plantilla y los datos de la factura.
   * 
   */
  generateInvoice() {
    const formData = this.DataForm.getRawValue();

    const invoiceData = {

      fechaHoy: this.todaysDate,
      nombreEvento: formData.nombreEvento,
      lugarEvento: formData.lugarEvento,
      fechaInicioEvento: this.formatDate(formData.fechaInicioEvento),
      fechaFinEvento: formData.mismoDia ? 'mismo dia' : this.formatDate(formData.fechaFinEvento),
      horaInicioEvento: this.formatTime(formData.horaInicioEvento),
      horaFinEvento: this.formatTime(formData.horaFinEvento),
      duracionEvento: this.totalEventDuration,
      modalidadEvento: formData.modalidadEvento,
      auspiciadoPor: formData.auspiciadoPor,

      participante: {
        nombre: formData.nombre,
        documento: formData.documento,
        numeroDocumento: formData.numeroDocumento,
        universidad: formData.universidad || '', // Opcional
        cicloActual: formData.cicloActual || '', // Opcional
        email: formData.email,
        telefono: formData.telefono,
        nacionalidad: formData.nacionalidad,
        direccion: formData.direccion
      }
    };

    console.log(invoiceData);
    this.pdfService.previewPdf(invoiceTemplate, invoiceData);
  }
}
