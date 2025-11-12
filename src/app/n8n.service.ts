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

    sendMessage(topic: string, question: string, answer: string): Observable<any> {
      return this.http.post(`${this.n8nUrl}/webhook/lesson`, { topic, question, answer });
    }}
