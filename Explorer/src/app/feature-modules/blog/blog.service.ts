import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BlogComment } from './model/blogComment.model';
import { BlogPost } from './model/blog-post.model';
import { environment } from 'src/env/environment';
import { Observable } from 'rxjs';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  userId: number;

  constructor(private http: HttpClient, private authService: AuthService) { 
    this.userId = authService.user$.value.id;
  }

  getBlogPosts(): Observable<PagedResults<BlogPost>> {
    return this.http.get<PagedResults<BlogPost>>(environment.apiHost + `blogging/blog-post/user/${this.userId}`)
  }

  addBlogPost(blogPost: BlogPost): Observable<BlogPost> {
    return this.http.post<BlogPost>(environment.apiHost + 'blogging/blog-post', blogPost);
  }

  deleteBlogPost(id: number): Observable<BlogPost> {
    return this.http.delete<BlogPost>(environment.apiHost + `blogging/blog-post/${id}`);
  }

  updateBlogPost(blogPost: BlogPost): Observable<BlogPost> {
    return this.http.put<BlogPost>(environment.apiHost + `blogging/blog-post/${blogPost.id}`, blogPost);
  }

  closeBlog(id: number): Observable<BlogPost> {
    return this.http.patch<BlogPost>(environment.apiHost + `blogging/blog-post/${id}/close`, null);
  }
  
    addBlogComment(blogComment: BlogComment): Observable<BlogComment> {
    return this.http.post<BlogComment>(environment.apiHost + 'blogging/blog-comment/', blogComment);
  }

  getBlogComments(): Observable<PagedResults<BlogComment>> {
    return this.http.get<PagedResults<BlogComment>>(environment.apiHost + 'blogging/blog-comment/')
  }

  deleteBlogComment(id: number): Observable<BlogComment> {
    return this.http.delete<BlogComment>(environment.apiHost + 'blogging/blog-comment/' + id);
  }

  updateBlogComment(blogComment: BlogComment): Observable<BlogComment> {
    return this.http.put<BlogComment>(environment.apiHost + 'blogging/blog-comment/' + blogComment.id, blogComment);
  }
}