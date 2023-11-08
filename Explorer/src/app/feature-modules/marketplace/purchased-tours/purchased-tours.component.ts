import { Component, NgIterable, OnInit } from '@angular/core';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { Tour } from '../../tour-authoring/model/tour.model';
import { MarketplaceService } from '../marketplace.service';
import { TourAuthoringService } from '../../tour-authoring/tour-authoring.service';
import { TourPreview } from '../model/tour-preview';
import { Router } from '@angular/router';

@Component({
  selector: 'xp-purchased-tours',
  templateUrl: './purchased-tours.component.html',
  styleUrls: ['./purchased-tours.component.css'],
})

export class PurchasedToursComponent implements OnInit {
  user: User;
  purchasedTours: Tour[] = [];

  constructor(private service: MarketplaceService, private tourService: TourAuthoringService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });

    this.service.getCustomersPurchasedTours(this.user.id).subscribe({
      next: (result: Tour[]) => {
        this.purchasedTours = result;
      },
      error: () => {
        // Obrada greške
      }
    });

  }

  openDetails(tour:Tour):void{
    this.router.navigate([`purchased-tours-details/${tour.id}`]);
  }
  
  start(tour: Tour): void
  {
    this.service.startExecution(tour.id || 0, this.user.id).subscribe({
    });
  }
}