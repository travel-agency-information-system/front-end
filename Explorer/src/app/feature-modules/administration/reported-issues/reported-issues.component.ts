import { Component, OnInit } from '@angular/core';
import { AdministrationService } from '../administration.service';
import { ReportedIssue } from '../model/reported-issue.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { DatePipe } from '@angular/common';
import { TourIssueComment } from '../../tour-authoring/model/tour-issue-comment';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Tour } from '../../tour-authoring/model/tour.model';


@Component({
  selector: 'xp-reported-issues',
  templateUrl: './reported-issues.component.html',
  styleUrls: ['./reported-issues.component.css'],
  providers: [DatePipe]
})
export class ReportedIssuesComponent implements OnInit{

  reportedIssues: ReportedIssue[] = [];
  selectedReportedIssue: ReportedIssue;
  shouldRenderAllAgain: boolean = false;
  user:any;
  newCommentString: string='';
  newComment: TourIssueComment;
  addDeadlineClicked = false;
  selectedDateStr: string;
  lastLooked: number=0;

  constructor(private service: AdministrationService, private authservice: AuthService, private datePipe: DatePipe) {
    this.user = authservice.user$.value;
    this.newComment = {
      creationTime: new Date(),
      creatorId: 0, 
      text: ''
    };
  }

  isTourClosed(tour: Tour){
    return tour.closed;
  }

  addDeadline() {
    if (this.selectedReportedIssue && this.selectedReportedIssue.id && this.selectedDateStr) {
      const date = new Date(this.selectedDateStr);
      this.service.addDeadline(this.selectedReportedIssue.id, date).subscribe(
        (result: ReportedIssue) => {
          this.selectedDateStr = '';
          this.getReportedIssues();
          for(const issue of this.reportedIssues){
            if(result.id===issue.id)
              this.selectedReportedIssue = issue;
          }
        },
        (error) => {
          alert('Failed to add a deadline.');
        }
      );
    }
    else{
      alert("Choose deadline in calendar.");
      return;
    }
  }
  
  
  
  penalize(id: number) {
    const confirmBlock = window.confirm("Are you sure you want to penalize this tour?");
      if (confirmBlock) {
      this.service.penalize(id).subscribe(
        (result: ReportedIssue) => {
          console.log('Penalize success:', result);
          this.getReportedIssues();
        },
        (error) => {
          console.error('Failed to penalize:', error);
        }
      );
    }
  }

  closeReportedIssue(id: number) {
    const confirmBlock = window.confirm("Are you sure you want to close this issue?");
      if (confirmBlock) {
      this.service.closeReportedIssue(id).subscribe(
        (result: ReportedIssue) => {
          console.log('Closing issue success:', result);
          this.getReportedIssues();
        },
        (error) => {
          console.error('Failed to close the issue:', error);
        }
      );
    }
  }
  
  ngOnInit(): void{
    this.getReportedIssues();
  }
  selectReportedIssue(issue: any): void {
    let i = 0
    for(const iss of this.reportedIssues){
      if(issue.id===iss.id) this.lastLooked = i;
      i++;
    }
    this.selectedReportedIssue = issue;
  }
  
  getReportedIssues(): void{
    if(this.user.role==='administrator'){
      this.service.getReportedIssues().subscribe({
        next:(result:PagedResults<ReportedIssue>)=>{
          this.reportedIssues = result.results;
          this.reportedIssues.sort((a, b) => a.id - b.id);
          this.selectedReportedIssue = this.reportedIssues[this.lastLooked];
        },
        error: ()=>{
  
        }
      })
    }
    else if(this.user.role==='author'){
        this.service.getAuthorsReportedIssues(this.user.id).subscribe({
          next:(result:PagedResults<ReportedIssue>)=>{
            this.reportedIssues = result.results;
            this.selectedReportedIssue = this.reportedIssues[0];
          },
          error: ()=>{
    
          }
        })
    }
    else if(this.user.role==='tourist'){
        this.service.getTouristsReportedIssues(this.user.id).subscribe({
          next:(result:PagedResults<ReportedIssue>)=>{
            this.reportedIssues = result.results;
            this.selectedReportedIssue = this.reportedIssues[0];
          },
          error: ()=>{
    
          }
        })
    }
    
  }
  isUnresolvedAndOlderThan5Days(ri: ReportedIssue): boolean {
    if (ri.resolved) {
      return false; // Return false for resolved issues
    }
    const currentTime = new Date().getTime();
    const issueTime = new Date(ri.time).getTime();
    const fiveDaysInMillis = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds
    return currentTime - issueTime > fiveDaysInMillis;
  }
  resolve(){
    if(this.selectedReportedIssue && this.selectedReportedIssue.id)
    this.service.resolveReportedIssue(this.selectedReportedIssue?.id).subscribe(
      (result: ReportedIssue) => {
        this.selectedReportedIssue = result;
        this.newCommentString = '';
      },
      (error) => {
        alert("nista");
      }
    );
  }
  addComment() {
    if(this.selectedReportedIssue.closed){
      alert("This conversation is closed by administrators. You can't reply to it.");
      return;
    }
    if (this.selectedReportedIssue && this.selectedReportedIssue.id) {
      if (this.newCommentString.trim() !== '') {
        if(this.user.role==='administrator'){
          this.newComment.creationTime = new Date();
          this.newComment.creatorId = this.user.id;
          this.newComment.text = this.newCommentString;
          this.service.addAdministratorCommentOnReportedIssue(this.selectedReportedIssue?.id, this.newComment).subscribe(
            (result: ReportedIssue) => {
              this.selectedReportedIssue = result;
              this.newCommentString = '';
            },
            (error) => {
              alert("nista");
            }
          );
        }
        else if(this.user.role==='author'){
          this.newComment.creationTime = new Date();
          this.newComment.creatorId = this.user.id;
          this.newComment.text = this.newCommentString;
          this.service.addAuthorCommentOnReportedIssue(this.selectedReportedIssue?.id, this.newComment).subscribe(
            (result: ReportedIssue) => {
              this.selectedReportedIssue = result;
              this.newCommentString = '';
            },
            (error) => {
              alert("nista");
            }
          );
        }
        else if(this.user.role==='tourist'){
          this.newComment.creationTime = new Date();
          this.newComment.creatorId = this.user.id;
          this.newComment.text = this.newCommentString;
          this.service.addTouristCommentOnReportedIssue(this.selectedReportedIssue?.id, this.newComment).subscribe(
            (result: ReportedIssue) => {
              this.selectedReportedIssue = result;
              this.newCommentString = '';
            },
            (error) => {
              alert("nista");
            }
          );
        }
      } else {
        alert("You can't publish an empty comment.");
      }
    } else {
    }
  }
  
  
  
  
  
}
