import { Component } from '@angular/core';
import { Status } from '../../model/checkpoint-request.model';
import { MapObject } from 'src/app/feature-modules/tour-authoring/model/map-object.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { ObjectRequest } from '../../model/object-request.model';
import { AdministrationService } from '../../administration.service';
import { TourAuthoringService } from 'src/app/feature-modules/tour-authoring/tour-authoring.service';

@Component({
  selector: 'xp-object-request-review',
  templateUrl: './object-request-review.component.html',
  styleUrls: ['./object-request-review.component.css']
})
export class ObjectRequestReviewComponent {

  requestDetails: { id: number, objectName: string, objectDescription: string, authorName: string, status: Status, onHold:boolean, comment: string }[] = [];
  allObjects: MapObject[];
  allUsers: PagedResults<User>;
  allObjectRequests: ObjectRequest[] = [];

  constructor(private adminService: AdministrationService, private tourAuthService: TourAuthoringService) { }


  ngOnInit(): void {
    this.getAllRequests();
  }

  getAllRequests(): void {
    this.adminService.getAllObjectRequests().subscribe({
        next: (requests: ObjectRequest[]) => {
            this.allObjectRequests = requests;
            this.getAllObjects();
        },
        error: () => {
            // Handle errors
        }
    });

    //this.getAllCheckpoints();
  }

  getAllObjects(): void {
    this.tourAuthService.getMapObjects().subscribe({
        next: (objects: MapObject[]) => {
            this.allObjects = objects;
            this.getAllUsers();
        },
        error: () => {
            // Handle errors
        }
    });

    //this.getAllUsers();
  }

  getAllUsers(): void {
    this.adminService.getAllUsers().subscribe({
        next: (users: PagedResults<User>) => {
            this.allUsers = users;
            this.fillRequestDetails();
        },
        error: () => {
            // Handle errors
        }
    });

    //this.fillRequestDetails();
  }

  fillRequestDetails(): void {
    this.allObjectRequests.forEach(request => {
      this.allObjects.forEach(object => {
        this.allUsers.results.forEach(user => {
          if(request.authorId === user.id && request.mapObjectId === object.id) {
            let req: { id: number, objectName: string, objectDescription: string, authorName: string, status: Status, onHold:boolean, comment: string } = {
              id: request.id,
              objectName: object.name,
              objectDescription: object.description,
              authorName: user.username,
              status: request.status,
              onHold: this.investigateStatus(request.status),
              comment: ""
            };

            this.requestDetails.push(req);
          }
        });
      });
    });
  }

  investigateStatus(s: Status): boolean {
    return s.toString() === 'OnHold';
  }

  acceptRequest(req: { id: number, objectName: string, objectDescription: string, authorName: string, status: Status, onHold:boolean, comment: string }): void {
    if(req.comment === "") {
      req.comment = "Your request for object " + req.objectName + " with description: " + req.objectDescription + ", is accepted.";
    } else {
      let enteredComment: string = req.comment;
      req.comment = "Administrator's comment: " + enteredComment + "\n\n Conclusion: Your request for object " + req.objectName + " with description: " + req.objectDescription + ", is accepted.";
    }

    this.adminService.acceptObjectRequest(req.id, req.comment).subscribe({
      next: () => {
        this.requestDetails.length = 0;
        this.getAllRequests();
    },
      error: () => {
        // Handle errors
    }
    })
  }

  rejectRequest(req: { id: number, objectName: string, objectDescription: string, authorName: string, status: Status, onHold:boolean, comment: string }): void {
    if(req.comment === "") {
      req.comment = "Your request for object " + req.objectName + " with description: " + req.objectDescription + ", is rejected.";
    } else {
      let enteredComment: string = req.comment;
      req.comment = "Administrator's comment: " + enteredComment + "\n\n Conclusion: Your request for object " + req.objectName + " with description: " + req.objectDescription + ", is rejected.";
    }

    this.adminService.rejectObjectRequest(req.id, req.comment).subscribe({
      next: () => {
        this.requestDetails.length = 0;
        this.getAllRequests();
    },
      error: () => {
        // Handle errors
    }
    })
  }
}
