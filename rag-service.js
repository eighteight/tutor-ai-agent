const fs = require('fs');
const path = require('path');

class RAGService {
  constructor(contentDir = './course-content') {
    this.contentDir = contentDir;
    this.courseContent = this.loadCourseContent();
  }

  loadCourseContent() {
    const content = {};
    try {
      const files = fs.readdirSync(this.contentDir);
      files.forEach(file => {
        if (file.endsWith('.md')) {
          const filePath = path.join(this.contentDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const courseName = file.replace('.md', '');
          content[courseName] = fileContent;
        }
      });
    } catch (error) {
      console.log('No course content directory found');
    }
    return content;
  }

  retrieveRelevantContent(topic, courseName = 'sample-course') {
    const content = this.courseContent[courseName];
    if (!content) return '';
    
    // Simple keyword matching - can be enhanced with embeddings
    const sections = content.split('##').filter(section => 
      section.toLowerCase().includes(topic.toLowerCase())
    );
    
    return sections.join('\n##').substring(0, 1000); // Limit context size
  }
}

module.exports = RAGService;