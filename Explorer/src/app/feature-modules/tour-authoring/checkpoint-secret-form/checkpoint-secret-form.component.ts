import { Component,OnInit,OnChanges } from '@angular/core';
import { TourAuthoringService } from '../tour-authoring.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Checkpoint } from '../model/checkpoint.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CheckpointSecret } from '../model/checkpointSecret.model';
import { ImageService } from 'src/app/shared/image/image.service';


@Component({
  selector: 'xp-checkpoint-secret-form',
  templateUrl: './checkpoint-secret-form.component.html',
  styleUrls: ['./checkpoint-secret-form.component.css']
})
export class CheckpointSecretFormComponent implements OnInit{

  constructor(private service: TourAuthoringService, private imageService: ImageService, private router:Router,private activatedRoute:ActivatedRoute){
  }

  id:number;
  shouldEdit:Boolean=false;
  checkpoint:Checkpoint;
  picturePreview: string[] = [];

  secretForm = new FormGroup({
    description: new FormControl(''),
    pictures: new FormControl('')
  });

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params=>{
      this.id=params['id'];
      if(this.id != 0)
      {
        this.getCheckpoint(this.id);
      }
    })

  }

  ngOnChanges(): void {
    if(this.checkpoint.checkpointSecret!=null){
      this.picturePreview = this.checkpoint.checkpointSecret?.pictures?.map(imageName => this.getImageUrl(imageName)) || [];
    }
  }

  getCheckpoint(id: number): void {
    this.service.getCheckpoint(id).subscribe((result: Checkpoint) => {
      this.checkpoint = result;
      console.log(this.checkpoint);
      if (this.checkpoint.checkpointSecret != null) {   
        this.picturePreview = this.checkpoint.checkpointSecret?.pictures?.map(imageName => this.getImageUrl(imageName)) || [];
        this.secretForm.patchValue({
          description: this.checkpoint.checkpointSecret.description
        });
      }
    });
  }

  onFinish(): void{
    const formData = new FormData();

    const secret: CheckpointSecret = {
      description: this.secretForm.value.description||"",
    };

    formData.append('description', secret.description);
    this.fillImages(formData);

    if(secret.description!=="")
    {
      console.log(secret);
      this.service.addCheckpointSecret(formData,this.id).subscribe((result: Checkpoint) => {
        this.checkpoint = result;
        console.log(this.checkpoint);
      });
      this.router.navigate([`checkpoint/${this.checkpoint.tourId}`]);

    }
  }

  private fillImages(formData: FormData) {
    if (this.secretForm.value.pictures) {
      const selectedFiles = this.secretForm.value.pictures;
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('pictures', selectedFiles[i]);
        console.log(formData.get('pictures'))
      }
    }
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
    this.secretForm.get('pictures')?.setValue(selectedFiles);
  }

  getImageUrl(imageName: string): string {
    return this.imageService.getImageUrl(imageName);
  }
}
