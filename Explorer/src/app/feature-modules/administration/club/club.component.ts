import { Component, OnInit } from '@angular/core';
import { AdministrationService } from '../administration.service';
import { Club } from '../model/club.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'xp-club',
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.css']
})
export class ClubComponent implements OnInit {

  club: Club[] = [];
  selectedClub: Club;
  shouldEdit: boolean;
  shouldAdd: boolean = false;
  currentUserTouristId: number = 0; //

  constructor(private authService: AuthService, private service: AdministrationService, private router: Router) { }

  ngOnInit(): void {
    this.getClub();

    this.authService.user$.subscribe(user => {
      this.currentUserTouristId = user?.id || 0;
    });
  }

  getClub(): void {
    this.service.getClub().subscribe({
      next: (result: PagedResults<Club>) => {
        this.club = result.results;
      },
      error: () => {
      }
    })  }

    onEditClicked(club: Club): void {
      this.selectedClub = club;
      this.shouldEdit = true;
    }

    onAddClicked(): void {
        this.shouldAdd = true;
        this.shouldEdit = false;
    }

    onCloseClicked(): void {
      this.shouldAdd = false;
      this.shouldEdit = false;
    }

    isCurrentUserOwner(club: Club): boolean {
      return this.currentUserTouristId === club.touristId;
    }

    deleteClub(id: number): void {
      this.service.deleteClub(id).subscribe({
        next: () => {
          this.getClub();
        },
      })
    }

    navigateToManageMembers(clubId : number): void{
      this.router.navigate(['/club-members', clubId]);
    }
}
