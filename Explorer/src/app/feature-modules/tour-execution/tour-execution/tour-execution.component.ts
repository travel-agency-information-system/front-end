import { Component, OnInit, AfterViewInit, Input, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TourPreview } from '../../marketplace/model/tour-preview';
import { TourExecution } from '../model/tour_execution.model';
import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { TourExecutionService } from '../tour-execution.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SimulatorComponent } from '../simulator/simulator.component';
import { TouristPosition } from '../model/position.model';
import { PurchasedTourPreview } from '../model/purchased_tour_preview.model';
import { Checkpoint } from '../../tour-authoring/model/checkpoint.model';
import { CheckpointPreview } from '../../marketplace/model/checkpoint-preview';
import { MapObject } from '../../tour-authoring/model/map-object.model';
import { Tour } from '../../tour-authoring/model/tour.model';
import { PublicCheckpoint } from '../model/public_checkpoint.model';
import { Encounter } from '../../encounters/model/encounter.model';
import { EncounterExecution } from '../../encounters/model/encounterExecution.model';
import { ForecastPopupComponent } from '../../marketplace/forecast-popup/forecast-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { SecretDialogComponent } from '../secret-dialog/secret-dialog.component';
import { EncounterDialogComponent } from '../encounter-dialog/encounter-dialog.component';
import { AbandonDialogComponent } from '../abandon-dialog/abandon-dialog.component';
import { CompletedEncounterComponent } from '../completed-encounter/completed-encounter.component';
import { ConfirmDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { UnlockSecretDialogComponent } from '../unlock-secret-dialog/unlock-secret-dialog.component';
import { ImageService } from 'src/app/shared/image/image.service';

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'xp-tour-execution',
  templateUrl: './tour-execution.component.html',
  styleUrls: ['./tour-execution.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TourExecutionComponent implements OnInit, AfterViewInit {
  @ViewChild(SimulatorComponent) simulatorComponent: SimulatorComponent;
  tour : PurchasedTourPreview;
  tourId: number = 0;
  tourExecution: TourExecution; 
  tourist: User;
  oldPosition: TouristPosition;
  checkPositions: any;
  publicCheckpoints: PublicCheckpoint[] = [];
  percentage: string = '0'

  completedCheckpoint: Checkpoint[]=[];
  mapObjects: MapObject[] = [];
  
  encounterExecutions : EncounterExecution[] = [];
  availableEncounterExecution: EncounterExecution;
  availableEncounter: Encounter;
  currentlyPeopleOnSocialEncounter: number = 0;

  completedEncounterExecutions : EncounterExecution[] = [];

  notifications: number[]=[1];

  constructor(private service: TourExecutionService, private authService: AuthService, private activatedRoute: ActivatedRoute, 
    private changeDetection: ChangeDetectorRef,
    private dialog: MatDialog, private router: Router, private imageService: ImageService) 
  { }

  ngOnInit(): void {
    this.notifications = [];

    this.service.getMapObjects().subscribe( result => {
      this.mapObjects = result.results;
      this.addMapObjectsOnMap();
    });

    this.service.getPublicCheckpoints().subscribe( result => {
      this.publicCheckpoints = result.results;
      this.addPublicCheckpoinsOnMap();
    });

    this.activatedRoute.params.subscribe(params=>{
      this.tourId = params['tourId'];
      this.authService.user$.subscribe(user => {
      this.tourist = user;

      this.service.getTourExecution(this.tourId).subscribe(result => {
        if(result != null)
        {
          this.tourExecution = result;  
          this.tour = result.tour;    
          this.findCheckpoints();
        }else{
          this.service.startExecution(this.tourId).subscribe( result =>{
            this.tourExecution = result;  
            this.tour = result.tour; 
            this.findCheckpoints();
          });
        }
        this.service.getActiveEncounters(this.tourId).subscribe(rr => {
          this.encounterExecutions = rr;
          this.findCheckpoints();
        });
      });
    });
  });

  this.checkPositions = setInterval(() => {
    this.checkPosition();
  }, 10000);

  }

  ngAfterViewInit(): void{
    if(this.tour != null){
      //
      this.addCheckpointsOnMap();
      this.tourCheckpointsPictureDisplay();
    }
    if(this.mapObjects.length > 0)
      this.addMapObjectsOnMap();
    if(this.publicCheckpoints.length > 0)
      this.addPublicCheckpoinsOnMap();
    if(this.completedCheckpoint.length > 0)
      this.addCompletedCheckpoinsOnMap();
  }
  
  tourCheckpointsPictureDisplay(): void {
    this.tour.checkpoints.forEach(ch => {
      ch.currentPointPicture = 0;
      ch.showedPointPicture = ch.pictures![ch.currentPointPicture];
      ch.currentPicture = 0;
      ch.showedPicture = ch.checkpointSecret?.pictures![ch.currentPicture]||"";
    });
  }

  addCheckpointsOnMap(): void{
    if(this.tour.checkpoints)
    {
      let coords: [{lat: number, lon: number, name: string, desc: string, picture: string}] = [{lat: this.tour.checkpoints[0].latitude, lon: this.tour.checkpoints[0].longitude, name: this.tour.checkpoints[0].name, desc: this.tour.checkpoints[0].description, picture: this.tour.checkpoints[0].pictures![0]}];
      this.tour.checkpoints.forEach(e => {
          if(e != this.tour.checkpoints[0])
            coords.push({lat:e.latitude, lon:e.longitude, name: e.name, desc: e.description, picture: e.pictures![0]});
      });
      if(this.tour.tourTimes != undefined)
      {
        this.tour.tourTimes.forEach(element => {
          this.simulatorComponent.addCheckpoint(coords, element.transportation);
        });
      }
    }
  }
  addMapObjectsOnMap(): void{
    if(this.mapObjects)
    {
      let coords: [{lat: number, lon: number, category: string, name: string, desc: string, picture: string}] = [{lat: this.mapObjects[0].latitude, lon: this.mapObjects[0].longitude, category: this.mapObjects[0].category, name: this.mapObjects[0].name, desc: this.mapObjects[0].description, picture: this.mapObjects[0].pictureURL}];
      this.mapObjects.forEach(e => {
          if(e != this.mapObjects[0])
            if((e.latitude > (this.tour.checkpoints[0].latitude - 2) && (e.latitude < this.tour.checkpoints[0].latitude + 2))
            && ((e.longitude > this.tour.checkpoints[0].longitude - 2) && (e.longitude < this.tour.checkpoints[0].longitude + 2)))
            coords.push({lat:e.latitude, lon:e.longitude, category: e.category, name: e.name, desc: e.description, picture:e.pictureURL});
      });
      this.simulatorComponent.addMapObjects(coords);
    }
  }
  addPublicCheckpoinsOnMap(): void{
    if((this.publicCheckpoints).length != 0)
    {
      let coords: [{lat: number, lon: number, picture: string, name: string, desc: string}] = [{lat: this.publicCheckpoints[0].latitude, lon: this.publicCheckpoints[0].longitude, picture: this.publicCheckpoints[0].pictures[0], name: this.publicCheckpoints[0].name, desc: this.publicCheckpoints[0].description}];
      this.publicCheckpoints.forEach(e => {
          if(e != this.publicCheckpoints[0])
            if((e.latitude > (this.publicCheckpoints[0].latitude - 2) && (e.latitude < this.publicCheckpoints[0].latitude + 2))
            && ((e.longitude > this.publicCheckpoints[0].longitude - 2) && (e.longitude < this.publicCheckpoints[0].longitude + 2)))
            coords.push({lat:e.latitude, lon:e.longitude, picture: e.pictures[0], name: e.name, desc: e.description});
      });
      this.simulatorComponent.addPublicCheckpoints(coords);
    }
  }

  addCompletedCheckpoinsOnMap(): void{
    if((this.completedCheckpoint).length != 0)
    {
      let coords: [{lat: number, lon: number, picture: string, name: string, desc: string}] = [{lat: this.completedCheckpoint[0].latitude, lon: this.completedCheckpoint[0].longitude, picture: this.completedCheckpoint[0].pictures![0], name: this.completedCheckpoint[0].name, desc: this.completedCheckpoint[0].description}];
      this.completedCheckpoint.forEach(e => {
          if(e != this.completedCheckpoint[0])
            if((e.latitude > (this.completedCheckpoint[0].latitude - 2) && (e.latitude < this.completedCheckpoint[0].latitude + 2))
            && ((e.longitude > this.completedCheckpoint[0].longitude - 2) && (e.longitude < this.completedCheckpoint[0].longitude + 2)))
            coords.push({lat:e.latitude, lon:e.longitude, picture: e.pictures![0], name: e.name, desc: e.description});
      });
      this.simulatorComponent.addCompletedCheckpoints(coords);
    }
  }

  completeCheckpoinOnMap( coords: [{lat: number, lon: number, picture: string, name: string, desc: string}]): void{
    if((this.completedCheckpoint).length != 0)
    {
      this.simulatorComponent.addCompletedCheckpoints(coords);
    }
  }

  // Abandon Tour Execution
  abandon(): void{
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
          title: "Confirm",
          message: "Are you sure you want to leave?"}
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if(dialogResult)
      {
        this.service.abandon(this.tourExecution.id!).subscribe(result => {
        });
        this.router.navigate([`home`]);
      }
   });
  }

  // Rate Tour
  rateTour(): void{
    this.router.navigate([`tour-rating-form/` + this.tour.id]);
  }

  // Report an Issue
  reportIssue(): void{
    this.router.navigate([`/my-profile/reporting-issues`]);
  }
  
  // Weather Forecast Popup
  ShowPopup():void{
    if(this.tourExecution.tour.checkpoints.length > 0 ){

      var result={
        lat: this.tourExecution.tour.checkpoints[0].latitude,
        lon: this.tourExecution.tour.checkpoints[0].longitude,
      }
      if(this.oldPosition != undefined)
      {
        result={
          lat: this.oldPosition.latitude,
          lon: this.oldPosition.longitude,
        }
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

  checkPosition(): void{
    if(this.oldPosition != this.simulatorComponent.selectedPosition){
      if(this.oldPosition == undefined)
        this.oldPosition = this.simulatorComponent.selectedPosition;
      if(this.simulatorComponent.selectedPosition != undefined)
      {
        this.service.registerPosition(this.tourExecution.id || 0, this.simulatorComponent.selectedPosition).subscribe( result => {
            this.tourExecution = result;
            this.tour = result.tour;

            this.service.getEncounters(this.tourId, this.simulatorComponent.selectedPosition.longitude, this.simulatorComponent.selectedPosition.latitude).subscribe(result => {
              this.availableEncounterExecution = result;
              this.availableEncounter = this.availableEncounterExecution.encounterDto; 
              if(this.encounterExecutions && !this.encounterExecutions.find(e => e.id == result.id))
                this.encounterExecutions.push(result);

              if(this.availableEncounter && this.availableEncounter.type == 'Social')
              {
                this.currentlyPeopleOnSocialEncounter = this.availableEncounter.activeTouristsIds?.length || 0;
              }
            });
          this.findCheckpoints();
        });
      }
      this.oldPosition = this.simulatorComponent.selectedPosition;
      this.notifications = [];
    }
    if(this.availableEncounter)
    {
      this.checkSocialEncounterStatus();
      //this.checkHiddenLocationEncounterStatus();
    }
      
    console.log("Check position");
    this.notifications.push(1);
    this.changeDetection.detectChanges();
  }

  checkSocialEncounterStatus(): void{
    if(this.encounterExecutions.find(n => n.encounterDto.type == 'Social'))
              {
                this.service.checkIfInRange(this.tourId, this.availableEncounterExecution.id, this.simulatorComponent.selectedPosition.longitude, this.simulatorComponent.selectedPosition.latitude).subscribe(result => {
                  if(result.status == 'Completed' && this.availableEncounterExecution.status != 'Completed')
                  {
                    this.dialog.open(CompletedEncounterComponent, {
                      data: this.availableEncounter 
                    });
                  }
                  this.availableEncounterExecution = result;
                  this.availableEncounter = this.availableEncounterExecution.encounterDto;
                  this.currentlyPeopleOnSocialEncounter = this.availableEncounter.activeTouristsIds?.length || 0;
                  this.encounterExecutions.forEach(e => {
                    if(e.id == result.id)
                    {
                      e = result;
                    }
                  });
                  
                 this.changeDetection.detectChanges();
                });
              }
  }

  checkHiddenLocationEncounterStatus(): void{
    if(this.encounterExecutions.find(n => n.encounterDto.type == 'Location'))
    {
      this.service.checkIfInRangeLocation(this.tourId, this.availableEncounterExecution.id, this.simulatorComponent.selectedPosition.longitude, this.simulatorComponent.selectedPosition.latitude).subscribe(result => {
      this.availableEncounterExecution = result;
      this.availableEncounter = this.availableEncounterExecution.encounterDto;
      this.encounterExecutions.forEach(e => {
        if(e.id == result.id)
          {
            e = result;          
          }
        });
      this.changeDetection.detectChanges();
      });
    }
  }  

  ngOnDestroy() {
    clearInterval(this.checkPositions);
  }


  findCheckpoints(): void{
    this.tourExecution.completedCheckpoints?.forEach(element => {
      var c = this.tour.checkpoints.filter(n => n.id == element.checkpointId);
      if(this.completedCheckpoint.indexOf(this.completedCheckpoint.filter(n=>n.id==element.checkpointId)[0])==-1)
      {
        this.completedCheckpoint.push(c[0]);
        this.completeCheckpoinOnMap([{lat: c[0].latitude, lon: c[0].longitude, picture: c[0].pictures![0], name: c[0].name, desc: c[0].description}])
        this.showUnlockSecretPopup(c[0]);
      }
    });
    this.completedCheckpoint.forEach(element => {
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
    this.calculatePercantage()
    this.changeDetection.detectChanges();
  }

  // Checkpoint Secret
  OnViewSecret(c:Checkpoint):void{
      if(c.isSecretPrerequisite && c.encounterId != 0)
      {
        if(this.availableEncounterExecution.status == 'Completed' && c.encounterId == this.availableEncounterExecution.encounterId)
        {
          c.visibleSecret=!c.visibleSecret;
          c.showedPicture=c.checkpointSecret?.pictures![c.currentPicture]||"";
          if(c.viewSecretMessage=="Show secret")
            c.viewSecretMessage="Hide secret";
          else
            c.viewSecretMessage="Show secret";
        }
      }else{
        c.visibleSecret=!c.visibleSecret;
          c.showedPicture=c.checkpointSecret?.pictures![c.currentPicture]||"";
          if(c.viewSecretMessage=="Show secret")
            c.viewSecretMessage="Hide secret";
          else
            c.viewSecretMessage="Show secret";
      }
  }
  OnNext(c:Checkpoint):void{
   let secretPicturesLength= c.checkpointSecret?.pictures!.length||0;
   if(c.currentPicture==(secretPicturesLength-1))
      c.currentPicture=0;
    else
      c.currentPicture=c.currentPicture+1;
      c.showedPicture=c.checkpointSecret?.pictures![c.currentPicture]||"";
  }
  // SecretDialogComponent open
  viewSecret(ch: Checkpoint): void{
    this.dialog.open(SecretDialogComponent, {
      data: ch 
    });
  }

  // Checkpoint Pictures change 
  OnPictureNext(c:Checkpoint):void{
    let picturesLength= c.pictures!.length;
   if(c.currentPointPicture==(picturesLength-1))
      c.currentPointPicture=0;
    else
      c.currentPointPicture=c.currentPointPicture+1;
      c.showedPointPicture=c.pictures![c.currentPointPicture]||"";
  }
  OnPictureBack(c:Checkpoint):void{
    let picturesLength= c.pictures!.length;
   if(c.currentPointPicture==0)
      c.currentPointPicture=(picturesLength-1);
    else
      c.currentPointPicture=c.currentPointPicture-1;
      c.showedPointPicture=c.pictures![c.currentPointPicture]||"";
  }

  ///// ENCOUNTERS /////
  canSeeAvailableEncounter(): boolean{
    if (this.availableEncounter && this.availableEncounterExecution.status !== 'Completed'){
      return true;
    }
    return false;
  }

  onActivate(id: number): void{
    this.service.activateEncounter(id, this.oldPosition.longitude, this.oldPosition.latitude)
    .subscribe(result =>{
      this.availableEncounterExecution = result;
      this.availableEncounterExecution.encounterDto = this.availableEncounter;
      const indexToUpdate = this.encounterExecutions.findIndex(element => element.id === this.availableEncounterExecution.id);
      if (indexToUpdate !== -1) {
        this.encounterExecutions[indexToUpdate] = result;
        this.encounterExecutions[indexToUpdate].encounterDto = this.availableEncounterExecution.encounterDto;
      }
      console.log(this.encounterExecutions);

      if(this.availableEncounterExecution.status == 'Active' && this.availableEncounter.type=='Social')
      this.currentlyPeopleOnSocialEncounter = this.currentlyPeopleOnSocialEncounter + 1;
      this.changeDetection.detectChanges();
    });
  }

  onComplete(encounterExecution: EncounterExecution): void{
    this.service.completeEncounter(encounterExecution.id, this.oldPosition.longitude, this.oldPosition.latitude)
    .subscribe(result =>{
      this.availableEncounterExecution = result;
      this.availableEncounterExecution.encounterDto = this.availableEncounter;
      const indexToUpdate = this.encounterExecutions.findIndex(element => element.id === this.availableEncounterExecution.id);
      if (indexToUpdate !== -1) {
        this.encounterExecutions[indexToUpdate] = result;
        this.encounterExecutions[indexToUpdate].encounterDto = this.availableEncounterExecution.encounterDto;
      }
      console.log(this.encounterExecutions);

      this.dialog.open(CompletedEncounterComponent, {
        data: this.availableEncounter 
      });
      this.changeDetection.detectChanges();
    });
  }

  // EncounterDialogComponent open
  viewEncounter(encounterId: number): void{
    this.encounterExecutions.forEach(encExecution => {
      if (encounterId === encExecution.encounterId){
        
        const dialogRef = this.dialog.open(EncounterDialogComponent, {
          data: {
              encounterExecution: encExecution,
              longitude: this.oldPosition.longitude,
              latitude: this.oldPosition.latitude
            }
        });
    
        dialogRef.afterClosed().subscribe(dialogResult => {
          if(dialogResult == 'Activate')
          {
            this.onActivate(this.availableEncounter.id || 0);
          }
          if(dialogResult == 'Complete')
          {
            this.onComplete(this.availableEncounterExecution);
          }
       });
      }
    });
  }

  calculatePercantage(): void{
    this.percentage = ((this.completedCheckpoint).length / (this.tour.checkpoints).length * 100).toFixed(0);
  }

  showUnlockSecretPopup(checkpoint: Checkpoint): void{
    const dialogRef = this.dialog.open(UnlockSecretDialogComponent, {
      data: {
          checkpointName: checkpoint.name,
          unlocked: !checkpoint.isSecretPrerequisite
        }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if(dialogResult && checkpoint.isSecretPrerequisite)
      {
        this.viewEncounter(checkpoint.encounterId);
      }
      if(dialogResult && !checkpoint.isSecretPrerequisite)
      {
        this.viewSecret(checkpoint);
      }
   });
  }

  isHovered = false;
  toggleHover(hovered: boolean) {
    this.isHovered = hovered;
  }

  getImageUrl(imageName: string): string {
    return this.imageService.getImageUrl(imageName);
  }
}