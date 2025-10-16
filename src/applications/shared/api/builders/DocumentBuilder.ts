/**
 * Document Builder
 * 
 * Builder pattern for creating test documents with realistic data
 */

import { Document, DocumentType, DocumentStatus, DocumentMetadata } from '../types';
import { faker } from '@faker-js/faker';

export class DocumentBuilder {
  private document: Partial<Document>;

  constructor() {
    // Set defaults
    this.document = {
      id: faker.string.uuid(),
      name: faker.system.fileName({ extensionCount: 0 }) + '.pdf',
      type: DocumentType.PDF,
      size: faker.number.int({ min: 1000, max: 5000000 }),
      status: DocumentStatus.PENDING,
      uploadedBy: faker.string.uuid(),
      uploadedAt: faker.date.recent().toISOString(),
      tags: []
    };
  }

  withId(id: string): DocumentBuilder {
    this.document.id = id;
    return this;
  }

  withName(name: string): DocumentBuilder {
    this.document.name = name;
    return this;
  }

  withType(type: DocumentType): DocumentBuilder {
    this.document.type = type;
    // Update name extension to match type
    if (this.document.name) {
      const baseName = this.document.name.split('.')[0];
      this.document.name = `${baseName}.${type}`;
    }
    return this;
  }

  withSize(size: number): DocumentBuilder {
    this.document.size = size;
    return this;
  }

  withStatus(status: DocumentStatus): DocumentBuilder {
    this.document.status = status;
    if (status === DocumentStatus.PROCESSED) {
      this.document.processedAt = faker.date.recent().toISOString();
    }
    return this;
  }

  withUploadedBy(userId: string): DocumentBuilder {
    this.document.uploadedBy = userId;
    return this;
  }

  withUploadedAt(date: Date | string): DocumentBuilder {
    this.document.uploadedAt = typeof date === 'string' ? date : date.toISOString();
    return this;
  }

  withProcessedAt(date: Date | string): DocumentBuilder {
    this.document.processedAt = typeof date === 'string' ? date : date.toISOString();
    return this;
  }

  withTags(...tags: string[]): DocumentBuilder {
    this.document.tags = tags;
    return this;
  }

  withMetadata(metadata: DocumentMetadata): DocumentBuilder {
    this.document.metadata = metadata;
    return this;
  }

  withRandomMetadata(): DocumentBuilder {
    this.document.metadata = {
      pageCount: faker.number.int({ min: 1, max: 100 }),
      wordCount: faker.number.int({ min: 100, max: 50000 }),
      language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de']),
      extractedText: faker.lorem.paragraphs(3),
      summary: faker.lorem.paragraph()
    };
    return this;
  }

  // Preset builders
  asPDF(): DocumentBuilder {
    return this
      .withType(DocumentType.PDF)
      .withSize(faker.number.int({ min: 50000, max: 5000000 }));
  }

  asWord(): DocumentBuilder {
    return this
      .withType(DocumentType.DOCX)
      .withSize(faker.number.int({ min: 20000, max: 1000000 }));
  }

  asText(): DocumentBuilder {
    return this
      .withType(DocumentType.TXT)
      .withSize(faker.number.int({ min: 1000, max: 100000 }));
  }

  asProcessed(): DocumentBuilder {
    return this
      .withStatus(DocumentStatus.PROCESSED)
      .withProcessedAt(faker.date.recent())
      .withRandomMetadata();
  }

  asFailed(): DocumentBuilder {
    return this
      .withStatus(DocumentStatus.FAILED)
      .withProcessedAt(faker.date.recent());
  }

  asRequirementsDoc(): DocumentBuilder {
    return this
      .withName('Software Requirements Specification.pdf')
      .asPDF()
      .withTags('requirements', 'specification', 'functional')
      .asProcessed()
      .withMetadata({
        pageCount: 25,
        wordCount: 12500,
        language: 'en',
        extractedText: 'Functional Requirements...',
        summary: 'This document describes the functional and non-functional requirements...'
      });
  }

  asTestPlan(): DocumentBuilder {
    return this
      .withName('Test Plan v2.1.docx')
      .asWord()
      .withTags('testing', 'qa', 'plan')
      .asProcessed()
      .withMetadata({
        pageCount: 15,
        wordCount: 7500,
        language: 'en',
        extractedText: 'Test Strategy and Approach...',
        summary: 'Comprehensive test plan covering unit, integration, and E2E testing...'
      });
  }

  asUserStory(): DocumentBuilder {
    return this
      .withName('User Stories - Sprint 23.md')
      .withType(DocumentType.MD)
      .withTags('agile', 'user-story', 'sprint-23')
      .asProcessed()
      .withSize(faker.number.int({ min: 5000, max: 20000 }));
  }

  build(): Document {
    if (!this.document.id) {
      this.document.id = faker.string.uuid();
    }
    return this.document as Document;
  }

  buildMany(count: number): Document[] {
    const documents: Document[] = [];
    for (let i = 0; i < count; i++) {
      // Create new builder instance to avoid state sharing
      const builder = new DocumentBuilder();
      // Apply some randomization
      if (i % 3 === 0) builder.asPDF();
      else if (i % 3 === 1) builder.asWord();
      else builder.asText();
      
      if (i % 2 === 0) builder.asProcessed();
      
      documents.push(builder.build());
    }
    return documents;
  }
}

// Factory function for quick creation
export function aDocument(): DocumentBuilder {
  return new DocumentBuilder();
}

// Pre-configured factories
export const DocumentFactory = {
  // Create a processed PDF
  processedPDF: () => aDocument().asPDF().asProcessed().build(),
  
  // Create a failed document
  failedDocument: () => aDocument().asFailed().build(),
  
  // Create a requirements document
  requirements: () => aDocument().asRequirementsDoc().build(),
  
  // Create a test plan
  testPlan: () => aDocument().asTestPlan().build(),
  
  // Create a user story
  userStory: () => aDocument().asUserStory().build(),
  
  // Create multiple documents with various types
  mixed: (count: number) => aDocument().buildMany(count),
  
  // Create documents with specific status
  withStatus: (status: DocumentStatus, count = 1) => {
    const docs: Document[] = [];
    for (let i = 0; i < count; i++) {
      docs.push(aDocument().withStatus(status).build());
    }
    return count === 1 ? docs[0] : docs;
  }
};