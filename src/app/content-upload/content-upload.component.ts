import { Component } from '@angular/core';
import { N8nService } from '../n8n.service';

@Component({
  selector: 'app-content-upload',
  templateUrl: './content-upload.component.html',
  styleUrls: ['./content-upload.component.css']
})
export class ContentUploadComponent {
  course = '';
  topic = '';
  content = '';
  isCreating = false;
  message = '';
  selectedFile: File | null = null;

  constructor(private n8nService: N8nService) {}

  createCourse() {
    if (!this.course || !this.topic || !this.content) {
      this.message = 'Please fill all fields';
      return;
    }

    this.isCreating = true;
    const structuredContent = `Course: ${this.course}\nTopic: ${this.topic}\n\n${this.content}`;
    
    this.n8nService.uploadContent(structuredContent).subscribe({
      next: (response) => {
        this.message = 'Course created successfully!';
        this.resetForm();
        this.isCreating = false;
      },
      error: (error) => {
        this.message = 'Course creation failed. Please try again.';
        this.isCreating = false;
      }
    });
  }

  resetForm() {
    this.course = '';
    this.topic = '';
    this.content = '';
    this.selectedFile = null;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadPDF() {
    if (!this.selectedFile) {
      this.message = 'Please select a PDF file';
      return;
    }

    this.isCreating = true;
    this.n8nService.uploadPDF(this.selectedFile).subscribe({
      next: (response) => {
        this.message = `PDF uploaded successfully! Course: ${response.course}, Pages: ${response.pages}`;
        this.resetForm();
        this.isCreating = false;
      },
      error: (error) => {
        this.message = error.error?.error || 'PDF upload failed. Please try again.';
        this.isCreating = false;
      }
    });
  }
}