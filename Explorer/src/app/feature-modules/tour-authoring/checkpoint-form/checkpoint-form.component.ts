import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Checkpoint } from '../model/checkpoint.model';
import { TourAuthoringService } from '../tour-authoring.service';
import { MapComponent } from 'src/app/shared/map/map.component';
import { Router } from '@angular/router';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { PublicCheckpoint } from '../../tour-execution/model/public_checkpoint.model';
import { ImageService } from 'src/app/shared/image/image.service';
import { NumberInput } from '@angular/cdk/coercion';


@Component({
  selector: 'xp-checkpoint-form',
  templateUrl: './checkpoint-form.component.html',
  styleUrls: ['./checkpoint-form.component.css']
})
export class CheckpointFormComponent implements OnChanges, OnInit{

  @ViewChild(MapComponent) mapComponent: MapComponent;
  @Output() checkpointUpdated = new EventEmitter<null>();
  @Input() selectedCheckpoint: Checkpoint;
  @Input() shouldEdit: boolean = false;
  @Input() tourID: number = 0;
  longitude: number = 0;
  latitude: number = 0;
  publicCheckpoints: PublicCheckpoint[] = [];
  picturePreview: string[] = [];
  selectPublicCPName: string ='';

  constructor(private service: TourAuthoringService, private imageService: ImageService, private router:Router,
    private tokenStorage: TokenStorage) {
    this.checkpointForm.controls.latitude.disable();
    this.checkpointForm.controls.longitude.disable();
  }

  ngOnInit(): void {

    this.service.getPublicCheckpoints().subscribe(result => {
      this.publicCheckpoints = result.results;
      this.addPublicCheckpoinsOnMap();
    });
    this.service.getCheckpoint(this.selectedCheckpoint.id || 0).subscribe(result =>{
      this.selectedCheckpoint = result;
    });

  }
  ngAfterViewInit(): void {
    if(this.shouldEdit) {
      this.latitude = this.selectedCheckpoint.latitude;
      this.longitude=this.selectedCheckpoint.longitude;
      this.searchByCoord(this.latitude, this.longitude);
      this.searchByAddress(this.checkpointForm.controls.address.value || '');
      this.picturePreview = this.selectedCheckpoint.pictures?.map(imageName => this.getImageUrl(imageName)) || [];
    } else {
      this.picturePreview = [];
    }
    if(this.publicCheckpoints.length > 0)
      this.addPublicCheckpoinsOnMap();
  }

  addPublicCheckpoinsOnMap(): void{
    if(this.publicCheckpoints)
    {
      let coords: [{lat: number, lon: number, picture: string, name: string, desc: string}] = [{lat: this.publicCheckpoints[0].latitude, lon: this.publicCheckpoints[0].longitude, picture: this.publicCheckpoints[0].pictures[0], name: this.publicCheckpoints[0].name, desc: this.publicCheckpoints[0].description}];
      this.publicCheckpoints.forEach(e => {
          if(e != this.publicCheckpoints[0])
            if((e.latitude > (this.publicCheckpoints[0].latitude - 2) && (e.latitude < this.publicCheckpoints[0].latitude + 2))
            && ((e.longitude > this.publicCheckpoints[0].longitude - 2) && (e.longitude < this.publicCheckpoints[0].longitude + 2)))
            coords.push({lat:e.latitude, lon:e.longitude, picture: e.pictures[0], name: e.name, desc: e.description});
      });
      this.mapComponent.addPublicCheckpoints(coords);
    }
  }
  ngOnChanges(): void {
    this.checkpointForm.reset();

    if (this.shouldEdit) {
      const { requiredTimeInSeconds, pictures, ...checkpointWithoutTimeAndPictures } = this.selectedCheckpoint;
      this.checkpointForm.patchValue({
        ...checkpointWithoutTimeAndPictures,
        hours: Math.round(requiredTimeInSeconds / 3600),
        minutes: (requiredTimeInSeconds % 3600) / 60,
      });
      this.tourID = this.selectedCheckpoint.tourId;
      this.picturePreview = pictures?.map(imageName => this.getImageUrl(imageName)) || [];
    } else {
      this.picturePreview = [];
    }
  }

  checkpointForm = new FormGroup({
    tourID: new FormControl(this.tourID, [Validators.required]),
    longitude: new FormControl(0, [Validators.required]),
    latitude: new FormControl(0, [Validators.required]),
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    address: new FormControl(''),
    hours: new FormControl(0),
    minutes: new FormControl(0),
    status: new FormControl('Private', [Validators.required]),
    publicCP: new FormControl(''),
    pictures: new FormControl('')
  });

  addCheckpoint(): void {
    const formData = new FormData();

    const checkpoint = this.fillAddForm();
    this.fillFormData(formData, checkpoint);
    this.fillImages(formData);

    const status = this.checkpointForm.value.status || 'Private'
    if (this.validate(checkpoint.name))
    {
      this.service.addCheckpoint(formData, status).subscribe({
        next: (result:any) => { this.checkpointUpdated.emit();
          //this.router.navigate([`checkpoint-secret/${result.id}`]);
          this.router.navigate([`encounter-form/${result.id}`]);

        }
      });
    }
  }

  updateCheckpoint(): void {
    const formData = new FormData();

    const checkpoint = this.fillUpdateForm();
    this.fillFormData(formData, checkpoint);
    this.fillImages(formData);

    checkpoint.id = this.selectedCheckpoint.id;
    if(this.validate(checkpoint.name))
    {
      this.service.updateCheckpoint(checkpoint.id!, formData).subscribe({
        next: (result: any) => {
          this.checkpointUpdated.emit();
          //this.router.navigate([`checkpoint-secret/${result.id}`]);
          this.router.navigate([`encounter-form/${result.id}`]);

        }
      });
    }
  }

  private searchByAddress(inputAddress: string) {
    this.mapComponent.search(inputAddress).subscribe({
      next: (location) => {
        // Handle the location data here 
        // eg. send it to back-end
        const foundLocation = location;
        console.log('Found Location Lat:', foundLocation.lat);
        console.log('Found Location Lon:', foundLocation.lon);
        console.log('Found Location Name:', foundLocation.display_name);
        this.latitude = foundLocation.lat;
        this.longitude = foundLocation.lon;
        this.checkpointForm.controls.latitude.setValue(foundLocation.lat);
        this.checkpointForm.controls.longitude.setValue(foundLocation.lon);
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }

  // GEOCODING
  // When taking in an address from map
  // eg. user puts a marker on the map
  onMapClick(event: { lat: number; lon: number }) {
    this.searchByCoord(event.lat, event.lon);
  }

  onAddAddressClick()
  {
    let address = this.checkpointForm.controls.address.value || '';
    if(address != '')
      this.searchByAddress(address);
  }

  private searchByCoord(lat: number, lon: number) {
    this.mapComponent.reverseSearch(lat, lon).subscribe({
      next: (location) => {
        // Handle the location data here
        const foundLocation = location;
        console.log('Found Location Lat:', foundLocation.lat);
        console.log('Found Location Lon:', foundLocation.lon);
        console.log('Found Location Name:', foundLocation.display_name);
        this.latitude = foundLocation.lat;
        this.longitude = foundLocation.lon;
        this.checkpointForm.controls.latitude.setValue(this.latitude);
        this.checkpointForm.controls.longitude.setValue(this.longitude);
        this.checkpointForm.controls.address.setValue(foundLocation.display_name);
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }

  onBack(): void{
    location.reload();
  }

  validate(name: string): boolean{
    return name!='';
  }

  onPublicCPChange($event: any): void{
    var pc = this.publicCheckpoints.filter(n => n.id?.toString() == this.checkpointForm.controls.publicCP.value)[0];
    this.selectPublicCPName = pc.name;
    this.checkpointForm.reset();
    this.checkpointForm.controls.description.setValue(pc.description);
    this.checkpointForm.controls.name.setValue(pc.name);
    this.checkpointForm.controls.latitude.setValue(pc.latitude);
    this.checkpointForm.controls.longitude.setValue(pc.longitude);
    this.checkpointForm.controls.status.setValue('Private');
    this.picturePreview = pc.pictures;
    this.onMapClick({lat: pc.latitude, lon: pc.longitude});
  }

  private fillImages(formData: FormData) {
    if (this.checkpointForm.value.pictures) {
      const selectedFiles = this.checkpointForm.value.pictures;
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('pictures', selectedFiles[i]);
        console.log(formData.get('pictures'))
      }
    }
  }

  private fillAddForm() {
    const checkpoint: Checkpoint = {
      encounterId: 0,
      tourId: this.tourID,
      longitude: this.longitude || 0,
      latitude: this.latitude || 0,
      name: this.checkpointForm.value.name || "",
      description: this.checkpointForm.value.description || "",
      requiredTimeInSeconds: (this.checkpointForm.value.hours || 0) * 3600 + (this.checkpointForm.value.minutes || 0) * 60,
      currentPicture: 0,
      visibleSecret: false,
      showedPicture: "",
      viewSecretMessage: "",
      currentPointPicture: 0,
      showedPointPicture: "",
      authorId: this.service.user.id,
      isSecretPrerequisite: true
    };
    return checkpoint;
  }

  private fillUpdateForm() {
    const checkpoint: Checkpoint = {
      tourId: this.tourID,
      longitude: this.longitude || 0,
      latitude: this.latitude || 0,
      name: this.checkpointForm.value.name || "",
      description: this.checkpointForm.value.description || "",
      requiredTimeInSeconds: (this.checkpointForm.value.hours || 0) * 3600 + (this.checkpointForm.value.minutes || 0) * 60,
      checkpointSecret: this.selectedCheckpoint.checkpointSecret,
      currentPicture: 0,
      visibleSecret: false,
      showedPicture: "",
      viewSecretMessage: "",
      currentPointPicture: 0,
      showedPointPicture: "",
      authorId: this.selectedCheckpoint.authorId,
      encounterId: this.selectedCheckpoint.encounterId,
      isSecretPrerequisite: this.selectedCheckpoint.isSecretPrerequisite
    };
    return checkpoint;
  }


  private fillFormData(formData: FormData, checkpoint: Checkpoint) {
    formData.append('encounterId', checkpoint.encounterId.toString());
    formData.append('tourId', checkpoint.tourId.toString());
    formData.append('longitude', checkpoint.longitude.toString());
    formData.append('latitude', checkpoint.latitude.toString());
    formData.append('name', checkpoint.name);
    formData.append('description', checkpoint.description);
    formData.append('requiredTimeInSeconds', checkpoint.requiredTimeInSeconds.toString());
    formData.append('checkpointSecret', JSON.stringify(checkpoint.checkpointSecret));
    formData.append('currentPicture', checkpoint.currentPicture.toString());
    formData.append('visibleSecret', checkpoint.visibleSecret.toString());
    formData.append('showedPicture', checkpoint.showedPicture);
    formData.append('viewSecretMessage', checkpoint.viewSecretMessage);
    formData.append('currentPointPicture', checkpoint.currentPointPicture.toString());
    formData.append('showedPointPicture', checkpoint.showedPointPicture);
    formData.append('authorId', checkpoint.authorId.toString());
    formData.append('isSecretPrerequisite', checkpoint.isSecretPrerequisite.toString());
    console.log(JSON.stringify(checkpoint.checkpointSecret));
  }

  onImageSelected(event: any): void {
    const selectedFiles = event?.target?.files;

    if (selectedFiles && selectedFiles.length > 0) {
      this.picturePreview = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const reader = new FileReader();

        reader.onload = (e) => {
          this.picturePreview.push(e.target?.result as string);
        };

        reader.readAsDataURL(selectedFiles[i]);
      }
    }
    this.checkpointForm.get('pictures')?.setValue(selectedFiles);
  }

  getImageUrl(imageName: string): string {
    return this.imageService.getImageUrl(imageName);
  }
}
