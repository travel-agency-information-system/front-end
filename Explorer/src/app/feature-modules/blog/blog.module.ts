import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { BlogPostComponent } from './blog-post/blog-post.component';
import { BlogPostFormComponent } from './blog-post-form/blog-post-form.component';
import { BlogCommentComponent } from './blog-comment/blog-comment.component';
import { BlogCommentFormComponent } from './blog-comment-form/blog-comment-form.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    BlogPostComponent,
    BlogPostFormComponent,
    BlogCommentComponent,
    BlogCommentFormComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSelectModule
  ],
  exports: [
    BlogPostComponent,
    BlogPostFormComponent,
    BlogCommentComponent,
    BlogCommentFormComponent
  ]
})

export class BlogModule { }