
import { Component, type OnInit } from "@angular/core"
import  { MatDialog } from "@angular/material/dialog"
import  { MatSnackBar } from "@angular/material/snack-bar"
import  { GoogleCalendarService } from "./services/google-calendar.service"
import  { ConfigService } from "./services/config.service"
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { CitaFormularioComponent } from "./components/cita-formulario/cita-formulario.component"

@Component({
  selector: 'app-root',
  imports: [ MatToolbarModule,
    MatToolbarModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, NgIf
   ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = "Sistema de Agenda"
  isConfigured = false
  isLoading = true
  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private calendarService: GoogleCalendarService,
    private configService: ConfigService,
  ) {}
    ngOnInit() {
    this.checkConfiguration()
  }

  checkConfiguration() {
    this.isLoading = true
    this.configService.getConfig().subscribe({
      next: (config) => {
        this.isConfigured = !!config.apiKey && !!config.calendarId
        this.isLoading = false
        if (this.isConfigured) {
          this.calendarService.initialize(config)
        }
      },
      error: () => {
        this.isConfigured = false
        this.isLoading = false
        this.showMessage("Error al cargar la configuración")
      },
    })
  }

  openNewAppointmentDialog() {
    const dialogRef = this.dialog.open(CitaFormularioComponent, {
      width: "600px",
      data: { isNew: true },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showMessage("Cita agendada correctamente")
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
