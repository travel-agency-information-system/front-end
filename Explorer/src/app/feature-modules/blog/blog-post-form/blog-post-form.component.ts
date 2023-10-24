import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BlogPost, BlogPostStatus } from '../model/blog-post.model';
import { BlogService } from '../blog.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'xp-blog-post-form',
  templateUrl: './blog-post-form.component.html',
  styleUrls: ['./blog-post-form.component.css']
})
export class BlogPostFormComponent implements OnChanges {

  @Output() blogPostUpdated = new EventEmitter<null>();
  @Input() blogPost: BlogPost;
  @Input() shouldEdit: boolean = false;

  public BlogPostStatus = BlogPostStatus;
  userId: number;

  constructor(private service: BlogService, private authService: AuthService) {
    this.userId = authService.user$.value.id;
  }

  ngOnChanges(): void {
    this.blogPostForm.reset();
    if (this.shouldEdit) {
      this.blogPostForm.patchValue({
        title: this.blogPost.title,
        description: this.blogPost.description,
        imageUrls: this.blogPost.imageUrls ? this.blogPost.imageUrls.join(', ') : ''
      })
    }
  }

  blogPostForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    imageUrls: new FormControl(''),
  });


  addBlogPost(blogPostStatus: BlogPostStatus): void {
    const blogPost: BlogPost = this.fillForm(blogPostStatus);
    this.service.addBlogPost(blogPost).subscribe({
      next: () => {
        this.blogPostUpdated.emit()
        this.blogPostForm.reset();
      }
    });
  }

  updateBlogPost(blogPostStatus: BlogPostStatus): void {
    const blogPost: BlogPost = this.fillForm(blogPostStatus);
    blogPost.id = this.blogPost.id;
    this.service.updateBlogPost(blogPost).subscribe({
      next: () => {
        this.blogPostUpdated.emit()
        this.blogPostForm.reset();
      }
    });
  }

  private fillForm(blogPostStatus: BlogPostStatus) {
    const imageUrlsInput = this.blogPostForm.value.imageUrls || '';
    const imageUrls: string[] = (imageUrlsInput ? imageUrlsInput.split(',').map(url => url.trim()) : []);
    const currentDateTime = new Date();
    const blogPost: BlogPost = {
      userId: this.userId,
      title: this.blogPostForm.value.title as string || '',
      description: this.blogPostForm.value.description as string || '',
      creationDate: currentDateTime,
      imageUrls: imageUrls,
      status: blogPostStatus
    };
    return blogPost;
  }
}
