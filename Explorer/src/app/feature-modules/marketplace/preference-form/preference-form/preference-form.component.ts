import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TourPreference } from '../../model/preference.model';
import { MarketplaceService } from '../../marketplace.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'xp-preference-form',
  templateUrl: './preference-form.component.html',
  styleUrls: ['./preference-form.component.css']
})
export class PreferenceFormComponent {

  @Output() preferenceUpdated = new EventEmitter<null>();
  @Input() preference: TourPreference;
  @Input() shouldEdit: boolean = false;

  user: User;
  tags:string[]=[];


  constructor(private service: MarketplaceService,private authService: AuthService){
  }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;

    });



  }

  preferenceForm = new FormGroup({
    difficulty: new FormControl('Easy'),
    walk: new FormControl(0),
    bike: new FormControl(0),
    car: new FormControl(0),
    boat: new FormControl(0),
  });

  ngOnChanges(): void {
    this.preferenceForm.reset();
    if(this.shouldEdit) {
      this.preferenceForm.patchValue(this.preference);
      this.tags=this.preference.tags;
    }
    else{
      this.tags=[];
    }
  }

  tagForm = new FormGroup({
    tag:new FormControl<string>("",{ nonNullable: true})
  });


  addPreference(): void {
    const preference: TourPreference = {
      difficulty: this.preferenceForm.value.difficulty || "",
      walk: Number(this.preferenceForm.value.walk) || 1,
      bike: Number(this.preferenceForm.value.bike) || 1,
      car: Number(this.preferenceForm.value.car) || 1,
      boat: Number(this.preferenceForm.value.boat) || 1,
      creatorId : this.user.id,
      tags : this.tags,
    };
    this.service.addTourPreference(preference).subscribe({
      next: () => { this.preferenceUpdated.emit() }
    });
    this.tags=[];
    this.preferenceForm.reset();  
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

  updatePreference(): void {
    const preference: TourPreference = {
      difficulty: this.preferenceForm.value.difficulty || "",
      walk: Number(this.preferenceForm.value.walk) || 0,
      bike: Number(this.preferenceForm.value.bike) || 0,
      car: Number(this.preferenceForm.value.car) || 0,
      boat: Number(this.preferenceForm.value.boat) || 0,
      tags : this.preference.tags,
      creatorId : this.user.id,
    };
    preference.id = this.preference.id;
    this.service.updateTourPreference(preference).subscribe({
      next: () => { this.preferenceUpdated.emit();}
    });
  }

  removeTag(tag:string):void{
    this.tags.splice(this.tags.indexOf(tag),1);
  }
}
