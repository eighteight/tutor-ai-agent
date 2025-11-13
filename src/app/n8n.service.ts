import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class N8nService {
  private n8nUrl = environment.n8nBackendUrl;

  constructor(private http: HttpClient) { }

    sendMessage(topic: string, question: string, answer: string, course?: string): Observable<any> {
      return this.http.post(`${this.n8nUrl}/webhook/lesson`, { topic, question, answer, course });
    }

    uploadContent(content: string): Observable<any> {
      return this.http.post('http://127.0.0.1:8000/insert', { content });
    }

    getCourses(): Observable<any> {
      return this.http.get('http://127.0.0.1:8000/courses');
    }}
