/**
 * ChromaDB Seeder
 * 
 * Handles seeding of vector data in ChromaDB
 */

import { faker } from '@faker-js/faker';

export interface ChromaSeedOptions {
  mark?: boolean;
  minimal?: boolean;
}

export class ChromaDBSeeder {
  constructor(private chromaUrl: string) {}

  /**
   * Seed a collection with test vectors
   */
  async seedCollection(
    collectionName: string,
    documentIds: string[],
    options: ChromaSeedOptions = {}
  ): Promise<number> {
    try {
      // Create collection if it doesn't exist
      await this.ensureCollection(collectionName);

      // Generate vectors based on collection type
      const vectors = collectionName === 'documents' 
        ? this.generateDocumentVectors(documentIds, options)
        : this.generateFeatureVectors(documentIds, options);

      // Add vectors to collection
      const response = await fetch(`${this.chromaUrl}/api/v1/collections/${collectionName}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vectors)
      });

      if (!response.ok) {
        throw new Error(`Failed to seed collection: ${response.statusText}`);
      }

      return vectors.ids.length;
    } catch (error) {
      console.error(`Error seeding ChromaDB collection ${collectionName}:`, error);
      return 0;
    }
  }

  /**
   * Ensure collection exists
   */
  private async ensureCollection(name: string): Promise<void> {
    try {
      await fetch(`${this.chromaUrl}/api/v1/collections/${name}`, {
        method: 'GET'
      });
    } catch {
      // Create collection if it doesn't exist
      await fetch(`${this.chromaUrl}/api/v1/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          metadata: { hnsw_space: 'cosine' }
        })
      });
    }
  }

  /**
   * Generate document vectors
   */
  private generateDocumentVectors(
    documentIds: string[],
    options: ChromaSeedOptions
  ) {
    const count = options.minimal ? Math.min(3, documentIds.length) : documentIds.length;
    const ids: string[] = [];
    const embeddings: number[][] = [];
    const metadatas: any[] = [];
    const documents: string[] = [];

    for (let i = 0; i < count; i++) {
      const docId = documentIds[i % documentIds.length];
      const vectorId = `${docId}_chunk_${i}`;
      
      ids.push(vectorId);
      embeddings.push(this.generateRandomEmbedding(1536)); // OpenAI embedding size
      documents.push(this.generateDocumentContent(i));
      metadatas.push({
        document_id: docId,
        chunk_index: i,
        page_number: Math.floor(i / 3) + 1,
        source: 'seeded_document.pdf',
        type: 'requirements',
        ...(options.mark && { test_marker: '__seeded__', seeded: true })
      });
    }

    return { ids, embeddings, metadatas, documents };
  }

  /**
   * Generate feature vectors
   */
  private generateFeatureVectors(
    featureIds: string[],
    options: ChromaSeedOptions
  ) {
    const count = options.minimal ? Math.min(2, featureIds.length) : featureIds.length;
    const ids: string[] = [];
    const embeddings: number[][] = [];
    const metadatas: any[] = [];
    const documents: string[] = [];

    for (let i = 0; i < count; i++) {
      const featureId = featureIds[i % featureIds.length];
      const vectorId = `${featureId}_scenario_${i}`;
      
      ids.push(vectorId);
      embeddings.push(this.generateRandomEmbedding(1536));
      documents.push(this.generateFeatureContent(i));
      metadatas.push({
        feature_id: featureId,
        scenario_index: i,
        scenario_name: `Seeded Scenario ${i + 1}`,
        tags: ['seeded', 'test', 'e2e'],
        ...(options.mark && { test_marker: '__seeded__', seeded: true })
      });
    }

    return { ids, embeddings, metadatas, documents };
  }

  /**
   * Generate random embedding vector
   */
  private generateRandomEmbedding(dimension: number): number[] {
    const embedding: number[] = [];
    for (let i = 0; i < dimension; i++) {
      embedding.push(faker.number.float({ min: -1, max: 1, fractionDigits: 6 }));
    }
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  /**
   * Generate document content
   */
  private generateDocumentContent(index: number): string {
    const templates = [
      'The system shall provide user authentication with multi-factor support.',
      'Users must be able to upload documents in PDF, DOCX, and TXT formats.',
      'The application shall generate test scenarios based on uploaded requirements.',
      'System performance must support 1000 concurrent users.',
      'All user data must be encrypted at rest and in transit.'
    ];
    
    return templates[index % templates.length] + ' This is seeded test content.';
  }

  /**
   * Generate feature content
   */
  private generateFeatureContent(index: number): string {
    const templates = [
      'Given I am on the login page\nWhen I enter valid credentials\nThen I should be logged in',
      'Given I have a document\nWhen I upload it\nThen it should be processed successfully',
      'Given I am logged in\nWhen I generate features\nThen I should see Gherkin scenarios'
    ];
    
    return templates[index % templates.length];
  }

  /**
   * Reset seeded data
   */
  async resetSeededData(): Promise<void> {
    const collections = ['documents', 'features'];
    
    for (const collection of collections) {
      try {
        // Delete by metadata filter
        await fetch(`${this.chromaUrl}/api/v1/collections/${collection}/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            where: { seeded: true }
          })
        });
      } catch (error) {
        console.error(`Error resetting collection ${collection}:`, error);
      }
    }
  }

  /**
   * Verify seeded data exists
   */
  async verifySeededData(): Promise<{
    documents: number;
    features: number;
  }> {
    const counts = {
      documents: 0,
      features: 0
    };

    for (const collection of ['documents', 'features'] as const) {
      try {
        const response = await fetch(
          `${this.chromaUrl}/api/v1/collections/${collection}/count`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              where: { seeded: true }
            })
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          counts[collection] = data.count || 0;
        }
      } catch (error) {
        console.error(`Error verifying collection ${collection}:`, error);
      }
    }

    return counts;
  }
}