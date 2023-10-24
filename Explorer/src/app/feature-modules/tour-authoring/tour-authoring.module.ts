import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourFormComponent } from './tour-form/tour-form.component';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TourComponent } from './tour/tour.component';
import { TourDetailsComponent } from './tour-details/tour-details.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    
  
    TourFormComponent,
              TourComponent,
              TourDetailsComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    RouterModule
    
  ],
  exports:[
    TourFormComponent
  ]
})
export class TourAuthoringModule { }
