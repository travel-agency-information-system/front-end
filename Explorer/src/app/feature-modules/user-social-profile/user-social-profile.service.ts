import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SocialProfile } from './model/social-profile.model';
import { environment } from 'src/env/environment';
import { Message } from './model/message.model';

@Injectable({
  providedIn: 'root'
})
export class UserSocialProfileService {
  [x: string]: any;

  constructor(private http: HttpClient) { }

  getSocilaProfile(id: number): Observable<SocialProfile> {
    return this.http.get<SocialProfile>(environment.apiHost + 'social-profile/get/' + id);
  }

  follow(followerId: number, followedId: number): Observable<SocialProfile> {
    return this.http.post<SocialProfile>(environment.apiHost + 'social-profile/follow/' + followerId + '/' + followedId, null);
  }

  unfollow(followerId: number, unfollowedId: number): Observable<SocialProfile>{
    return this.http.post<SocialProfile>(environment.apiHost + 'social-profile/un-follow/' + followerId + '/' + unfollowedId, null);
  }

  getNotifications(id: number): Observable<Message[]> {
    return this.http.get<Message[]>(environment.apiHost + 'profile-messaging/notifications/' + id);
  }

  getInbox(id: number): Observable<Message[]> {
    return this.http.get<Message[]>(environment.apiHost + 'profile-messaging/inbox/' + id);
  }

  getSent(id: number): Observable<Message[]> {
    return this.http.get<Message[]>(environment.apiHost + 'profile-messaging/sent/' + id);
  }

  markAsRead(id: number): Observable<Message> {
    return this.http.put<Message>(environment.apiHost + 'profile-messaging/read/' + id, null);
  }

  sendMessage(message: Message): Observable<Message> {
    return this.http.post<Message>(environment.apiHost + 'profile-messaging/send/', message);
  }

  getChats(): Observable<Message[][]> {
    return this.http.get<Message[][]>(environment.apiHost + 'profile-messaging/chats');
  }

}
