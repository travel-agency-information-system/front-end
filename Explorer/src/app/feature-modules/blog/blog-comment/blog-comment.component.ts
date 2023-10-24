import { Component, OnInit } from '@angular/core';
import { BlogComment } from '../model/blogComment.model';
import { BlogService } from '../blog.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';

@Component({
  selector: 'xp-blog-comment',
  templateUrl: './blog-comment.component.html',
  styleUrls: ['./blog-comment.component.css']
})

export class BlogCommentComponent implements OnInit {

  blogComments: BlogComment[] = [];
  selectedBlogComment: BlogComment;
  shouldRenderBlogCommentForm: boolean = false;
  shouldEdit: boolean = false;
  showOptions: number | null = null;

  constructor(private service: BlogService) { }

  ngOnInit(): void {
    this.getBlogComments();
  }

  getBlogComments(): void {
    this.service.getBlogComments().subscribe({
      next: (result: PagedResults<BlogComment>) => {
        this.blogComments = result.results;
      },
      error: () => {
        // handle error
      }
    });
  }

  toggleOptions(index: number) {
    if (this.showOptions === index) {
      this.showOptions = null;
    } else {
      this.showOptions = index;
    }
  }

  isOptionsVisible(index: number): boolean {
    return this.showOptions === index;
  }

  editComment(blogComment: BlogComment): void {
    this.selectedBlogComment = blogComment;
    this.shouldRenderBlogCommentForm = true;
    this.shouldEdit = true;
  }

  deleteComment(id: number): void {
    this.service.deleteBlogComment(id).subscribe({
      next: () => {
        this.getBlogComments();
      },
    })
  }
}
