import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { MarketplaceService } from '../../marketplace/marketplace.service';

@Component({
  selector: 'xp-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css'],
})
export class MyProfileComponent implements OnInit {
  user: User | undefined;
  cartItemCount: number = 0;

  constructor(private authService: AuthService, private marketplaceService: MarketplaceService){}

  ngOnInit(){
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
    this.marketplaceService.cartItemCount$.subscribe((count) => {
      this.cartItemCount = count;
    });
  }
}
