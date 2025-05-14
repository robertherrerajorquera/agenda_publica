import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { type Observable, of } from "rxjs"
import { catchError } from "rxjs/operators"
import type { CalendarConfig } from "../models/citas"

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
private configUrl = "assets/config.json"

  constructor(private http: HttpClient) {}

  getConfig(): Observable<CalendarConfig> {
    return this.http.get<CalendarConfig>(this.configUrl).pipe(
      catchError((error) => {
        console.error("Error loading configuration", error)
        return of({ apiKey: "", calendarId: "" })
      }),
    )
  }
}
