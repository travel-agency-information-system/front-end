import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TourAuthoringService } from '../tour-authoring.service';
import { Tour } from '../model/tour.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';

@Component({
  selector: 'xp-tour-form',
  templateUrl: './tour-form.component.html',
  styleUrls: ['./tour-form.component.css']
})
export class TourFormComponent implements OnChanges,OnInit{

  @Output() tourUpdated = new EventEmitter<null>();
  @Input() tour: Tour;
  @Input() shouldEdit: boolean = false;

  user: User;
  tags:string[]=[];


  constructor(private service: TourAuthoringService,private authService: AuthService){
  }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      if(this.shouldEdit){
        this.tags=this.tour.tags;
      }
      else{
        this.tags=[];


      }
    });



  }
  ngOnChanges(): void {
    this.tourForm.reset();
    if(this.shouldEdit) {
      this.tourForm.patchValue(this.tour);
      this.tags=this.tour.tags;
    }
    else{
      this.tags=[];
    }
  }

  tagForm = new FormGroup({
    tag:new FormControl<string>("",{ nonNullable: true})
  });

  tourForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    demandignessLevel:new FormControl('Easy'),
    price: new FormControl(0) 
  });

  addTour(): void {
    const tour: Tour = {
      name: this.tourForm.value.name || "",
      description: this.tourForm.value.description || "",
      demandignessLevel: this.tourForm.value.demandignessLevel || "",
      price: Number(this.tourForm.value.price) || 0,
      authorId : this.user.id,
      tags : this.tags,
      status: "Draft"
    };
    this.service.addTour(tour).subscribe({
      next: () => { this.tourUpdated.emit() }
    });
    this.tags=[];
    this.tourForm.reset();
    this.tagForm.reset();

  }

  addTag():void{   
    if(this.tagForm.getRawValue().tag!=""){
      if(this.isExistingTag(this.tagForm.getRawValue().tag)===false){
      this.tags.push(this.tagForm.getRawValue().tag);
      this.tagForm.reset();
      }
    }
  }

  isExistingTag(tag:string):boolean{
    let isExistingTag=false;
    this.tags.forEach(element => {
      if(element.toLowerCase()==tag)
        isExistingTag=true;
    });
    return isExistingTag;
  }

  updateTour(): void {
    const tour: Tour = {
      name: this.tourForm.value.name || "",
      description: this.tourForm.value.description || "",
      demandignessLevel: this.tourForm.value.demandignessLevel || "",
      price: Number(this.tourForm.value.price) || 0,
      authorId : this.user.id,
      tags : this.tour.tags,
      status:"Draft"
    };
    tour.id = this.tour.id;
    this.service.updateTour(tour).subscribe({
      next: () => { this.tourUpdated.emit();}
    });
  }

  removeTag(tag:string):void{
    this.tags.splice(this.tags.indexOf(tag),1);
  }
}
