import { Component } from '@angular/core';
import { TourPreference } from '../../model/preference.model';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { MarketplaceService } from '../../marketplace.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'xp-preference',
  templateUrl: './preference.component.html',
  styleUrls: ['./preference.component.css']
})
export class PreferenceComponent {
  preferences: TourPreference[] = [];
  selectedTour: TourPreference;
  shouldRenderTourForm: boolean = false;
  shouldEdit: boolean = false;
  user: User;

  
  constructor(private service: MarketplaceService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
    this.getPreference();
  }
  
  deletePreference(id: number): void {
    this.service.deleteTourPreference(id).subscribe({
      next: () => {
        this.getPreference();
      },
    })
  }

  getPreference(): void {
    this.service.getTourPreference(this.user.id).subscribe({
      next: (result: TourPreference[]) => {
        this.preferences = result;
        console.log(result)
        //if(!(result.difficulty == null)){
         // this.preferences.push(result);
        //}
      },
      error: () => {
      }
    })
  }

  onEditClicked(preference: TourPreference): void {
    this.selectedTour = preference;
    this.shouldRenderTourForm = true;
    this.shouldEdit = true;
  }

  onAddClicked(): void {
    this.shouldEdit = false;
    this.shouldRenderTourForm = true;
  }
}
