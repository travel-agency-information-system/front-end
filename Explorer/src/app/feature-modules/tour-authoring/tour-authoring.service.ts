import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tour } from './model/tour.model';
import { environment } from 'src/env/environment';
import { Observable } from 'rxjs';
import { Equipment } from './model/equipment.model';

@Injectable({
  providedIn: 'root'
})
export class TourAuthoringService {

  constructor(private http: HttpClient) { }

  addTour(tour: Tour): Observable<Tour> {
    return this.http.post<Tour>(environment.apiHost + 'administration/tour', tour);
  }

  updateTour(tour: Tour): Observable<Tour> {
    return this.http.put<Tour>(environment.apiHost + 'administration/tour/' + tour.id, tour);
  }

  getTour(id: number): Observable<Tour[]> {
    return this.http.get<Tour[]>(environment.apiHost + 'administration/tour/'+id)
  }

  deleteTour(id: number): Observable<Tour> {
    return this.http.delete<Tour>(environment.apiHost + 'administration/tour/' + id);
  }

  // getEquipment(): Observable<Equipment[]>{
  //   return this.http.get<Equipment[]>(environment.apiHost + 'administration/equipment');
  // }

  removeEquipment(tourId: number, equipmentId: number){
    return this.http.put<Tour>(environment.apiHost + 'administration/tour/remove/' + tourId + '/' + equipmentId, null);
  }

  addEquipment(tourId: number, equipmentId: number){
    return this.http.put<Tour>(environment.apiHost + 'administration/tour/add/' + tourId + '/' + equipmentId, null);
  }

}
