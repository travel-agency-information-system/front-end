import { Component, OnInit, ViewChild } from '@angular/core';
import { MarketplaceService } from '../marketplace.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { Coupon } from '../model/coupon.model';
import { Tour } from '../../tour-authoring/model/tour.model';
import { Router } from "@angular/router";
import { TourAuthoringService } from '../../tour-authoring/tour-authoring.service';

@Component({
  selector: 'xp-view-coupon-author',
  templateUrl: './view-coupon-author.component.html',
  styleUrls: ['./view-coupon-author.component.css']
})
export class ViewCouponAuthorComponent implements OnInit{

  constructor(
    private authService: AuthService,
    private marketPlaceService: MarketplaceService,
    private tourAuthoringService: TourAuthoringService,
    private router: Router,){ }

  user: User | undefined;
  coupons: Coupon[];
  tours : Tour[];
  discountPercentage: number;
  expirationDate: Date;
  isGlobal: boolean = false;
  selectedTourId: number | null;
  selectedCoupon: Coupon | undefined;
  isEditing: boolean = false;
  

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.getCoupons();
      this.getTours();
    });
  }

  getCoupons(): void {
    this.marketPlaceService.getAuthorCoupons().subscribe((result: Coupon[]) => {
      console.log(result); // Log the result to see if data is coming.
      this.coupons = result;
    });
  }

  getTours(): void {
    this.tourAuthoringService.getTour().subscribe((result: Tour[]) => {
      this.tours = result;
    });
  }

  deleteCoupons(couponId: number): void {
    this.marketPlaceService.deleteCoupon(couponId).subscribe((result: Coupon) => {
      this.getCoupons();
    });
  }

  editCoupon(coupon: Coupon): void {
    this.isEditing = true;

    this.selectedCoupon = coupon;

    this.discountPercentage = coupon.discountPercentage;
    this.expirationDate = coupon.expirationDate;
    this.isGlobal = coupon.isGlobal;
    this.selectedTourId = coupon.tourId;
  }

  updateCoupon(): void {
    if(this.selectedCoupon){
      if(this.isGlobal){
        this.selectedTourId = null;
      }
      const coupon: Coupon = {
        id: this.selectedCoupon.id,
        code: this.selectedCoupon.code,
        discountPercentage: this.discountPercentage,
        expirationDate: this.expirationDate,
        isGlobal: this.isGlobal,
        tourId: this.selectedTourId
      };
      this.marketPlaceService.updateCoupon(coupon).subscribe((result: Coupon) => {
        this.discountPercentage = 0;
        this.expirationDate = new Date();
        this.isGlobal = false;
        this.selectedTourId = null;
        this.getCoupons();
      });
      this.isEditing = false;
    }
  }

  onCreateCoupnClick(): void {
    this.router.navigate([`/create-coupon`]);
  }

  getGlobalStatusText(isGlobal: boolean, tourId: number): string {
    if (!isGlobal)
    return 'Coupon for tour ' + this.tours.filter(t => t.id == tourId)[0].name;
  else
    return 'Global coupon';
  }

  cancelUpdate() {
    this.isEditing = false;
  } 

}
