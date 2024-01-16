import { Component, OnInit } from '@angular/core';
import { BlogService } from '../blog.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PrivateTourBlog } from '../model/private-tour-blog';
import { PrivateTour } from '../../tour-authoring/model/private-tour.model';

@Component({
  selector: 'xp-private-tour-blog',
  templateUrl: './private-tour-blog.component.html',
  styleUrls: ['./private-tour-blog.component.css']
})

export class PrivateTourBlogComponent implements OnInit{
  blog: PrivateTourBlog  = {title:'', description:'', equipment:'', privateTourId:0};
  tourId: number;
  tour: PrivateTour;
  title: string = '';
  description: string = '';
  equipment: string = '';

  constructor(private service: BlogService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params=>{
      this.tourId = params['id'];
      this.service.getPrivateTour(this.tourId).subscribe(result=>{
        if(result){
          this.tour = result;
        }
      })
    })
  }

  CreatePrivateTourBlog(tour: PrivateTour){
    this.blog.title = this.title;
    this.blog.description = this.description;
    this.blog.equipment = this.equipment;
    this.blog.privateTourId = this.tour.id;
    this.tour.blog = this.blog;

    this.service.createPrivateTourBlog(tour).subscribe(result=>{
      if(result){
        this.tour = result;
        console.log('Blog has been successfully added.');
        this.router.navigate(['/my-profile/private-tour-blogs']);
      }
      else{
        console.log('Error while creating blog on a private tour.');
      }
    });
  }
  
}
