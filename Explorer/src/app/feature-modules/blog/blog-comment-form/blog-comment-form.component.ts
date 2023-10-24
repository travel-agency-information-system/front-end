import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BlogService } from '../blog.service';
import { BlogComment } from '../model/blogComment.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';

@Component({
  selector: 'xp-blog-comment-form',
  templateUrl: './blog-comment-form.component.html',
  styleUrls: ['./blog-comment-form.component.css']
})
export class BlogCommentFormComponent implements OnChanges{
  
  @Output() blogCommentsUpdated = new EventEmitter<null>();
  @Input() blogComment: BlogComment;
  @Input() shouldEdit: boolean = false;
  user: User;

  constructor(private service: BlogService, private authService: AuthService) {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
   }

  ngOnChanges(): void {
    if(this.shouldEdit) {
      this.blogCommentForm.patchValue(this.blogComment);
    }
  }

  blogCommentForm = new FormGroup({
    text: new FormControl('', [Validators.required])
  });

  addComment(): void {
    const currentDateTime = new Date();

    console.log(currentDateTime);
    const blogComment: BlogComment =  {
      blogPostId: 1, 
      userId: this.user.id,
      creationTime: new Date(),
      text: this.blogCommentForm.value.text || ""
    }
    console.log(blogComment);
    this.service.addBlogComment(blogComment).subscribe({
      next: (_) => {
        this.blogCommentsUpdated.emit()
      }
    })
  }

  updateBlogComment(): void {
    const blogComment: BlogComment =  {
      blogPostId: this.blogComment.blogPostId, 
      userId: this.blogComment.userId,
      creationTime: this.blogComment.creationTime,
      modificationTime: new Date(),
      text: this.blogCommentForm.value.text || ""
    }
    blogComment.id = this.blogComment.id;

    this.service.updateBlogComment(blogComment).subscribe({
      next: (_) => {
        this.blogCommentsUpdated.emit()
      }
    })
  }
  
}
