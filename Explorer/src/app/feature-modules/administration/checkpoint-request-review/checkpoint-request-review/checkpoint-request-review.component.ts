import { Component, OnInit } from '@angular/core';
import { AdministrationService } from '../../administration.service';
import { CheckpointRequest } from '../../model/checkpoint-request.model'
import { Status } from '../../model/checkpoint-request.model';
import { Checkpoint } from 'src/app/feature-modules/tour-authoring/model/checkpoint.model';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { TourAuthoringService } from 'src/app/feature-modules/tour-authoring/tour-authoring.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { ObjectRequest } from '../../model/object-request.model';
import { MapObject } from 'src/app/feature-modules/tour-authoring/model/map-object.model';
import { Encounter } from 'src/app/feature-modules/encounters/model/encounter.model';
import { EncounterRequest } from 'src/app/feature-modules/encounters/model/encounterRequest.model';
import { forkJoin } from 'rxjs';
import { EncounterService } from 'src/app/feature-modules/encounters/encounter.service';

@Component({
  selector: 'xp-checkpoint-request-review',
  templateUrl: './checkpoint-request-review.component.html',
  styleUrls: ['./checkpoint-request-review.component.css']
})
export class CheckpointRequestReviewComponent implements OnInit{
  
  requestDetails: { id: number, checkpointName: string, checkpointDescription: string, authorName: string, status: Status, onHold:boolean, comment: string }[] = [];
  allCheckpoints: PagedResults<Checkpoint>;
  allUsers: PagedResults<User>;
  allCheckpointRequests: CheckpointRequest[] = [];

  objectRequestDetails: { id: number, objectName: string, objectDescription: string, authorName: string, status: Status, onHold:boolean, comment: string }[] = [];
  allObjects: MapObject[];
  allObjectRequests: ObjectRequest[] = [];

  encounterRequestDetails: { id: number, encounterName: string, encounterXp: number,encounterLongitude: number,encounterLatitude: number, touristName: string, status: Status, onHold:boolean}[] = [];
  allEncounters: PagedResults<Encounter>;
  allEncounterRequests: PagedResults<EncounterRequest>;

  constructor(private adminService: AdministrationService, private tourAuthService: TourAuthoringService, private encounterService: EncounterService) { }


  ngOnInit(): void {
    this.getAllCheckpointsRequests();
  }

  getAllCheckpointsRequests(): void {
    this.adminService.getAllCheckpointRequests().subscribe({
      next: (requests: CheckpointRequest[]) => {
          this.allCheckpointRequests = requests;
          this.getAllObjectRequests();
      },
      error: () => {
          // Handle errors
      }
  });
  }

  getAllObjectRequests(): void {
    this.adminService.getAllObjectRequests().subscribe({
      next: (requests: ObjectRequest[]) => {
          this.allObjectRequests = requests;
          this.getAllEncounterRequests();
      },
      error: () => {
          // Handle errors
      }
  });
  }

  getAllEncounterRequests(): void {
    this.encounterService.getAllRequests().subscribe({
      next: (requests: PagedResults<EncounterRequest>) => {
          this.allEncounterRequests = requests;
          this.getAllEncounters();
      },
      error: () => {
          // Handle errors
      }
  });
  }

  /*
  getAllRequests(): void {
    const checkpointRequests$ = this.adminService.getAllCheckpointRequests();
    const objectRequests$ = this.adminService.getAllObjectRequests();
    const encounterRequests$ = this.encounterService.getAllRequests();
  
    forkJoin([checkpointRequests$, objectRequests$, encounterRequests$]).subscribe({
      next: ([checkpointRequests, objectRequests, encounterRequest]) => {
        this.allCheckpointRequests = checkpointRequests;
        this.allObjectRequests = objectRequests;
        this.allEncounterRequests = encounterRequest;
        this.getAllCheckpoints();
        this.getAllObjects();
        this.getAllEncounters();
      },
      error: () => {
        // Handle errors
      }
    });
  }
  */
  getAllEncounters(): void {
    this.encounterService.getEncounters().subscribe({
        next: (objects: PagedResults<Encounter>) => {
            this.allEncounters = objects;
            this.getAllObjects();
        },
        error: () => {
            // Handle errors
        }
    });
  }

  getAllObjects(): void {
    this.tourAuthService.getMapObjects().subscribe({
        next: (objects: MapObject[]) => {
            this.allObjects = objects;
            this.getAllCheckpoints()
        },
        error: () => {
            // Handle errors
        }
    });
  }

  getAllCheckpoints(): void {
    this.tourAuthService.getCheckpoints().subscribe({
        next: (checkpoints: PagedResults<Checkpoint>) => {
            this.allCheckpoints = checkpoints;
            this.getAllUsers()
        },
        error: () => {
            // Handle errors
        }
    });
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
  }

  fillRequestDetails(): void {
    this.allCheckpointRequests.forEach(request => {
      this.allCheckpoints.results.forEach(checkPoint => {
        this.allUsers.results.forEach(user => {
          if(request.authorId === user.id && request.checkpointId === checkPoint.id) {
            let req: { id: number, checkpointName: string, checkpointDescription: string, authorName: string, status: Status, onHold:boolean, comment: string } = {
              id: request.id,
              checkpointName: checkPoint.name,
              checkpointDescription: checkPoint.description,
              authorName: user.username,
              status: request.status,
              onHold: this.investigateStatus(request.status),
              comment: ""
            };

            if(req.status.toString() === 'OnHold') {
              this.requestDetails.unshift(req);
            }
            else {
              this.requestDetails.push(req);
            }
          }
        });
      });
    });

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

            if(req.status.toString() === 'OnHold') {
              this.objectRequestDetails.unshift(req);
            }
            else {
              this.objectRequestDetails.push(req);
            }
          }
        });
      });
    });

    this.allEncounterRequests.results.forEach(request => {
      this.allEncounters.results.forEach(encounter => {
        this.allUsers.results.forEach(user => {
          if(request.touristId === user.id && request.encounterId === encounter.id) {
            let req: { id: number, encounterName: string, encounterXp: number,encounterLongitude: number,encounterLatitude: number, touristName: string, status: Status, onHold:boolean} = {
              id: request.id,
              encounterName: encounter.name,
              encounterXp: encounter.xp,
              encounterLatitude: encounter.latitude,
              encounterLongitude: encounter.longitude,
              touristName: user.username,
              status: request.status,
              onHold: this.investigateStatus(request.status),
            };

            if(req.status.toString() === 'OnHold') {
              this.encounterRequestDetails.unshift(req);
            }
            else {
              this.encounterRequestDetails.push(req);
            }
          }
        });
      });
    });

  }

  investigateStatus(s: Status): boolean {
    return s.toString() === 'OnHold';
  }

  acceptRequest(req: { id: number, checkpointName: string, checkpointDescription: string, authorName: string, status: Status, onHold:boolean, comment: string }): void {
    if(req.comment === "") {
      req.comment = "Your request for checkpoint " + req.checkpointName + " with description: " + req.checkpointDescription + ", is accepted.";
    } else {
      let enteredComment: string = req.comment;
      req.comment = "Administrator's comment: " + enteredComment + "\n\n Conclusion: Your request for checkpoint " + req.checkpointName + " with description: " + req.checkpointDescription + ", is accepted.";
    }

    this.adminService.acceptCheckpointRequest(req.id, req.comment).subscribe({
      next: () => {
        this.requestDetails.length = 0;
        this.objectRequestDetails.length = 0;
        this.encounterRequestDetails.length = 0;
        this.getAllCheckpointsRequests();
    },
      error: () => {
        // Handle errors
    }
    })
  }

  rejectRequest(req: { id: number, checkpointName: string, checkpointDescription: string, authorName: string, status: Status, onHold:boolean, comment: string }): void {
    if(req.comment === "") {
      req.comment = "Your request for checkpoint " + req.checkpointName + " with description: " + req.checkpointDescription + ", is rejected.";
    } else {
      let enteredComment: string = req.comment;
      req.comment = "Administrator's comment: " + enteredComment + "\n\n Conclusion: Your request for checkpoint " + req.checkpointName + " with description: " + req.checkpointDescription + ", is rejected.";
    }

    this.adminService.rejectCheckpointRequest(req.id, req.comment).subscribe({
      next: () => {
        this.requestDetails.length = 0;
        this.objectRequestDetails.length = 0;
        this.encounterRequestDetails.length = 0;
        this.getAllCheckpointsRequests();
    },
      error: () => {
        // Handle errors
    }
    })
  }

  acceptObjectRequest(req: { id: number, objectName: string, objectDescription: string, authorName: string, status: Status, onHold:boolean, comment: string }): void {
    if(req.comment === "") {
      req.comment = "Your request for object " + req.objectName + " with description: " + req.objectDescription + ", is accepted.";
    } else {
      let enteredComment: string = req.comment;
      req.comment = "Administrator's comment: " + enteredComment + "\n\n Conclusion: Your request for object " + req.objectName + " with description: " + req.objectDescription + ", is accepted.";
    }

    this.adminService.acceptObjectRequest(req.id, req.comment).subscribe({
      next: () => {
        this.requestDetails.length = 0;
        this.objectRequestDetails.length = 0;
        this.encounterRequestDetails.length = 0;
        this.getAllCheckpointsRequests();
    },
      error: () => {
        // Handle errors
    }
    })
  }

  rejectObjectRequest(req: { id: number, objectName: string, objectDescription: string, authorName: string, status: Status, onHold:boolean, comment: string }): void {
    if(req.comment === "") {
      req.comment = "Your request for object " + req.objectName + " with description: " + req.objectDescription + ", is rejected.";
    } else {
      let enteredComment: string = req.comment;
      req.comment = "Administrator's comment: " + enteredComment + "\n\n Conclusion: Your request for object " + req.objectName + " with description: " + req.objectDescription + ", is rejected.";
    }

    this.adminService.rejectObjectRequest(req.id, req.comment).subscribe({
      next: () => {
        this.requestDetails.length = 0;
        this.objectRequestDetails.length = 0;
        this.encounterRequestDetails.length = 0;
        this.getAllCheckpointsRequests();
    },
      error: () => {
        // Handle errors
    }
    })
  }

  acceptEncounterRequest(req: { id: number, encounterName: string, encounterXp: number,encounterLongitude: number,encounterLatitude: number, touristName: string, status: Status, onHold:boolean }): void {
    this.encounterService.acceptRequest(req.id).subscribe({
      next: () => {
        this.requestDetails.length = 0;
        this.objectRequestDetails.length = 0;
        this.encounterRequestDetails.length = 0;
        this.getAllCheckpointsRequests();
    },
      error: () => {
        // Handle errors
    }
    })
  }

  rejectEncounterRequest(req: { id: number, encounterName: string, encounterXp: number,encounterLongitude: number,encounterLatitude: number, touristName: string, status: Status, onHold:boolean }): void {
    this.encounterService.rejecttRequest(req.id).subscribe({
      next: () => {
        this.requestDetails.length = 0;
        this.objectRequestDetails.length = 0;
        this.encounterRequestDetails.length = 0;
        this.getAllCheckpointsRequests();
    },
      error: () => {
        // Handle errors
    }
    })
  }
}
