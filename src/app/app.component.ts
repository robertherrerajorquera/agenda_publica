import { CitaFormularioComponent } from './components/cita-formulario/cita-formulario.component';
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogModule, MatDialog } from "@angular/material/dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCardModule } from "@angular/material/card";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { GoogleCalendarService } from "./services/google-calendar.service";
import { CalendarioComponent } from "./components/calendario/calendario.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    CalendarioComponent
  ]
})
export class AppComponent implements OnInit {
  title = "Sistema de Agenda";
  isConfigured = false;
  isLoading = true;
  apiKey = "";
  calendarId = "";

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private calendarService: GoogleCalendarService
  ) {}

  ngOnInit() {
    this.loadConfigFromStorage();
  }

  loadConfigFromStorage() {
    this.isLoading = true;
    const savedApiKey = localStorage.getItem('googleApiKey');
    const savedCalendarId = localStorage.getItem('googleCalendarId');

    if (savedApiKey && savedCalendarId) {
      this.apiKey = savedApiKey;
      this.calendarId = savedCalendarId;
      this.isConfigured = true;
      this.calendarService.initialize({
        apiKey: this.apiKey,
        calendarId: this.calendarId
      });
      console.log("Configuración cargada desde localStorage");
    } else {
      this.isConfigured = false;
      console.log("No se encontró configuración en localStorage");
    }
    this.isLoading = false;
  }

  saveConfiguration() {
    if (!this.apiKey || !this.calendarId) {
      this.showMessage("Por favor, complete todos los campos");
      return;
    }

    localStorage.setItem('googleApiKey', this.apiKey);
    localStorage.setItem('googleCalendarId', this.calendarId);
    this.isConfigured = true;

    this.calendarService.initialize({
      apiKey: this.apiKey,
      calendarId: this.calendarId
    });

    this.showMessage("Configuración guardada correctamente");
  }

  clearConfiguration() {
    localStorage.removeItem('googleApiKey');
    localStorage.removeItem('googleCalendarId');

    this.apiKey = "";
    this.calendarId = "";
    this.isConfigured = false;

    this.showMessage("Configuración eliminada");
  }

  openNewAppointmentDialog() {
    const dialogRef = this.dialog.open(CitaFormularioComponent, {
      width: "600px",
      data: { isNew: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showMessage("Cita agendada correctamente");
      }
    });
  }

  showMessage(message: string) {
    this.snackBar.open(message, "Cerrar", {
      duration: 3000,
      horizontalPosition: "center",
      verticalPosition: "bottom",
    });
  }
}
