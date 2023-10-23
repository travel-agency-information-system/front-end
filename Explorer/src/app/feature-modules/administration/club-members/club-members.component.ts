import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdministrationService } from '../administration.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Club } from '../model/club.model';
import { ClubInvitation } from '../model/club-invitation.model';

@Component({
  selector: 'xp-club-members',
  templateUrl: './club-members.component.html',
  styleUrls: ['./club-members.component.css']
})
export class ClubMembersComponent implements OnInit{
  users: User[] = [];
  club: Club;
  clubId: number = 0; //
  currentUserTouristId: number = 0;

  constructor(private service: AdministrationService, private authService: AuthService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUserTouristId = user?.id || 0;
    });

    this.route.params.subscribe(params => {
      this.clubId = params['id']; 
    });

    this.service.getUsersForClub(this.clubId).subscribe({
      next: (result: Club) => {
        this.club = result;
        this.users = this.club.users;
      },
      error: () => {
      }
    })
  }

  removeMember(memberId: number): void{
    this.service.removeMemberFromClub(memberId, this.clubId).subscribe({
      next: (result: Club) => {
        this.club = result;
        this.users = this.club.users;
      },
      error: () => {

      }
    })
  }

  inviteMember(memberId: number): void{
    const clubInvitation: ClubInvitation = {
      ownerId: this.currentUserTouristId,
      memberId: memberId,
      clubId: this.clubId,
      status: "Processing"
    };
    
    this.service.addClubInvitation(clubInvitation).subscribe({
      next: () => { 
      }
    });
  }
}