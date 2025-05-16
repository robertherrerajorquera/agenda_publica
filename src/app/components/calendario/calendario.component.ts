import { Component, type OnInit } from "@angular/core"
import  { MatDialog } from "@angular/material/dialog"
import  { MatSnackBar } from "@angular/material/snack-bar"
import  { GoogleCalendarService } from "../../services/google-calendar.service"
import { CitaFormularioComponent } from "../cita-formulario/cita-formulario.component"
import { CitaDetalleComponent } from "../cita-detalle/cita-detalle.component"
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component"
import  { Citas } from "../../models/citas"
import  { LimitesService } from "../../services/limites.service"

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-calendario',
  imports: [CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule],
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.scss'
})
export class CalendarioComponent {
 appointments: Citas[] = []
  selectedDate: Date = new Date()
  isLoading = false
  dailyCount = 0
  dailyLimit = 300

  constructor(
    private calendarService: GoogleCalendarService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private dailyLimitService: LimitesService,
  ) {}

    ngOnInit() {
    this.loadAppointments()
    this.checkDailyCount()
  }


  loadAppointments() {
  this.isLoading = true;
  console.log("Cargando citas...");

  this.calendarService.getEvents().subscribe({
    next: (events) => {
      console.log("Citas recibidas:", events);
      this.appointments = events;
      this.isLoading = false;
    },
    error: (error) => {
      console.error("Error loading appointments", error);
      this.showMessage('Error al cargar las citas');
      this.isLoading = false;
    }
  });
}

  checkDailyCount() {
    this.dailyLimitService.getDailyCount().subscribe((count) => {
      this.dailyCount = count
    })
  }

  onDateChange(event: any) {
    this.selectedDate = event.value
    this.loadAppointments()
  }



  viewAppointment(cita: Citas) {
    this.dialog.open(CitaDetalleComponent, {
      width: "600px",
      data: { cita },
    })
  }

  editAppointment(cita: Citas) {
    const dialogRef = this.dialog.open(CitaFormularioComponent, {
      width: "600px",
      data: { isNew: false, cita },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadAppointments()
        this.showMessage("Cita actualizada correctamente")
      }
    })
  }

  deleteAppointment(cita: Citas) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "400px",
      data: {
        title: "Eliminar Cita",
        message: "¿Está seguro que desea eliminar esta cita?",
        confirmText: "Eliminar",
        cancelText: "Cancelar",
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading = true
        this.calendarService.deleteEvent(cita.id).subscribe({
          next: () => {
            this.loadAppointments()
            this.showMessage("Cita eliminada correctamente")
          },
          error: (error) => {
            console.error("Error deleting appointment", error)
            this.showMessage("Error al eliminar la cita")
            this.isLoading = false
          },
        })
      }
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
