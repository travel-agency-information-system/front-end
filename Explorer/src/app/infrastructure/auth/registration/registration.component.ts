import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Registration } from '../model/registration.model';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'xp-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  registrationForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.pattern('^[A-Z][a-z]*$')]),
    surname: new FormControl('', [Validators.required, Validators.pattern('^[A-Z][a-z]*$')]),
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    role: new FormControl('Author', [Validators.required]),
    profileImageBytes: new FormControl(new Uint8Array(), [Validators.required]),
    biography: new FormControl('', [Validators.required]),
    motto: new FormControl('', [Validators.required])
  });

  register(): void {
    const registration: Registration = {
      name: this.registrationForm.value.name || "",
      surname: this.registrationForm.value.surname || "",
      email: this.registrationForm.value.email || "",
      username: this.registrationForm.value.username || "",
      password: this.registrationForm.value.password || "",
      role: this.registrationForm.value.role || "Author",
      profileImageBytes: this.registrationForm.value.profileImageBytes || new Uint8Array(),
      biography: this.registrationForm.value.biography || "",
      motto: this.registrationForm.value.motto || ""
    };

    if (this.registrationForm.valid) {
      this.authService.register(registration).subscribe({
        next: () => {
          this.router.navigate(['home']);
        },
      });
    }
  }

  selectedImage: string | null = null;

  onProfilePictureSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageBytes = new Uint8Array(e.target!.result as ArrayBuffer); // Add ! here
        this.registrationForm.patchValue({ profileImageBytes: imageBytes });
      };
      reader.readAsArrayBuffer(file);
    }
  }
}
