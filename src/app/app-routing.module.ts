import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseComponent } from './course/course.component';
import { LessonComponent } from './lesson/lesson.component';
import { ChatComponent } from './chat/chat.component';
import { ContentUploadComponent } from './content-upload/content-upload.component';
import { KnowledgeGraphComponent } from './knowledge-graph/knowledge-graph.component';

const routes: Routes = [
  { path: '', component: CourseComponent },
  { path: 'lesson/:id', component: LessonComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'upload', component: ContentUploadComponent },
  { path: 'graph', component: KnowledgeGraphComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
