import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdministrationService } from '../administration.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Club } from '../model/club.model';
import { ClubInvitation } from '../model/club-invitation.model';

@Component({
  selector: 'xp-club-invitations',
  templateUrl: './club-invitations.component.html',
  styleUrls: ['./club-invitations.component.css']
})
export class ClubInvitationsComponent implements OnInit{
  currentUserTouristId: number = 0;
  invitations: ClubInvitation[] = [];

  constructor(private authService: AuthService, private service: AdministrationService) { }

  ngOnInit(): void {
    this.getClubInvitations();

    this.authService.user$.subscribe(user => {
      this.currentUserTouristId = user?.id || 0;
    });
  }

  getClubInvitations(): void{
    this.service.getClubInvitations().subscribe({
      next: (result: PagedResults<ClubInvitation>) => {
        this.invitations = result.results
        .filter(invitation => invitation.memberId === this.currentUserTouristId && invitation.status === 'Processing');
      },
      error: () => {
      }
    })
  }

  acceptInvite(invitation: ClubInvitation): void{
    invitation.status = "Accepted";
    this.service.updateClubInvitation(invitation).subscribe({
      next: () => {
        this.getClubInvitations();
      }
    })
    console.log(invitation.memberId);
      console.log(invitation.clubId);

    this.service.addMemberToClub(invitation.memberId, invitation.clubId).subscribe({
      next: () => {
        this.getClubInvitations();
      }
    })
  }

  rejectInvite(invitation: ClubInvitation): void{
    invitation.status = "Rejected";
    this.service.updateClubInvitation(invitation).subscribe({
      next: () => {
        this.getClubInvitations();
      }
    })
  }
}
