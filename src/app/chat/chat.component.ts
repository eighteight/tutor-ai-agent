import { Component, OnInit } from '@angular/core';
import { N8nService } from '../n8n.service';

interface Message {
  sender: 'user' | 'tutor';
  text: string;
  type?: 'text' | 'lesson' | 'question' | 'loading';
}

interface LessonContent {
  title: string;
  content: string;
}

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
}

interface TutorResponse {
  lesson_content: LessonContent[];
  questions: Question[];
  retention?: number;
  feedback?: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  message: string = 'Paris';
  messages: Message[] = [];
  topic: string = 'French History'; // Example topic
  currentQuestion: string = 'What is the capital of France?';
  isLoading: boolean = false;

  constructor(private n8nService: N8nService) { }

  ngOnInit(): void {
    this.messages.push({ sender: 'tutor', text: `Let's start with the topic: ${this.topic}` });
    this.messages.push({ sender: 'tutor', text: this.currentQuestion });
  }

  formatMessage(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  sendChatMessage(): void {
    if (this.message.trim() && !this.isLoading) {
      this.messages.push({ sender: 'user', text: this.message });
      this.isLoading = true;
      this.messages.push({ sender: 'tutor', text: 'Evaluating your answer', type: 'loading' });

      this.n8nService.sendMessage(this.topic, this.currentQuestion, this.message).subscribe({
        next: (response) => {
          this.messages.splice(-1, 1); // Remove loading message first
          console.log('n8n response:', response);
          try {
            // Try to parse direct JSON response first
            let tutorData;
            if (typeof response === 'object' && response.retention !== undefined) {
              tutorData = response;
            } else {
              // Fallback to parsing from response field
              const ollamaResponse = response.response || response;
              const jsonMatch = ollamaResponse.match(/```json\s*([\s\S]*?)\s*```/);
              tutorData = jsonMatch ? JSON.parse(jsonMatch[1]) : {};
            }
            console.log('Parsed tutor data:', tutorData);
              
              // Display retention score and feedback
              if (tutorData.retention !== undefined) {
                const retentionPercent = Math.round(tutorData.retention * 100);
                this.messages.push({
                  sender: 'tutor',
                  text: `**Retention Score: ${retentionPercent}%**`,
                  type: 'text'
                });
              }
              
              if (tutorData.feedback) {
                this.messages.push({
                  sender: 'tutor',
                  text: tutorData.feedback,
                  type: 'text'
                });
              }
              
              // Display lesson content
              if (tutorData.lesson_content && Array.isArray(tutorData.lesson_content)) {
                tutorData.lesson_content.forEach((lesson: any) => {
                  this.messages.push({ 
                    sender: 'tutor', 
                    text: `**${lesson.title}**\n\n${lesson.content}`,
                    type: 'lesson'
                  });
                });
              }
              
              // Display first question
              if (tutorData.questions && Array.isArray(tutorData.questions) && tutorData.questions.length > 0) {
                const firstQuestion = tutorData.questions[0];
                this.currentQuestion = firstQuestion.question;
                const options = firstQuestion.options && Array.isArray(firstQuestion.options) ? firstQuestion.options.join('\n') : '';
                const questionText = `${firstQuestion.question}\n\n${options}`;
                this.messages.push({ 
                  sender: 'tutor', 
                  text: questionText,
                  type: 'question'
                });
              }
            } else {
              this.messages.push({ sender: 'tutor', text: ollamaResponse });
            }
          } catch (error) {
            console.error('Error parsing response:', error, response);
            this.messages.push({ sender: 'tutor', text: 'I received a response but had trouble parsing it.' });
          }
          
          this.isLoading = false;
          this.message = ''; // Clear the input after sending
        },
        error: (error) => {
          console.error('Error sending message to n8n:', error);
          this.messages.splice(-1, 1); // Remove loading message
          this.messages.push({ sender: 'tutor', text: 'Sorry, I had trouble evaluating your answer.' });
          this.isLoading = false;
        }
      });
    }
  }
}
