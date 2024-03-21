import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MapObject } from '../model/map-object.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { NgModel, NgForm } from '@angular/forms';
import { TourAuthoringService } from '../tour-authoring.service';
import { ImageService } from 'src/app/shared/image/image.service';

@Component({
  selector: 'xp-map-object',
  templateUrl: './map-object.component.html',
  styleUrls: ['./map-object.component.css']
})
export class MapObjectComponent {
  mapObjects: MapObject[] = [];
  shouldRenderMapObjectForm: boolean = false;
  selectedMapObject: MapObject;
  shouldEdit: boolean = false;

  constructor(private service: TourAuthoringService, private imageService: ImageService) { }

  ngOnInit(): void {
    this.service.getMapObjects().subscribe({
      next: async (result: MapObject[]) => {
        console.log(result);
  
        const pictureUrlPromises = result.map(async (obj) => {
          return await this.imageService.getImageUrl(obj.pictureURL);
        });

        const pictureUrls = await Promise.all(pictureUrlPromises);
        
        this.mapObjects = result.map((obj, index) => {
          return { ...obj, pictureURL: pictureUrls[index] };
        });
      },
      error: (error) => {
        console.error('Error during ngOnInit:', error);
      }
    });
  }

  onAddClick(): void {
    
    this.shouldRenderMapObjectForm = true;
    this.shouldEdit = false;


  }

  onUpdate(): void {
    
    this.shouldRenderMapObjectForm = false;
    this.shouldEdit = false;
    this.ngOnInit();
    

  }

  onEdit(mapObject: MapObject): void {
    
    this.shouldEdit = true;
    this.selectedMapObject = mapObject;
    this.shouldRenderMapObjectForm = true;

  }

  onDelete(id: number): void {
    this.service.deleteMapObject(id).subscribe({
      next: () => {
        this.ngOnInit();
      },
    });
  }

  getImageUrl(imageName: string): string {
    return this.imageService.getImageUrl(imageName);
  }
}
