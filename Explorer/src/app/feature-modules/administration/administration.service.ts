import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Equipment } from './model/equipment.model';
import { environment } from 'src/env/environment';
import { Observable } from 'rxjs';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Club } from './model/club.model';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { UserClub } from './model/user-club.model';
import { ClubInvitation } from './model/club-invitation.model';

@Injectable({
  providedIn: 'root'
})
export class AdministrationService {
  [x: string]: any;

  constructor(private http: HttpClient) { }

  getEquipment(): Observable<PagedResults<Equipment>> {
    return this.http.get<PagedResults<Equipment>>(environment.apiHost + 'administration/equipment')
  }

  deleteEquipment(id: number): Observable<Equipment> {
    return this.http.delete<Equipment>(environment.apiHost + 'administration/equipment/' + id);
  }

  addEquipment(equipment: Equipment): Observable<Equipment> {
    return this.http.post<Equipment>(environment.apiHost + 'administration/equipment', equipment);
  }

  updateEquipment(equipment: Equipment): Observable<Equipment> {
    return this.http.put<Equipment>(environment.apiHost + 'administration/equipment/' + equipment.id, equipment);
  }

  getClub(): Observable<PagedResults<Club>> {
    return this.http.get<PagedResults<Club>>('https://localhost:44333/api/club');
  }

  addClub(club: Club): Observable<Club> {
    return this.http.post<Club>('https://localhost:44333/api/club', club);
  }

  updateClub(club: Club): Observable<Club> {
    return this.http.put<Club>('https://localhost:44333/api/club/' + club.id, club);
  }

  deleteClub(id: number): Observable<Club> {
    return this.http.delete<Club>('https://localhost:44333/api/club/' + id);
  }

  /*getUsersForClub(id: number): Observable<Club>{
    return this.http.get<Club>('https://localhost:44333/api/club/' + id);
  }*/

  getUsersForClub(id: number): Observable<Club> {
    return this.http.get<Club>('https://localhost:44333/api/club/' + id);
  }

  removeMemberFromClub(memberId: number, clubId: number): Observable<Club> {
    return this.http.put<Club>('https://localhost:44333/remove-from/' + clubId + '/' + memberId, null);
  }

  addMemberToClub(memberId: number, clubId: number): Observable<Club> {
    return this.http.put<Club>('https://localhost:44333/add-to/' + clubId + '/' + memberId, null);
  }
  
  addClubInvitation(clubInvitation: ClubInvitation): Observable<ClubInvitation> {
    return this.http.post<ClubInvitation>('https://localhost:44333/api/club-invitation', clubInvitation);
  }

  getClubInvitations(): Observable<PagedResults<ClubInvitation>> {
    return this.http.get<PagedResults<ClubInvitation>>('https://localhost:44333/api/club-invitation');
  }

  updateClubInvitation(clubInvitation: ClubInvitation): Observable<ClubInvitation> {
    return this.http.put<ClubInvitation>('https://localhost:44333/api/club-invitation/' + clubInvitation.id, clubInvitation);
  }

  getAllUsers(): Observable<PagedResults<User>> {
    return this.http.get<PagedResults<User>>('https://localhost:44333/api/user');
  }
}