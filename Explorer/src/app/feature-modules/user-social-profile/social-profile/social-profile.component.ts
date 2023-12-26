import { Component, OnInit, ViewChild } from '@angular/core';
import { MapComponent } from 'src/app/shared/map/map.component';
import { SocialProfile } from '../model/social-profile.model';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { UserSocialProfileService } from '../user-social-profile.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Message } from '../model/message.model';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'xp-social-profile',
  templateUrl: './social-profile.component.html',
  styleUrls: ['./social-profile.component.css']
})
export class SocialProfileComponent implements OnInit{
  @ViewChild(MapComponent) mapComponent: MapComponent;
  user: User | undefined;
  socialProfile: SocialProfile;
  inbox: Message[];
  sent: Message[];
  activeTab: string = 'inbox';
  isMessageBoxActive: boolean = false;
  showingMessage: Message | undefined;

  selectedRecipientId: number;
  selectedRecipientName: string;
  messageTitle: string;
  messageContent: string;

  messageId: number | undefined;

  chats: Message[][];
  chatMaps: { id: number; messages: Message[] }[];
  selectedChat: { id: number; messages: Message[] } | null = null;


  constructor(private service: UserSocialProfileService, 
    private authService: AuthService){ }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.getSocialProfile(this.user.id);
      this.onInboxTabClick();
      this.getChats();
      
      // TODO - display message on see details in notification
    });
  }

  getChats(): void {
    this.service.getChats().subscribe((result: Message[][]) => {
      this.chats = result;
      console.log(this.chats);
      this.createChatMaps();
      console.log(this.chatMaps);
    });

    /*
    this.service.getChats().subscribe(
    (response: Message[][]) => {
      // Handle the response here
      console.log(response);
      // You can access individual lists like response[0], response[1], etc.
    },
    (error) => {
      // Handle errors
      console.error(error);
    }
  );
  */
  }

  getLastMessageUser(chat: { id: number; messages: Message[] }): string {
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (lastMessage && this.user) {
      return this.user.id === lastMessage.senderId ? lastMessage.recipientUsername : lastMessage.senderUsername;
    }
    return 'No messages';
  }

  createChatMaps(): void {
    this.chatMaps = this.chats.map((messages, index) => ({ id: index + 1, messages }));
  }

  getSocialProfile(id: number): void {
    this.service.getSocilaProfile(id).subscribe((result: SocialProfile) => {
      this.socialProfile = result;
    });
  }

  onFollowClick(followedId?: number): void {
    if(this.user && followedId){
      this.service.follow(this.user.id, followedId).subscribe((result: SocialProfile) => {
        this.socialProfile = result;
      });
    }
  }

  onUnfollowClick(followedId?: number): void {
    if(this.user && followedId){
      this.service.unfollow(this.user.id, followedId).subscribe((result: SocialProfile) => {
        this.socialProfile = result;
      });
    }
  }

  onProfileTabClick(): void {
    this.activeTab = "profile";
  }

  onInboxTabClick(): void {
    this.activeTab = "inbox";
    if(this.user) {
      this.getInbox();
    }
  }

  onSentTabClick(): void {
    this.activeTab = "sent";
    if(this.user) {
      this.getSent();
    }
  }

  onComposeTabClick(): void {
    this.activeTab = "compose"
  }

  getInbox(): void {
    if(this.user) {
      this.service.getInbox(this.user.id).subscribe((result: Message[]) => {
        this.inbox = result;
      });
    }
  }

  getSent(): void {
    if(this.user) {
      this.service.getSent(this.user.id).subscribe((result: Message[]) => {
        this.sent = result;
      });
    }
  }

  sendMessage(): void {
    if(this.user) {
      const message: Message = {
        senderId: this.user.id,
        recipientId: this.selectedRecipientId,
        senderUsername: this.user.username,
        recipientUsername: this.selectedRecipientName,
        title: this.messageTitle,
        sentDateTime: new Date(),
        readDateTime: new Date(),
        content: this.messageContent,
        isRead: false,
      };
      this.service.sendMessage(message).pipe(
        switchMap(() => this.service.getChats())
      ).subscribe((result: Message[][]) => {
        this.chats = result;
        this.createChatMaps();
        this.selectedChat = this.chatMaps.find(chat => chat.id === this.selectedChat?.id) || null;
      });
    } 
  }

  readMessage(id?: number): void {
    if(id) {
      this.service.markAsRead(id).subscribe((result: Message) => {
        this.showingMessage = result;
        this.isMessageBoxActive = true;
        console.log(result);
      });
    }
  }

  viewMessage(id?: number): void {
    if(id) {
      if(this.activeTab === "inbox") {
        this.showingMessage = this.inbox.find(message => message.id === id);
        this.isMessageBoxActive = true;
      }
      else if(this.activeTab === "sent") {
        this.showingMessage = this.sent.find(message => message.id === id);
        this.isMessageBoxActive = true;
      }
    }
  }

  closePopup(): void {
    this.showingMessage = undefined;
    this.isMessageBoxActive = false;
  }

  selectChat(chat: { id: number; messages: Message[] }): void {
    this.getChats();
    this.selectedChat = chat;
    const lastMessage = chat.messages[chat.messages.length - 1];
    if(lastMessage && this.user) {
      this.selectedRecipientId = this.user.id === lastMessage.senderId ? lastMessage.recipientId! : lastMessage.senderId!;
      this.selectedRecipientName = this.user.id === lastMessage.senderId ? lastMessage.recipientUsername : lastMessage.senderUsername;
    }
    
  }

}
