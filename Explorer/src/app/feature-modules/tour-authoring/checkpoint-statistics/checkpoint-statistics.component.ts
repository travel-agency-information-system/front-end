import { ChangeDetectorRef, Component, OnInit, } from '@angular/core';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { TourAuthoringService } from '../tour-authoring.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { CheckpointStatistics } from '../model/checkpoint-statistics.model';
import { Tour } from '../model/tour.model';
import { tick } from '@angular/core/testing';

@Component({
  selector: 'xp-checkpoint-statistics',
  templateUrl: './checkpoint-statistics.component.html',
  styleUrls: ['./checkpoint-statistics.component.css'], 
})
export class CheckpointStatisticsComponent implements OnInit {

  user: User;
  tourId: number;
  tour: Tour;
  checkpointStatistics: CheckpointStatistics[] = [];

  chartOptionsCheckpoints: any = {};
  chartOptionsCheckpoints2: any = {};
  constructor(private service: TourAuthoringService, private authService: AuthService, private cdr: ChangeDetectorRef, private activatedRoute: ActivatedRoute,private tourService: TourAuthoringService) {
  
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.tourId = params['id'];
      this.authService.user$.subscribe(user => {
        this.user = user;
        this.getTour(this.tourId);
        this.getNumberOfTourSales();
        this.getNumberOfTourStartings();
        this.getNumberOfTourFinishings();
        this.getCheckpointStatistics();
      });
    });
  }

  getTour(tourId: number){
    this.service.get(tourId).subscribe((result: Tour) => {
      this.tour = result;
      console.log(this.tour);
    });
  }

  getNumberOfTourSales() {
    this.service.getTourSalesCount(this.user.id, this.tourId).subscribe({
      next: (result: number) => {
        console.log('Broj prodaja ture: ', result);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  getNumberOfTourStartings() {
    this.service.getTourStartingsCount(this.user.id, this.tourId).subscribe({
      next: (result: number) => {
        console.log('Broj zapocinjanja ture: ', result);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  getNumberOfTourFinishings() {
    this.service.getTourStartingsCount(this.user.id, this.tourId).subscribe({
      next: (result: number) => {
        console.log('Broj zavrsavanja ture: ', result);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  getCheckpointStatistics() {
    this.service.getCheckpointStatistics(this.tourId).subscribe({
      next: (result: CheckpointStatistics[]) => {
        console.log('Statistika checkpoints: ', result);
        this.checkpointStatistics = result;
        this.drawChart(); 
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  drawChart(): void {
    this.chartOptionsCheckpoints = {
      title: {
        text: "Chekpoints statistics"  
      },
      animationEnabled: true,
      backgroundColor: "#B6D4AF",
      theme:"dark2",
      axisY: {
        title: "Percentage of tourists who reached the checkpoint", 
        titleFontSize: 16,     
        labelFontSize: 14  ,
        titleFontColor: "#184233"
            
      },
      data: [{        
        type: "column",
        dataPoints: this.checkpointStatistics.map(stat => ({
          label: stat.checkpointName,
          y: stat.arrivalPercentage,
          color:"#3B846B"
        }))
      }]
    };

    this.chartOptionsCheckpoints2 = {
      title: {
        text: "Chekpoints encounters statistics"  
      },
      animationEnabled: true,
      colorSet: "customColorSet",
      backgroundColor: "#B6D4AF",
      theme:"dark2",    
      axisY: {
        title: "Percentage of tourists who completed the encounter", 
        titleFontSize: 16,     
        labelFontSize: 14  ,
        titleFontColor: "#184233"

            
      },
      data: [{        
        type: "column",
        dataPoints: this.checkpointStatistics.map(stat => ({
          label: stat.checkpointName,
          y: stat.finishEcnounterPercentage,
           color: "#E67840" ,
           indexLabelFontSize: 18,

        }))
      }]
    };	
    // Manually trigger change detection
    this.cdr.detectChanges();
  }
}
