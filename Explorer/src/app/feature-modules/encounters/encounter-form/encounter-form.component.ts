import { Component, OnInit } from '@angular/core';
import { EncounterService } from '../encounter.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ImageService } from 'src/app/shared/image/image.service';
import { FormControl, Validators,FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Checkpoint } from '../../tour-authoring/model/checkpoint.model';
import { TourAuthoringService } from '../../tour-authoring/tour-authoring.service';
import { Encounter } from '../model/encounter.model';
import { __values } from 'tslib';

@Component({
  selector: 'xp-encounter-form',
  templateUrl: './encounter-form.component.html',
  styleUrls: ['./encounter-form.component.css']
})
export class EncounterFormComponent implements OnInit{

  constructor(private service: EncounterService, authService: AuthService, private imageService: ImageService,private activatedRoute:ActivatedRoute,
    private tourAuthoringService: TourAuthoringService,private router:Router) {
    this.authorId = authService.user$.value.id;
  }

  authorId:number;
  id:number;
  checkpoint:Checkpoint;
  imagePreview: string[] = [];
  encounter:Encounter;


  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params=>{
      this.id=params['id'];
      if(this.id>0)
      {
        this.getCheckpoint(this.id);
      }
    })

  }

  getCheckpoint(id: number): void {
    this.tourAuthoringService.getCheckpoint(id).subscribe((result: Checkpoint) => {
      this.checkpoint = result;
    });
  }

  encounterForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    xp:new FormControl(0,[Validators.required]),
    type:new FormControl('Misc',[Validators.required]), 
    isPrerequisite:new FormControl(false,[Validators.required]),
    longitude:new FormControl(0,[Validators.required]),
    latitude:new FormControl(0,[Validators.required]),
    range:new FormControl(0),
    requiredPeople:new FormControl(0),
    locationLongitude:new FormControl(0),
    locationLatitude:new FormControl(0),
    images:new FormControl('')
  });
  type:string=this.encounterForm.value.type||"";

  onNext():void{

    let formData=new FormData;

    formData.append('name', this.encounterForm.value.name||"");
    formData.append('description', this.encounterForm.value.description||"");
    formData.append('authorId', this.authorId.toString());
    formData.append('xp', this.encounterForm.value.xp?.toString()||"");
    formData.append('status', "Published");
    formData.append('longitude',this.encounterForm.value.longitude?.toString()||"");
    formData.append('latitude',this.encounterForm.value.latitude?.toString()||"" );
    formData.append('type',this.encounterForm.value.type||"" );

    if(this.encounterForm.value.type==="Social")
    {
      formData.append('range', this.encounterForm.value.range?.toString()||"");
      formData.append('requiredPeople', this.encounterForm.value.requiredPeople?.toString()||"");
    }

    

    this.service.addEncounter(formData,this.id,this.encounterForm.value.isPrerequisite|| false).subscribe({
      next: () => {
        this.encounterForm.reset();
        this.imagePreview = [];
      },
      error: (err) => {
        console.error('Update failed:', err);
      },
    });

    this.router.navigate([`checkpoint-secret/${this.id}`]);
  }



  onChange(){
    this.type=this.encounterForm.value.type||"";

  }

  onImageSelected(event: any): void {
    const selectedFiles = event?.target?.files;

    if (selectedFiles && selectedFiles.length > 0) {
      this.imagePreview = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const reader = new FileReader();

        reader.onload = (e) => {
          this.imagePreview.push(e.target?.result as string);
        };

        reader.readAsDataURL(selectedFiles[i]);
      }
    }
    this.encounterForm.get('images')?.setValue(selectedFiles);
  }
  
  getImageUrl(imageName: string): string {
    return this.imageService.getImageUrl(imageName);
  }

  ngOnChanges(): void {
      this.imagePreview = this.encounter.image?.map(image => this.getImageUrl(image)) || [];
  }
}
