import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdministrationService } from '../administration.service';
import { Club } from '../model/club.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'xp-club-form',
  templateUrl: './club-form.component.html',
  styleUrls: ['./club-form.component.css']
})
export class ClubFormComponent implements OnChanges  {

  @Output() clubUpdated = new EventEmitter<null>();
  @Input() club: Club;
  @Input() shouldEdit: boolean = false;

  clubs: Club[] = [];

  constructor(private authService: AuthService, private service: AdministrationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.clubForm.reset();
    if (this.shouldEdit) {
      this.clubForm.patchValue(this.club);
    }
  }

  clubForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required])
  })

  addClub(): void {
    // Dohvati najnovije podatke pre nego što generišeš novi ID

    this.service.getClub().subscribe({
      next: (result: PagedResults<Club>) => {
        console.log(result);
        this.clubs = result.results;

        // Generiši ID
        const club: Club = {
          //id: generateId(this.clubs),
          name: this.clubForm.value.name || "",
          description: this.clubForm.value.description || "",
          image: this.clubForm.value.image || "",
          touristId: findLoggedUser(this.authService),
          users: []
        };
        
        // Dodaj klub
        this.service.addClub(club).subscribe({
          next: () => { 
            console.log("Uspešno dodat klub");
            this.clubUpdated.emit();
          }
        });

        console.log(this.clubForm.value);
      }
    });
  }

  updateClub(): void {
    const club: Club = {
      //id: generateId(this.clubs),
      name: this.clubForm.value.name || "",
      description: this.clubForm.value.description || "",
      image: this.clubForm.value.image || "",
      touristId: findLoggedUser(this.authService),
      users: []
    };
    club.id = this.club.id;
    this.service.updateClub(club).subscribe({
      next: () => {
        this.clubUpdated.emit()
      }
    })
  }

}

/*function generateId(existingClubs: Club[]): number {

  if (existingClubs.length === 0) {
    return 1; 
  }

  const maxId = Math.max(...existingClubs.map(club => club.id));
  return maxId + 1;
}
*/

function findLoggedUser(authService: AuthService): number {
  let userId: number | null = null;

  const subscription = authService.user$.subscribe(user => {
    if (user) {
      userId = user.id;
    }
  });

  subscription.unsubscribe();

  return userId ?? 999;  
}