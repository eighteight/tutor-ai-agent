import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  topic: string = 'General Programming';
  selectedCourse: string = '';
  currentQuestion: string = '';
  isLoading: boolean = false;
  availableQuestions: any[] = [];
  selectedQuestionIndex: number = 0;

  constructor(private n8nService: N8nService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedCourse = params['course'] || '';
      if (this.selectedCourse) {
        this.topic = this.selectedCourse;
        this.currentQuestion = this.getInitialQuestion(this.selectedCourse);
        this.messages = [];
        this.messages.push({ sender: 'tutor', text: `Let's start learning ${this.selectedCourse}!` });
        this.messages.push({ sender: 'tutor', text: this.currentQuestion });
      } else {
        this.currentQuestion = 'What would you like to learn about?';
        this.messages.push({ sender: 'tutor', text: `Let's start with the topic: ${this.topic}` });
        this.messages.push({ sender: 'tutor', text: this.currentQuestion });
      }
    });
  }

  getInitialQuestion(course: string): string {
    const questions: { [key: string]: string } = {
      'variables': 'What is the difference between let and const in JavaScript?',
      'functions': 'How do you define a function in JavaScript?',
      'arrays': 'How do you create an array and add elements to it?',
      'objects': 'What is the syntax for creating an object in JavaScript?',
      'python': 'How do you create a list in Python?',
      'loops': 'What is the difference between for and while loops?',
      'classes': 'How do you define a class in programming?',
      'async': 'What is asynchronous programming and why is it useful?'
    };
    return questions[course] || 'What would you like to learn about this topic?';
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

      const questionToSend = this.availableQuestions.length > 0 
        ? this.availableQuestions[this.selectedQuestionIndex].question 
        : this.currentQuestion;
      this.n8nService.sendMessage(this.topic, questionToSend, this.message, this.selectedCourse).subscribe({
        next: (response) => {
          this.messages.splice(-1, 1); // Remove loading message first

          try {
            console.log('Response type:', typeof response, 'Response:', response);

            console.log('n8n response:', response);
            // Handle different response types
            let tutorData;
            if (typeof response === 'object' && response.retention !== undefined) {
              // Direct JSON response with retention
              tutorData = response;
            } else if (typeof response === 'object' && response.message) {
              // n8n workflow started message - wait for actual response
              this.messages.push({ sender: 'tutor', text: 'Processing your answer...' });
              this.isLoading = false;
              this.message = '';
              return;
            } else {
              debugger;
              // Parse from response field
              const ollamaResponse = response.response.replace(/<think>.*?<\/think>/s, '').replaceAll('```', '').replace('json', '');
              tutorData = JSON.parse(ollamaResponse);
            }
            console.log('Parsed tutor data:', tutorData);

            // Display retention score and feedback
            if (tutorData.retention !== undefined) {
              console.log('Raw retention value:', tutorData.retention, 'Type:', typeof tutorData.retention);
              const retentionValue = parseFloat(tutorData.retention);
              if (!isNaN(retentionValue)) {
                let retentionPercent;
                if (retentionValue > 1) {
                  retentionPercent = Math.round(retentionValue);
                } else {
                  retentionPercent = Math.round(retentionValue * 100);
                }
                this.messages.push({
                  sender: 'tutor',
                  text: `**Retention Score: ${retentionPercent}%**`,
                  type: 'text'
                });
              }
            }

            if (tutorData.feedback) {
              this.messages.push({
                sender: 'tutor',
                text: tutorData.feedback,
                type: 'text'
              });
            }

            // Display lesson content
            if (tutorData.lesson_content) {
              if (Array.isArray(tutorData.lesson_content)) {
                tutorData.lesson_content.forEach((lesson: any) => {
                  this.messages.push({
                    sender: 'tutor',
                    text: `**${lesson.title}**\n\n${lesson.content}`,
                    type: 'lesson'
                  });
                });
              } else if (typeof tutorData.lesson_content === 'object') {
                const lesson = tutorData.lesson_content;
                if (lesson.title && Array.isArray(lesson.content)) {
                  this.messages.push({
                    sender: 'tutor',
                    text: `**${lesson.title}**`,
                    type: 'lesson'
                  });
                  lesson.content.forEach((item: any) => {
                    if (item.type === 'text' && item.content) {
                      this.messages.push({
                        sender: 'tutor',
                        text: item.content,
                        type: 'lesson'
                      });
                    } else if (item.title && item.description) {
                      this.messages.push({
                        sender: 'tutor',
                        text: `**${item.title}**\n${item.description}`,
                        type: 'lesson'
                      });
                    }
                  });
                } else if ((lesson.topic || lesson.advanced_topic) && Array.isArray(lesson.content)) {
                  const topicTitle = lesson.topic || lesson.advanced_topic;
                  this.messages.push({
                    sender: 'tutor',
                    text: `**${topicTitle}**`,
                    type: 'lesson'
                  });
                  lesson.content.forEach((item: any) => {
                    this.messages.push({
                      sender: 'tutor',
                      text: `**${item.title}**\n${item.description}`,
                      type: 'lesson'
                    });
                  });
                } else {
                  const title = lesson.title || 'Lesson';
                  if (typeof lesson.content === 'string') {
                    this.messages.push({
                      sender: 'tutor',
                      text: `**${title}**\n\n${lesson.content}`,
                      type: 'lesson'
                    });
                  }
                }
              }
            }

            // Store questions for dropdown selection
            if (tutorData.questions && Array.isArray(tutorData.questions) && tutorData.questions.length > 0) {
              this.availableQuestions = tutorData.questions;
              this.selectedQuestionIndex = 0;
              this.currentQuestion = tutorData.questions[0].question;
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
