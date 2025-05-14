import { Injectable } from "@angular/core"
import {  HttpClient, HttpParams } from "@angular/common/http"
import { type Observable, of } from "rxjs"
import { map, catchError } from "rxjs/operators"
import type { Citas, CalendarConfig } from "../models/citas"

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
 private apiUrl = "https://www.googleapis.com/calendar/v3/calendars"
  private apiKey = ""
  private calendarId = ""
constructor(private http: HttpClient) {}

  initialize(config: CalendarConfig) {
    this.apiKey = config.apiKey
    this.calendarId = config.calendarId
  }

   createEvent(Cita: Citas): Observable<Citas> {
    if (!this.apiKey || !this.calendarId) {
      throw new Error("Google Calendar not configured")
    }

    const params = new HttpParams().set("key", this.apiKey)
    const eventData = this.mapToGoogleEvent(Cita)

    return this.http
      .post<any>(`${this.apiUrl}/${encodeURIComponent(this.calendarId)}/events`, eventData, { params })
      .pipe(map((response) => this.mapToAppointment(response)))
  }

  updateEvent(Cita: Citas): Observable<Citas> {
    if (!this.apiKey || !this.calendarId || !Cita.id) {
      throw new Error("Google Calendar not configured or missing event ID")
    }

    const params = new HttpParams().set("key", this.apiKey)
    const eventData = this.mapToGoogleEvent(Cita)

    return this.http
      .put<any>(`${this.apiUrl}/${encodeURIComponent(this.calendarId)}/events/${Cita.id}`, eventData, { params })
      .pipe(map((response) => this.mapToAppointment(response)))
  }

   deleteEvent(eventId: string | undefined): Observable<void> {
    if (!this.apiKey || !this.calendarId || !eventId) {
      throw new Error("Google Calendar not configured or missing event ID")
    }

    const params = new HttpParams().set("key", this.apiKey)

    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(this.calendarId)}/events/${eventId}`, { params })
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
    }
  }

  private mapToGoogleEvent(Cita: Citas): any {
    return {
      summary: Cita.summary,
      description: Cita.description,
      start: {
        dateTime: Cita.start,
      },
      end: {
        dateTime: Cita.end,
      },
      extendedProperties: Cita.extendedProperties,
    }
  }
}
