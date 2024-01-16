import { Component, OnInit , EventEmitter,Input, ViewChild} from '@angular/core';
import { Tour } from '../model/tour.model';
import { TourAuthoringService } from '../tour-authoring.service';
import { ActivatedRoute } from '@angular/router';
import { Checkpoint } from '../model/checkpoint.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { MapComponent } from 'src/app/shared/map/map.component';
import { Equipment } from '../model/equipment.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ForecastPopupComponent } from 'src/app/feature-modules/marketplace/forecast-popup/forecast-popup.component';
import { ImageService } from 'src/app/shared/image/image.service';

@Component({
  selector: 'xp-tour-details',
  templateUrl: './tour-details.component.html',
  styleUrls: ['./tour-details.component.css']
})
export class TourDetailsComponent implements OnInit{
  @ViewChild(MapComponent) mapComponent: MapComponent;
  tour:Tour;
  checkpoints: Array<Checkpoint> = [];

  profiles: string[] = ['walking', 'cycling', 'driving'];
  profile: string = this.profiles[0];
  secretVisible:Boolean=false;


  constructor(private service: TourAuthoringService, private activatedRoute: ActivatedRoute, private router: Router, public dialog: MatDialog, private imageService: ImageService) { }
  tourID:number;
  ngOnInit(): void {
   this.activatedRoute.params.subscribe(params=>{
    this.tourID=params['id'];
    this.getTour(this.tourID);

    this.service.getCheckpointsByTour(this.tourID).subscribe({
      next: (result: PagedResults<Checkpoint>) => {
        this.checkpoints = result.results;
        this.profiles = [];
        this.tour.tourTimes.forEach(e => {
          this.profiles.push(e.transportation);
        });
        this.profile = this.profiles[0];
        if(this.checkpoints != null)
        { 
          this.route();
        } 
      }
   });
  })
}
  route(): void{
    let coords: [{lat: number, lon: number, name: string, desc: string, picture: string}] = [{lat: this.checkpoints[0].latitude, lon: this.checkpoints[0].longitude, name: this.checkpoints[0].name, desc: this.checkpoints[0].description, picture: this.checkpoints[0].pictures![0]}];
    this.checkpoints.forEach(e => {
        if(e != this.checkpoints[0])
          coords.push({lat:e.latitude, lon:e.longitude, name: e.name, desc: e.description, picture:e.pictures![0]});
    });
    this.mapComponent.setRouteWithInfo(coords, this.profile);
  }

  ngAfterViewInit(): void {
    if(this.checkpoints != null)
    {
      let coords: [{lat: number, lon: number, name: string, desc: string, picture: string}] = [{lat: this.checkpoints[0].latitude, lon: this.checkpoints[0].longitude, name: this.checkpoints[0].name, desc: this.checkpoints[0].description, picture: this.checkpoints[0].pictures![0]}];
      this.checkpoints.forEach(e => {
          if(e != this.checkpoints[0])
            coords.push({lat:e.latitude, lon:e.longitude, name: e.name, desc: e.description, picture: e.pictures![0]});
      });
      this.mapComponent.setRouteWithInfo(coords, this.profile);
  }
}
  getTour(id: number): void {
    this.service.get(id).subscribe((result: Tour) => {
      this.tour = result;
      console.log(this.tour.checkpoints);
      this.tour.checkpoints.forEach(element => {
        if(element.currentPicture==undefined)
        {
          element.currentPicture=0;
          element.showedPicture=element.checkpointSecret?.pictures![element.currentPicture]||"";
        }
        if(element.visibleSecret==undefined)
          element.visibleSecret=false;
        if(element.viewSecretMessage==undefined)
          element.viewSecretMessage="Show secret";
        if(element.currentPointPicture==undefined)
          element.currentPointPicture=0;
        if(element.showedPointPicture==undefined)
        element.showedPointPicture=element.pictures![element.currentPointPicture];
      });
  
    });
  }

  onDelete():void{
    let id=this.tour.id||0;
    this.service.deleteTour(id).subscribe({
      next: () => {
        this.router.navigate([`tour`]);
      },
    })
  }

  onBack():void{
    this.router.navigate([`tour`]);

  }

  onEdit():void{
    this.router.navigate([`tour-form/${this.tourID}`]);
  }

  publishTour(): void{
    this.service.publishTour(this.tour.id || 0).subscribe({
      next: (result: Tour) => {
        this.tour = result;
        this.fillCheckpointDetails();

      }
    });
  }

  archive(): void {
    this.service.archiveTour(this.tour).subscribe({
      next: (result: Tour) => {
        this.tour = result;
        this.fillCheckpointDetails();
      },
    })
  }

  fillCheckpointDetails():void{
    this.tour.checkpoints.forEach(element => {
      if(element.currentPicture==undefined)
      {
        element.currentPicture=0;
        element.showedPicture=element.checkpointSecret?.pictures![element.currentPicture]||"";
      }
      if(element.visibleSecret==undefined)
        element.visibleSecret=false;
      if(element.viewSecretMessage==undefined)
        element.viewSecretMessage="Show secret";
      if(element.currentPointPicture==undefined)
        element.currentPointPicture=0;
      if(element.showedPointPicture==undefined)
      element.showedPointPicture=element.pictures![element.currentPointPicture];
    });
  }

  profileChanged($event: any): void{
    this.route();
  }

  OnViewSecret(c:Checkpoint):void{
    c.visibleSecret=!c.visibleSecret;
    c.showedPicture=c.checkpointSecret?.pictures![c.currentPicture || 0]||"";
    if(c.viewSecretMessage=="Show secret")
      c.viewSecretMessage="Hide secret";
    else
      c.viewSecretMessage="Show secret";
  }

  OnNext(c:Checkpoint):void{
   let secretPicturesLength= c.checkpointSecret?.pictures!.length||0;
   if(c.currentPicture==(secretPicturesLength-1))
      c.currentPicture=0;
    else
      c.currentPicture=c.currentPicture || 0+1;
      c.showedPicture=c.checkpointSecret?.pictures![c.currentPicture]||"";

  }

  OnPictureNext(c:Checkpoint):void{
    let picturesLength= c.pictures!.length;
   if(c.currentPointPicture==(picturesLength-1))
      c.currentPointPicture=0;
    else
      c.currentPointPicture=c.currentPointPicture || 0 +1;
      c.showedPointPicture=c.pictures![c.currentPointPicture]||"";
  }

  OnPictureBack(c:Checkpoint):void{
    let picturesLength= c.pictures!.length;
   if(c.currentPointPicture==0)
      c.currentPointPicture=(picturesLength-1);
    else
      c.currentPointPicture=c.currentPointPicture || 0-1;
      c.showedPointPicture=c.pictures![c.currentPointPicture]||"";
  }

  ShowPopup():void{
    if(this.checkpoints.length > 0 ){

      const result={
        lat: this.checkpoints[1].latitude,
        lon: this.checkpoints[1].longitude,
      }
      this.dialog.open(ForecastPopupComponent, {
        data: result,
         width: '500px',
         height:'520px',
         panelClass: 'custom-dialog',
       });
       console.log(result);
    }
  }

  getImageUrl(imageName: string): string {
    return this.imageService.getImageUrl(imageName);
  }

  goToTourStatistics(): void{
    this.router.navigate([`tour-checkpoint-statistics/${this.tourID}`]);
  }
  
  goTourStatistics(): void{
    this.router.navigate(['tour-statistics']);
  }
}
