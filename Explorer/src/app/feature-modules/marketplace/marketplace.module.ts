import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { ReportingIssueComponent } from './reporting-issue/reporting-issue.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PreferenceComponent } from './preference/preference/preference.component';
import { PreferenceFormComponent } from './preference-form/preference-form/preference-form.component';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { TourRatingComponent } from './tour-rating/tour-rating.component';
import { TourRatingFormComponent } from './tour-rating-form/tour-rating-form.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TourAuthoringModule } from "../tour-authoring/tour-authoring.module";
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { PurchasedToursComponent } from './purchased-tours/purchased-tours.component';
import { TourOverviewComponent } from './tour-overview/tour-overview.component';
import { TourOverviewDetailsComponent } from './tour-overview-details/tour-overview-details.component';
import { PurchasedToursDetailsComponent } from './purchased-tours-details/purchased-tours-details.component';
import { TourRatingEditFormComponent } from './tour-rating-edit-form/tour-rating-edit-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ForecastPopupComponent } from './forecast-popup/forecast-popup.component';
import { CompositeTourFormComponent } from './composite-tour-form/composite-tour-form.component';
import { CompositeToursComponent } from './composite-tours/composite-tours.component';
import { CompositeEquipmentPopupComponent } from './composite-equipment-popup/composite-equipment-popup.component';
import { CompositeKeypointPopupComponent } from './composite-keypoint-popup/composite-keypoint-popup.component';
import { TourBundleTableComponent } from './tour-bundle-table/tour-bundle-table.component';
import { SaleComponent } from './sale/sale.component';
import { SaleFormComponent } from './sale-form/sale-form.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CreateCouponFormComponent } from './create-coupon-form/create-coupon-form.component';
import { ViewCouponAuthorComponent } from './view-coupon-author/view-coupon-author.component';

@NgModule({
    declarations: [
        ReportingIssueComponent,
        PreferenceComponent,
        PreferenceFormComponent,
        TourRatingComponent,
        TourRatingFormComponent,
        ReportingIssueComponent,
        ShoppingCartComponent,
        PurchasedToursComponent,
        TourOverviewComponent,
        TourOverviewDetailsComponent,
        PurchasedToursDetailsComponent,
        TourRatingEditFormComponent,
        ForecastPopupComponent,
        CompositeTourFormComponent,
        CompositeToursComponent,
        CompositeEquipmentPopupComponent,
        CompositeKeypointPopupComponent,
        TourBundleTableComponent,
        SaleComponent,
        SaleFormComponent,
        CreateCouponFormComponent,
        ViewCouponAuthorComponent,
    ],
    exports: [
        PreferenceFormComponent,
        TourRatingFormComponent,
        PurchasedToursComponent,
        PurchasedToursDetailsComponent,
        CreateCouponFormComponent,
        ViewCouponAuthorComponent,
    ],
    imports: [
        CommonModule,
        MatInputModule,
        MatFormFieldModule,
        MatRadioModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        SharedModule,
        TourAuthoringModule,
        MatDialogModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule
    ]
  })

export class MarketplaceModule { }