import { Component, Inject, type OnInit } from "@angular/core"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
import type { Citas } from "../../models/citas";
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { GoogleCalendarService } from "../../services/google-calendar.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LimitesService } from '../../services/limites.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-cita-formulario',
  imports: [ReactiveFormsModule, MatIconModule, MatDialogModule, MatFormFieldModule, MatDatepickerModule, MatProgressSpinnerModule, NgIf],

  templateUrl: './cita-formulario.component.html',
  styleUrl: './cita-formulario.component.scss'
})
export class CitaFormularioComponent {
  citaForm: FormGroup
  isNew: boolean
  isSubmitting = false
  dailyLimitReached = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CitaFormularioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isNew: boolean, appointment?: Citas },
    private calendarService: GoogleCalendarService,
    private snackBar: MatSnackBar,
    private dailyLimitService: LimitesService
  ) {
    this.isNew = data.isNew;
    this.citaForm = this.createForm();
  }


  ngOnInit() {
    if (!this.isNew && this.data.appointment) {
      this.populateForm(this.data.appointment)
    }

    if (this.isNew) {
      this.checkDailyLimit()
    }
  }


 createForm(): FormGroup {
  return this.fb.group({
    name: ["", [Validators.required]],
    rut: ["", [Validators.required]],
    phone: ["", [Validators.required]],
    email: ["", [Validators.required, Validators.email]],
    date: [new Date(), [Validators.required]],
    startTime: ["09:00", [Validators.required]],
    endTime: ["10:00", [Validators.required]],
    notes: [""],
  });
}

  populateForm(Cita: Citas) {
    const startDate = new Date(Cita.start)
    const endDate = new Date(Cita.end)

    this.citaForm.patchValue({
      nombre: Cita.extendedProperties?.private?.nombre || "",
      rut: Cita.extendedProperties?.private?.rut || "",
      cel: Cita.extendedProperties?.private?.cel || "",
      correo: Cita.extendedProperties?.private?.correo || "",
      date: startDate,
      startTime: this.formatTime(startDate),
      endTime: this.formatTime(endDate),
      notes: Cita.description || "",
    })
  }

  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
  }


  checkDailyLimit() {
    this.dailyLimitService.getDailyCount().subscribe((count: number) => {
      this.dailyLimitReached = count >= 300
      if (this.dailyLimitReached) {
        this.showMessage("Se ha alcanzado el límite diario de 300 citas")
      }
    })
  }

  onSubmit() {
    if (this.citaForm.invalid) {
      return
    }

    if (this.isNew && this.dailyLimitReached) {
      this.showMessage("No se pueden crear más citas hoy. Se ha alcanzado el límite diario.")
      return
    }

    this.isSubmitting = true
    const formValues = this.citaForm.value

    const startDate = new Date(formValues.date)
    const endDate = new Date(formValues.date)

    const [startHours, startMinutes] = formValues.startTime.split(":").map(Number)
    const [endHours, endMinutes] = formValues.endTime.split(":").map(Number)

    startDate.setHours(startHours, startMinutes, 0)
    endDate.setHours(endHours, endMinutes, 0)

    const CitaData: Citas = {
      id: this.isNew ? undefined : this.data.appointment?.id,
      summary: `Cita: ${formValues.nombre}`,
      description: formValues.notes,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      extendedProperties: {
        private: {
          nombre: formValues.nombre,
          rut: formValues.rut,
          cel: formValues.cel,
          correo: formValues.correo,
        },
      },
    }

    if (this.isNew) {
      this.createAppointment(CitaData)
    } else {
      this.updateAppointment(CitaData)
    }
  }

  createAppointment(CitaData: Citas) {
    this.calendarService.createEvent(CitaData).subscribe({
      next: (result) => {
        this.isSubmitting = false
        this.dailyLimitService.incrementDailyCount()
        this.dialogRef.close(result)
      },
      error: (error: any) => {
        console.error("Error creating appointment", error)
        this.showMessage("Error al crear la cita")
        this.isSubmitting = false
      },
    })
  }

  updateAppointment(CitaData: Citas) {
    this.calendarService.updateEvent(CitaData).subscribe({
      next: (result: any) => {
        this.isSubmitting = false
        this.dialogRef.close(result)
      },
      error: (error: any) => {
        console.error("Error updating appointment", error)
        this.showMessage("Error al actualizar la cita")
        this.isSubmitting = false
      },
    })
  }

  showMessage(message: string) {
    this.snackBar.open(message, "Cerrar", {
      duration: 3000,
      horizontalPosition: "center",
      verticalPosition: "bottom",
    })
  }

}
