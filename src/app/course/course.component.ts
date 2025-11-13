import { Component, OnInit } from '@angular/core';
import { N8nService } from '../n8n.service';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit {
  courses: string[] = [];
  isLoading = true;

  constructor(private n8nService: N8nService) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses() {
    this.n8nService.getCourses().subscribe({
      next: (response) => {
        this.courses = response.courses || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoading = false;
      }
    });
  }
}
