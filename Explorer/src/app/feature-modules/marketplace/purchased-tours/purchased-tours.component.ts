import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { MarketplaceService } from '../marketplace.service';
import { PurchasedTourPreview } from '../../tour-execution/model/purchased_tour_preview.model';
import { Router } from '@angular/router';
import { TourRatingPreview } from "../../marketplace/model/tour-rating-preview";
import { ImageService } from 'src/app/shared/image/image.service';
import { MapService } from 'src/app/shared/map/map.service';
import { TourLocation } from '../model/tour-location.model';

@Component({
  selector: 'xp-purchased-tours',
  templateUrl: './purchased-tours.component.html',
  styleUrls: ['./purchased-tours.component.css'],
})

export class PurchasedToursComponent implements OnInit {
  user: User;
  purchasedTours: PurchasedTourPreview[] = [];
  toursLocation: TourLocation[] = [];

  constructor(private service: MarketplaceService, private authService: AuthService, private mapService: MapService, private router: Router, private imageService: ImageService) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });

    this.service.getTouristsPurchasedTours(this.user.id).subscribe({
      next: (result) => {
        this.purchasedTours = result;
        this.findToursLocation();
      },
      error: () => {
      }
    });
  }

  openDetails(tour: PurchasedTourPreview): void {
    this.router.navigate([`purchased-tours-details/${tour.id}`]);
  }

  findToursLocation(): void {
    this.purchasedTours.forEach(tour => {
      this.mapService.reverseSearch(tour.checkpoints[0].latitude, tour.checkpoints[0].longitude).subscribe({
        next: (location) => {
          let tourLocation: TourLocation = {
            tourid: 0,
            adress: ''
          };
  
          if (location.address.city === undefined) {
            tourLocation = {
              tourid: tour.id || 0,
              adress: location.address.city_district + ' , ' + location.address.country 
            };
          }
          else {
            tourLocation = {
              tourid: tour.id || 0,
              adress: location.address.city + ' , ' + location.address.country
            };
          }
  
          console.log(location);
          this.toursLocation.push(tourLocation);
        },
        error: (error) => {
          //alert('Error in finding location for lon and lat:');
        }
      });
    });
  }

  getTourLocation(tourid: number): string{
    const tourLocation = this.toursLocation.find(location => location.tourid === tourid);
    return tourLocation?.adress || "";
  }

  averageGrade(tour: PurchasedTourPreview){
    var sum = 0;
    var count = 0;
    for(let g of tour.tourRatings){
      sum += g.rating;
      count ++;
    }
    return parseFloat((sum/count).toFixed(1)).toFixed(1);
  }

  getDemandColor(demandLevel: string): string {
    switch (demandLevel.toLowerCase()) {
      case 'easy':
        return 'green';
      case 'medium':
        return 'orange';
      case 'hard':
        return 'red';
      default:
        return 'black';
    }
  }


  getImageUrl(imageName: string): string {
    return this.imageService.getImageUrl(imageName);
  }
}