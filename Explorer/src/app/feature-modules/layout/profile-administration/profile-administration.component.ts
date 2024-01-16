import { Component, Input, OnInit  } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProfileInfo } from '../model/profileInfo.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Router } from '@angular/router';
import { LayoutService } from '../layout.service';
import { ImageService } from 'src/app/shared/image/image.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { Tourist } from '../model/tourist.model';

@Component({
  selector: 'xp-profile-administration',
  templateUrl: './profile-administration.component.html',
  styleUrls: ['./profile-administration.component.css']
})
export class ProfileAdministrationComponent implements OnInit{

  constructor(
    private authService: AuthService,
    private layoutService: LayoutService,
    private imageService: ImageService,
    private router: Router
  ) {}

  isEditing = true;
  isTourist = false;
  showForm = false;
  user: User; //logged
  currentUser: ProfileInfo; //profile;
  tourist: Tourist;

  startEditing() {
    this.isEditing = true; //izbaci
    this.showForm = true;
  }

  saveChanges() {
    /*if (this.profileInfoForm.valid) {
      this.isEditing = false; 
    }*/
    this.edit()
    this.showForm = false;
  }

  ngOnInit(): void {
    this.checkUserRole();
    this.layoutService.fetchCurrentUser().subscribe((user) => {
      this.profileInfoForm.patchValue({
        id: user.id,
        userId: user.userId,
        name: user.name,
        surname: user.surname,
        email: user.email,
        profilePictureUrl: this.imageService.getImageUrl(user.profilePictureUrl),
        biography: user.biography,
        motto: user.motto,
      });
      this.currentUser = user;
      //console.log(this.currentUser);
      this.selectedImage = this.imageService.getImageUrl(user.profilePictureUrl);
    });

    if(this.user?.role === 'administrator'){
      this.layoutService.fetchCurrentAdmin().subscribe((user) => {
        this.profileInfoForm.patchValue({
          id: user.id,
          userId: user.userId,
          name: user.name,
          surname: user.surname,
          email: user.email,
          profilePictureUrl: this.imageService.getImageUrl(user.profilePictureUrl),
          biography: user.biography,
          motto: user.motto,
        });
        
        this.selectedImage = this.imageService.getImageUrl(user.profilePictureUrl);
      });
    }
    else{
      this.layoutService.fetchCurrentUser().subscribe((user) => {
        this.profileInfoForm.patchValue({
          id: user.id,
          userId: user.userId,
          name: user.name,
          surname: user.surname,
          email: user.email,
          profilePictureUrl: this.imageService.getImageUrl(user.profilePictureUrl),
          biography: user.biography,
          motto: user.motto,
        });
        
        this.selectedImage = this.imageService.getImageUrl(user.profilePictureUrl);
      });
    }
  }

  checkUserRole(){
    this.authService.user$.subscribe(user => {
      this.user = user; 
      if(this.user.role === "tourist"){
        this.isTourist = true;
        this.findTourist(user.id)
      }
    });
  }

  findTourist(userId: number){
    this.layoutService.getTourist(userId).subscribe((result) => {
        this.tourist = result;
    });
  } 
  
  profileInfoForm = new FormGroup({
    id: new FormControl(-1, [Validators.required]),
    userId: new FormControl(-1, [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.pattern('^[A-Z][a-z]*$')]),
    surname: new FormControl('', [Validators.required, Validators.pattern('^[A-Z][a-z]*$')]),
    email: new FormControl('', [Validators.required, Validators.email]),
    profilePicture: new FormControl(null, [Validators.required, this.fileValidator]),
    profilePictureUrl: new FormControl('', [Validators.required]),
    biography: new FormControl('', [Validators.required]),
    motto: new FormControl('', [Validators.required])
  });

  private fileValidator(control: FormControl): { [key: string]: any } | null {
    const value: File | null = control.value;
  
    if (!value) {
      return { required: true, invalidFileType: false };
    }
  
    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedFileTypes.indexOf(value.type) === -1) {
      return { required: false, invalidFileType: true };
    }
  
    return null;
  }

  edit(): void {
    const profilePictureValue = this.profileInfoForm.value.profilePicture;
    if (this.isFile(profilePictureValue)) {
    const profileInfo: ProfileInfo = {
      id: this.profileInfoForm.value.id || -1,
      userId: this.profileInfoForm.value.userId || -1,
      name: this.profileInfoForm.value.name || "",
      surname: this.profileInfoForm.value.surname || "",
      email: this.profileInfoForm.value.email || "",
      profilePicture: profilePictureValue as File,
      profilePictureUrl: this.profileInfoForm.value.profilePictureUrl || "",
      biography: this.profileInfoForm.value.biography || "",
      motto: this.profileInfoForm.value.motto || "",
    };

    const formData = new FormData();
  
      Object.keys(profileInfo).forEach(key => {
        const value = profileInfo[key as keyof ProfileInfo];
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            formData.append(key, value, value.name);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

    
    if (this.profileInfoForm.valid) {
      this.currentUser = profileInfo;
      this.layoutService.saveNewInfo(profileInfo, formData).subscribe({
        next: () => {
          //this.router.navigate(['home']);
          window.location.reload(); //ucitaj ponovo stranicu refresh, izmeni
        },
      });
      if(this.user?.role === 'administrator'){
        this.layoutService.saveNewAdminInfo(profileInfo, formData).subscribe({
          next: () => {
            this.router.navigate(['home']);
          },
        });
      }
      else{
        this.layoutService.saveNewInfo(profileInfo, formData).subscribe({
          next: () => {
            this.router.navigate(['home']);
          },
        });
      }
    }
  }
  }

  private isFile(value: any): value is File {
    return value instanceof File;
  }

  selectedImage: string | null = null;

  onProfilePictureSelected(event: any) {
    const file = event?.target?.files[0];

    if (file) {
      this.profileInfoForm.patchValue({ profilePicture: file });

      const fileName = file.name;
      const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
      const extension = fileName.substring(fileName.lastIndexOf('.') + 1);
      const profilePictureUrl = `${baseName}_profile.${extension}`;
      this.profileInfoForm.patchValue({ profilePictureUrl });

      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedImage = null;
    }
  }

  createEncounter():void {
    this.router.navigate(['tourist-encounter-form']);
  }
}
