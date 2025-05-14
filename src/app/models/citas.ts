export interface Citas {
  id?: string
  summary: string
  description?: string
  start: string
  end: string
  extendedProperties?: {
    private?: {
      nombre?: string
      rut?: string
      cel?: string
      correo?: string
    }
  }
}

export interface CalendarConfig {
  apiKey: string
  calendarId: string
}
