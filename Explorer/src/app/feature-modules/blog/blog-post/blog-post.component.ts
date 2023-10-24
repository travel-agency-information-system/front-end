import { Component, OnInit } from '@angular/core';
import { BlogPost, BlogPostStatus } from '../model/blog-post.model';
import { BlogService } from '../blog.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';

@Component({
  selector: 'xp-blog-post',
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.css']
})

export class BlogPostComponent implements OnInit {

  public BlogPostStatus = BlogPostStatus;
  blogPosts: BlogPost[] = [];
  selectedBlogPost: BlogPost;
  shouldRenderBlogPostForm: boolean = false;
  shouldEdit: boolean = false;

  constructor(private service: BlogService) {
  }

  ngOnInit(): void {
    this.getBlogPosts();
  }

  getBlogPosts(): void {
    this.service.getBlogPosts().subscribe({
      next: (result: PagedResults<BlogPost>) => {
        this.blogPosts = result.results
      },
      error: () => {
      }
    })
  }

  deleteBlogPost(id: number): void {
    const result = window.confirm('Are you sure you want to delete this blog post?');
    if (result) {
      this.service.deleteBlogPost(id).subscribe({
        next: () => {
          this.getBlogPosts();
        },
      })
    }
  }

  onEditClicked(blogPost: BlogPost): void {
    this.selectedBlogPost = blogPost;
    this.shouldRenderBlogPostForm = true;
    this.shouldEdit = true;
  }

  onAddClicked(): void {
    this.shouldEdit = false;
    this.shouldRenderBlogPostForm = true;
  }

  onCloseClicked(blogPost: BlogPost): void {
    if (blogPost.id) {
      this.service.closeBlog(blogPost.id).subscribe({
        next: () => {
          this.getBlogPosts();
        },
      })
    }
  }
}
