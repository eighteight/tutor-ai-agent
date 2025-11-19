import { Component, OnInit, ViewEncapsulation, NgZone } from '@angular/core';
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
  styleUrls: ['./chat.component.css'],
  encapsulation: ViewEncapsulation.None
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
  retentionHistory: number[] = [];
  isRecording: boolean = false;
  recognition: any = null;
  currentLanguage: string = 'en-US';

  constructor(private n8nService: N8nService, private route: ActivatedRoute, private ngZone: NgZone) {
    // Initialize speech recognition if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = this.currentLanguage;
      
      this.recognition.onstart = () => {
        console.log('Speech recognition started');
      };
      
      this.recognition.onresult = (event: any) => {
        console.log('Speech recognition result:', event);
        const transcript = event.results[0][0].transcript;
        console.log('Transcript:', transcript);
        this.ngZone.run(() => {
          console.log('Setting message to:', transcript);
          this.message = transcript;
          console.log('Message is now:', this.message);
        });
      };
      
      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        alert(`Speech recognition error: ${event.error}. Please check microphone permissions.`);
        this.ngZone.run(() => {
          this.isRecording = false;
        });
      };
      
      this.recognition.onend = () => {
        console.log('Speech recognition ended');
        this.ngZone.run(() => {
          this.isRecording = false;
        });
      };
    }
  }

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
    // First preserve any existing HTML (like colored spans)
    // Then apply markdown formatting
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  toggleRecording(): void {
    if (!this.recognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    
    if (this.isRecording) {
      console.log('Stopping recording');
      this.recognition.stop();
    } else {
      // Force update language before starting
      if (this.recognition.lang !== this.currentLanguage) {
        this.recognition.lang = this.currentLanguage;
      }
      console.log('Starting recording with language:', this.currentLanguage);
      this.recognition.start();
      this.isRecording = true;
    }
  }

  playRetentionSound(retentionValue: number): void {
    let soundFile = '';
    
    if (retentionValue > 0.75) {
      // Success sound
      soundFile = 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3';
    } else if (retentionValue >= 0.5) {
      // Neutral sound
      soundFile = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
    } else {
      // Fail sound
      soundFile = 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3';
    }
    
    const audio = new Audio(soundFile);
    audio.volume = 0.25;
    audio.play().catch(err => console.log('Audio play failed:', err));
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
            let retention = response.retention;
            let feedback = response.feedback;
            let language = response.language;
            let lessonKind = response.lesson_kind;

            if (typeof response === 'object' && response.message) {
              // n8n workflow started message - wait for actual response
              this.messages.push({ sender: 'tutor', text: 'Processing your answer...' });
              this.isLoading = false;
              this.message = '';
              return;
            } else if (typeof response === 'object' && response.response) {
              // Parse from response field
              let ollamaResponse = response.response;
              // Remove <think> blocks
              ollamaResponse = ollamaResponse.replace(/<think>[\s\S]*?<\/think>/g, '');
              // Extract JSON from code blocks
              const jsonMatch = ollamaResponse.match(/```json\s*([\s\S]*?)\s*```/);
              if (jsonMatch) {
                ollamaResponse = jsonMatch[1];
              }
              // Clean up
              ollamaResponse = ollamaResponse.trim();
              tutorData = JSON.parse(ollamaResponse);
            } else {
              tutorData = response;
            }
            console.log('Parsed tutor data:', tutorData);

            // Display language, lesson type, and retention score in one line
            const statusParts = [];
            let retentionColor = '';

            if (language) {
              const languageName = language === 'ru' ? 'Russian' : 'English';
              // Update speech recognition language
              this.currentLanguage = language === 'ru' ? 'ru-RU' : 'en-US';
              console.log('Updated currentLanguage to:', this.currentLanguage);
              statusParts.push(`Language: ${languageName}`);
            }

            if (lessonKind) {
              const lessonType = lessonKind === 'advanced' ? 'Advanced' : 'Review';
              statusParts.push(`Lesson: ${lessonType}`);
            }

            if (retention !== undefined) {
              console.log('Raw retention value:', retention, 'Type:', typeof retention);
              let retentionValue = parseFloat(retention);
              console.log('Parsed retention value:', retentionValue);
              if (!isNaN(retentionValue)) {
                // Normalize to 0-1 range if needed
                if (retentionValue > 1) {
                  retentionValue = retentionValue / 100;
                }
                console.log('Normalized retention value:', retentionValue);

                const retentionPercent = Math.round(retentionValue * 100);

                // Determine color based on normalized retention value (0-1)
                if (retentionValue < 0.5) {
                  retentionColor = 'red';
                  console.log('Color: red (< 0.5)');
                } else if (retentionValue <= 0.75) {
                  retentionColor = 'orange';
                  console.log('Color: orange (0.5-0.75)');
                } else {
                  retentionColor = 'green';
                  console.log('Color: green (> 0.75)');
                }
                console.log('Final color:', retentionColor, 'Percent:', retentionPercent);

                // Play sound based on retention
                this.playRetentionSound(retentionValue);

                // Track retention for average calculation
                this.retentionHistory.push(retentionValue);
                const avgRetention = this.retentionHistory.reduce((a, b) => a + b, 0) / this.retentionHistory.length;
                const avgRetentionPercent = Math.round(avgRetention * 100);

                statusParts.push(`Retention: <span class="retention-${retentionColor}">${retentionPercent}%</span> | Avg: ${avgRetentionPercent}%`);
              }
            }

            if (statusParts.length > 0) {
              this.messages.push({
                sender: 'tutor',
                text: `<strong>${statusParts.join(' | ')}</strong>`,
                type: 'text'
              });
            }

            if (feedback) {
              this.messages.push({
                sender: 'tutor',
                text: feedback,
                type: 'text'
              });
            }

            // Display lesson content
            if (tutorData.lesson_content) {
              if (Array.isArray(tutorData.lesson_content)) {
                tutorData.lesson_content.forEach((lesson: any) => {
                  if (lesson.title && lesson.content) {
                    // title/content structure
                    this.messages.push({
                      sender: 'tutor',
                      text: `**${lesson.title}**\n\n${lesson.content}`,
                      type: 'lesson'
                    });
                  } else if (lesson.type && lesson.content) {
                    // type/content structure
                    const title = lesson.type.toUpperCase();
                    const content = Array.isArray(lesson.content) ? lesson.content.join('\n') : lesson.content;
                    this.messages.push({
                      sender: 'tutor',
                      text: `**${title}**\n\n${content}`,
                      type: 'lesson'
                    });
                  }
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
