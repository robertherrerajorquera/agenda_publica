import { Injectable } from "@angular/core"
import { BehaviorSubject, type Observable } from "rxjs"

@Injectable({
  providedIn: 'root'
})
export class LimitesService {

 private readonly STORAGE_KEY = "calendar_daily_count"
  private readonly DATE_KEY = "calendar_count_date"
  private dailyCountSubject = new BehaviorSubject<number>(0)

  constructor() {
    this.initializeCount()
  }

    private initializeCount(): void {
    const storedDate = localStorage.getItem(this.DATE_KEY)
    const today = new Date().toDateString()

    // Reset count if it's a new day
    if (storedDate !== today) {
      localStorage.setItem(this.DATE_KEY, today)
      localStorage.setItem(this.STORAGE_KEY, "0")
      this.dailyCountSubject.next(0)
    } else {
      const count = Number.parseInt(localStorage.getItem(this.STORAGE_KEY) || "0", 10)
      this.dailyCountSubject.next(count)
    }
  }

  getDailyCount(): Observable<number> {
    return this.dailyCountSubject.asObservable()
  }

  incrementDailyCount(): void {
    const currentCount = this.dailyCountSubject.value
    const newCount = currentCount + 1
    localStorage.setItem(this.STORAGE_KEY, newCount.toString())
    this.dailyCountSubject.next(newCount)
  }
}
