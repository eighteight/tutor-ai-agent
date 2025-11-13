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
  isUploading = false;
  message = '';

  constructor(private n8nService: N8nService) {}

  uploadContent() {
    if (!this.course || !this.topic || !this.content) {
      this.message = 'Please fill all fields';
      return;
    }

    this.isUploading = true;
    const structuredContent = `Course: ${this.course}\nTopic: ${this.topic}\n\n${this.content}`;
    
    this.n8nService.uploadContent(structuredContent).subscribe({
      next: (response) => {
        this.message = 'Content uploaded successfully!';
        this.resetForm();
        this.isUploading = false;
      },
      error: (error) => {
        this.message = 'Upload failed. Please try again.';
        this.isUploading = false;
      }
    });
  }

  resetForm() {
    this.course = '';
    this.topic = '';
    this.content = '';
  }
}