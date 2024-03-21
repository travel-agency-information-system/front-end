import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Checkpoint } from './model/checkpoint.model';
import { environment } from 'src/env/environment';
import { Observable } from 'rxjs';
import { Equipment } from './model/equipment.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Tour } from './model/tour.model';
import { TourBundle } from './model/tour-bundle.model';
import { MapObject } from './model/map-object.model';
import { TourTimes } from './model/tourTimes.model';
import { CheckpointSecret } from './model/checkpointSecret.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { PublicCheckpoint } from '../tour-execution/model/public_checkpoint.model';
import { PublicTour } from '../marketplace/model/public-tour.model';
import { PrivateTour } from './model/private-tour.model';
import { List } from 'postcss/lib/list';


@Injectable({
  providedIn: 'root'
})
export class TourAuthoringService {

  user: User;
  constructor(private http: HttpClient, private authService: AuthService) 
  { 
    this.authService.user$.subscribe( result =>{
      this.user= result;
    });
  }
  
  getPrivateTours(touristId: number): Observable<PrivateTour[]> {
    return this.http.get<PrivateTour[]>(environment.apiHost + 'tourist/privateTours/' + touristId);
  }

  start(privateTour: PrivateTour): Observable<PrivateTour> {
    return this.http.put<PrivateTour>(environment.apiHost + 'tourist/privateTours/start', privateTour);
  }

  getCheckpoints(): Observable<PagedResults<Checkpoint>> {
    return this.http.get<PagedResults<Checkpoint>>(environment.apiHost + 'administration/checkpoint')
  }
  getCheckpoint(id:number): Observable<Checkpoint> {
    return this.http.get<Checkpoint>(environment.apiHost + 'administration/checkpoint/details/'+id);
  }

  getCheckpointsByTour(id: number): Observable<PagedResults<Checkpoint>> {
    return this.http.get<PagedResults<Checkpoint>>(environment.apiHost + 'administration/checkpoint/' + id)
  }
  
  deleteCheckpoint(id: number): Observable<Checkpoint> {
    return this.http.delete<Checkpoint>(environment.apiHost + 'administration/checkpoint/' + id);
  }

  addCheckpoint(checkpoint: FormData, status: string): Observable<Checkpoint> {
    return this.http.post<Checkpoint>(environment.apiHost +`administration/checkpoint/create/${status}`, checkpoint);
  }

  updateCheckpoint(checkpointId: number, checkpoint: FormData): Observable<Checkpoint> {
    console.log(checkpointId);
    return this.http.put<Checkpoint>(environment.apiHost + 'administration/checkpoint/' + checkpointId, checkpoint);
  }

  addCheckpointSecret(checkpointSecret: FormData, id: number): Observable<Checkpoint> {
    return this.http.put<Checkpoint>(environment.apiHost + 'administration/checkpoint/createSecret/' + id, checkpointSecret);
  }

  updateCheckpointSecret(checkpointSecret: CheckpointSecret,id:number): Observable<Checkpoint> {
    return this.http.put<Checkpoint>(environment.apiHost + 'administration/checkpoint/updateSecret/' + id, checkpointSecret);
  }

  getMapObjects(): Observable<MapObject[]> {
    return this.http.get<MapObject[]>(environment.apiHost + 'administration/mapObject');
  }

  deleteMapObject(id: number): Observable<MapObject> {
    return this.http.delete<MapObject>(environment.apiHost + 'administration/mapobject/' + id);
  }
  
  addMapObject(mapObject: MapObject, userId: number, status: string, formData: FormData): Observable<MapObject> {
    const options = { headers: new HttpHeaders() };

    formData.append('longitude', mapObject.longitude.toString()),
    formData.append('latitude', mapObject.latitude.toString()),
    formData.append('name', mapObject.name),
    formData.append('category', mapObject.category)
    if (mapObject.picture instanceof File) {
      formData.append('picture', mapObject.picture, mapObject.picture.name);
    }

    // Assuming profilePictureUrl is a string
    formData.append('pictureURL', mapObject.pictureURL);
    return this.http.post<MapObject>(environment.apiHost + `administration/mapobject/create/${userId}/${status}`, formData, options);
  }
  
  updateMapObject(mapObject: MapObject, formData: FormData): Observable<MapObject> {
    const options = { headers: new HttpHeaders() };

    formData.append('id', (mapObject.id !== undefined) ? mapObject.id.toString() : '');
    formData.append('longitude', mapObject.longitude.toString()),
    formData.append('latitude', mapObject.latitude.toString()),
    formData.append('name', mapObject.name),
    formData.append('category', mapObject.category)
    if (mapObject.picture instanceof File) {
      formData.append('picture', mapObject.picture, mapObject.picture.name);
    }
  
    // Assuming profilePictureUrl is a string
    formData.append('pictureURL', mapObject.pictureURL);
    return this.http.put<MapObject>(environment.apiHost + 'administration/mapobject/' + mapObject.id, formData, options);
  }
  
  
  addTour(tour: Tour): Observable<Tour> {
    return this.http.post<Tour>(environment.apiHost + 'administration/tour', tour);
  }

  updateTour(tour: Tour): Observable<Tour> {
    return this.http.put<Tour>(environment.apiHost + 'administration/tour/' + tour.id, tour);
  }

  archiveTour(tour: Tour): Observable<Tour> {
    return this.http.put<Tour>(environment.apiHost + 'administration/tour/archivedTours/' + tour.id, null);
  }

  getTour(): Observable<Tour[]> {
    return this.http.get<Tour[]>(environment.apiHost + 'administration/tour/by-author')
  }

  deleteTour(id: number): Observable<Tour> {
    return this.http.delete<Tour>(environment.apiHost + 'administration/tour/' + id);
  }

  get(id:number): Observable<Tour> {
    return this.http.get<Tour>(environment.apiHost + 'administration/tour/details/' + id);
  }

  removeEquipment(tourId: number, equipmentId: number): Observable<Tour> {
    return this.http.put<Tour>(environment.apiHost + 'administration/tour/remove/' + tourId + '/' + equipmentId, null);
  }

  addEquipment(tourId: number, equipmentId: number): Observable<Tour>{
    return this.http.put<Tour>(environment.apiHost + 'administration/tour/add/' + tourId + '/' + equipmentId, null);
  }

  getAvailableEquipment(currentEquipmentIds: number[], tourId: number): Observable<Equipment[]> {
    return this.http.post<Equipment[]>(environment.apiHost + 'manipulation/equipment/get-available/' + tourId, currentEquipmentIds);
  }

  publishTour(tourId: number){
    console.log(tourId)
    return this.http.put<Tour>(environment.apiHost + 'administration/tour/publishedTours/' + tourId, null);
  }

  addTourTransportation(tourId: number, tour: TourTimes){
    return this.http.put<Tour>(environment.apiHost + 'administration/tour/tourTime/' + tourId, tour);
  }

  getPublicCheckpoints(): Observable<PagedResults<PublicCheckpoint>>{
    let queryParams = new HttpParams();
    queryParams = queryParams.append("page", 0);
    queryParams = queryParams.append("pageSize", 0);
    return this.http.get<PagedResults<PublicCheckpoint>>(environment.apiHost + 'administration/publicCheckpoint');
  }
  getPublicCheckpointsAtPlace(longitude:number, latitude:number): Observable<PagedResults<PublicCheckpoint>>{
    let queryParams = new HttpParams();
    queryParams = queryParams.append("page", 0);
    queryParams = queryParams.append("pageSize", 0);
    return this.http.get<PagedResults<PublicCheckpoint>>(environment.apiHost + 'administration/publicCheckpoint/atPlace/'+longitude+'/'+latitude);
  }
  getToursWithPublicCheckpoints(checkpoints: PublicCheckpoint[]): Observable<PublicTour[]>{
    return this.http.post<PublicTour[]>(environment.apiHost+'tourist/publicTours/byChekpoints', checkpoints);
  }
  createPrivateTour(privateTour: PrivateTour): Observable<PrivateTour> {
    return this.http.post<PrivateTour>(environment.apiHost + 'tourist/privateTours', privateTour);
  }

  createTourBundle(tourBundle: TourBundle): Observable<TourBundle> {
    return this.http.post<TourBundle>(environment.apiHost + 'administration/tour-bundle', tourBundle);
  }

  getBundlesByAuthor(): Observable<TourBundle[]>{
    return this.http.get<TourBundle[]>(environment.apiHost + 'administration/tour-bundle/bundles-by-author');
  }

  deleteBundle(id: number): Observable<TourBundle>{
    return this.http.delete<TourBundle>(environment.apiHost + 'administration/tour-bundle/' + id);
  }

  updateBundle(bundle: TourBundle): Observable<TourBundle>{
    return this.http.put<TourBundle>(environment.apiHost + 'administration/tour-bundle/' + bundle.id || '', bundle);
  }

  getBundleById(id: number): Observable<TourBundle>{
    return this.http.get<TourBundle>(environment.apiHost + 'administration/tour-bundle/' + id);
  }

  removeTourFromBundle(bundleId: number, tourId: number): Observable<TourBundle>{
    return this.http.put<TourBundle>(environment.apiHost + 'administration/tour-bundle/remove-tour/' + bundleId + '/' + tourId, null);
  }

  addTourToBundle(bundleId: number, tourId: number): Observable<TourBundle>{
    return this.http.put<TourBundle>(environment.apiHost + 'administration/tour-bundle/add-tour/' + bundleId + '/' + tourId, null);
  }
}