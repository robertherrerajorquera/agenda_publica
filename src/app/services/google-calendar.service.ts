import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { map, catchError, tap } from "rxjs/operators";
import { Citas, CalendarConfig } from "../models/citas";

@Injectable({
  providedIn: "root",
})
export class GoogleCalendarService {
  private apiUrl = "https://www.googleapis.com/calendar/v3/calendars";
  private apiKey = "";
  private calendarId = "";

  constructor(private http: HttpClient) {
    const savedApiKey = localStorage.getItem('googleApiKey');
    const savedCalendarId = localStorage.getItem('googleCalendarId');

    if (savedApiKey && savedCalendarId) {
      this.apiKey = savedApiKey;
      this.calendarId = savedCalendarId;
    }
  }

  initialize(config: CalendarConfig) {
    console.log("Inicializando servicio con config:", config);
    this.apiKey = config.apiKey;
    this.calendarId = config.calendarId;
  }

getEvents(): Observable<Citas[]> {
  if (!this.apiKey || !this.calendarId) {
    return of([]);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log("Buscando eventos desde:", today.toISOString());

  const params = new HttpParams()
    .set("key", this.apiKey)
    .set("timeMin", today.toISOString())
    .set("singleEvents", "true")
    .set("orderBy", "startTime")
    .set("maxResults", "100");

  return this.http.get<any>(`${this.apiUrl}/${encodeURIComponent(this.calendarId)}/events`, { params }).pipe(
    tap(response => {
      console.log("Respuesta de eventos:", response);
      console.log("Número de eventos encontrados:", response.items?.length || 0);
    }),
    map((response) => {
      return response.items?.map((item: any) => this.mapToAppointment(item)) || [];
    }),
    catchError((error) => {
      console.error("Error fetching events", error);
      return of([]);
    }),
  );
}
createEvent(appointment: Citas): Observable<Citas> {
    if (!this.apiKey || !this.calendarId) {
      throw new Error("Google Calendar not configured");
    }

    const params = new HttpParams().set("key", this.apiKey);
    const eventData = this.mapToGoogleEvent(appointment);

    return this.http
      .post<any>(`${this.apiUrl}/${encodeURIComponent(this.calendarId)}/events`, eventData, { params })
      .pipe(map((response) => this.mapToAppointment(response)));
  }

  updateEvent(appointment: Citas): Observable<Citas> {
    if (!this.apiKey || !this.calendarId || !appointment.id) {
      throw new Error("Google Calendar not configured or missing event ID");
    }

    const params = new HttpParams().set("key", this.apiKey);
    const eventData = this.mapToGoogleEvent(appointment);

    return this.http
      .put<any>(`${this.apiUrl}/${encodeURIComponent(this.calendarId)}/events/${appointment.id}`, eventData, { params })
      .pipe(map((response) => this.mapToAppointment(response)));
  }

  deleteEvent(eventId: string | undefined): Observable<void> {
    if (!this.apiKey || !this.calendarId || !eventId) {
      throw new Error("Google Calendar not configured or missing event ID");
    }

    const params = new HttpParams().set("key", this.apiKey);

    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(this.calendarId)}/events/${eventId}`, { params });
  }

  private mapToAppointment(googleEvent: any): Citas {
    return {
      id: googleEvent.id,
      summary: googleEvent.summary || "",
      description: googleEvent.description || "",
      start: googleEvent.start?.dateTime || googleEvent.start?.date,
      end: googleEvent.end?.dateTime || googleEvent.end?.date,
      extendedProperties: googleEvent.extendedProperties || {
        private: {
          name: "",
          rut: "",
          phone: "",
          email: "",
        },
      },
    };
  }

  private mapToGoogleEvent(appointment: Citas): any {
    return {
      summary: appointment.summary,
      description: appointment.description,
      start: {
        dateTime: appointment.start,
      },
      end: {
        dateTime: appointment.end,
      },
      extendedProperties: appointment.extendedProperties,
    };
  }
}
