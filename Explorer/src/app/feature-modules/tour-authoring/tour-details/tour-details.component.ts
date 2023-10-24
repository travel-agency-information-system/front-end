import { Component, OnInit , EventEmitter,Input} from '@angular/core';
import { Tour } from '../model/tour.model';
import { TourAuthoringService } from '../tour-authoring.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'xp-tour-details',
  templateUrl: './tour-details.component.html',
  styleUrls: ['./tour-details.component.css']
})
export class TourDetailsComponent implements OnInit{

  tour:Tour;
 

  constructor(private service: TourAuthoringService,private activatedRoute:ActivatedRoute) { }

  ngOnInit(): void {
   this.activatedRoute.params.subscribe(params=>{
    let id=params['id'];
    this.getTour(id);
   })
  }

  getTour(id:number): void {
    this.service.get(id).subscribe({
      next: (result: Tour) => {
        this.tour = result;
      },
      error: () => {
      }
    })
  }
}
