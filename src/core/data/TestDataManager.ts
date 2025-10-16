/**
 * Test Data Manager
 * 
 * Manages test data lifecycle including creation, cleanup, and persistence
 */

import fs from 'fs/promises';
import path from 'path';
import { testDataFactory, DocumentData, FeatureFileData, UserData, ChatMessageData } from './TestDataFactory';

export interface TestDataSet {
  id: string;
  name: string;
  description: string;
  created: Date;
  data: {
    users?: UserData[];
    documents?: DocumentData[];
    features?: FeatureFileData[];
    chatMessages?: ChatMessageData[];
    [key: string]: any;
  };
}

export interface TestDataConfig {
  persist: boolean;
  cleanup: boolean;
  seedValue?: number;
  outputPath?: string;
}

export class TestDataManager {
  private static instance: TestDataManager;
  private dataSets: Map<string, TestDataSet> = new Map();
  private config: TestDataConfig;
  private dataPath: string;

  private constructor() {
    this.config = {
      persist: true,
      cleanup: true,
      outputPath: path.join(process.cwd(), 'test-data')
    };
    this.dataPath = this.config.outputPath!;
    this.ensureDataDirectory();
  }

  public static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager();
    }
    return TestDataManager.instance;
  }

  /**
   * Configuration methods
   */
  public configure(config: Partial<TestDataConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.outputPath) {
      this.dataPath = config.outputPath;
      this.ensureDataDirectory();
    }
    if (config.seedValue) {
      testDataFactory.setSeed(config.seedValue);
    }
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.dataPath, { recursive: true });
    } catch (error) {
      console.warn('Failed to create test data directory:', error);
    }
  }

  /**
   * Test data set management
   */
  public async createDataSet(name: string, description: string = ''): Promise<string> {
    const id = `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const dataSet: TestDataSet = {
      id,
      name,
      description,
      created: new Date(),
      data: {}
    };

    this.dataSets.set(id, dataSet);

    if (this.config.persist) {
      await this.saveDataSet(dataSet);
    }

    return id;
  }

  public getDataSet(id: string): TestDataSet | undefined {
    return this.dataSets.get(id);
  }

  public async loadDataSet(id: string): Promise<TestDataSet | undefined> {
    if (this.dataSets.has(id)) {
      return this.dataSets.get(id);
    }

    if (this.config.persist) {
      const dataSet = await this.loadDataSetFromFile(id);
      if (dataSet) {
        this.dataSets.set(id, dataSet);
        return dataSet;
      }
    }

    return undefined;
  }

  public async deleteDataSet(id: string): Promise<void> {
    this.dataSets.delete(id);
    
    if (this.config.persist) {
      const filePath = path.join(this.dataPath, `${id}.json`);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.warn(`Failed to delete data set file: ${filePath}`, error);
      }
    }
  }

  public listDataSets(): TestDataSet[] {
    return Array.from(this.dataSets.values());
  }

  /**
   * Data generation methods
   */
  public async generateUsers(dataSetId: string, count: number, overrides?: Partial<UserData>): Promise<UserData[]> {
    const users = testDataFactory.createMultipleUsers(count, overrides);
    await this.addToDataSet(dataSetId, 'users', users);
    return users;
  }

  public async generateDocuments(dataSetId: string, count: number, overrides?: Partial<DocumentData>): Promise<DocumentData[]> {
    const documents = testDataFactory.createMultipleDocuments(count, overrides);
    await this.addToDataSet(dataSetId, 'documents', documents);
    return documents;
  }

  public async generateFeatureFiles(dataSetId: string, count: number, overrides?: Partial<FeatureFileData>): Promise<FeatureFileData[]> {
    const features = testDataFactory.createMultipleFeatureFiles(count, overrides);
    await this.addToDataSet(dataSetId, 'features', features);
    return features;
  }

  public async generateChatConversation(dataSetId: string, messageCount: number, sessionId?: string): Promise<ChatMessageData[]> {
    const messages = testDataFactory.createChatConversation(messageCount, sessionId);
    await this.addToDataSet(dataSetId, 'chatMessages', messages);
    return messages;
  }

  /**
   * File generation methods
   */
  public async generateTestFiles(dataSetId: string, config: {
    count: number;
    types: ('text' | 'pdf' | 'docx' | 'feature')[];
    sizes: ('small' | 'medium' | 'large')[];
  }): Promise<{ name: string; path: string; type: string }[]> {
    const files: { name: string; path: string; type: string }[] = [];
    const filesDir = path.join(this.dataPath, 'files', dataSetId);
    
    await fs.mkdir(filesDir, { recursive: true });

    for (let i = 0; i < config.count; i++) {
      const type = testDataFactory.pickRandom(config.types);
      const size = testDataFactory.pickRandom(config.sizes);
      const fileData = testDataFactory.generateTestFile(type, size);
      
      const filePath = path.join(filesDir, fileData.name);
      await fs.writeFile(filePath, fileData.content, 'utf8');
      
      files.push({
        name: fileData.name,
        path: filePath,
        type: fileData.mimeType
      });
    }

    await this.addToDataSet(dataSetId, 'files', files);
    return files;
  }

  /**
   * Scenario-specific data generation
   */
  public async generateSmokeTestData(dataSetId: string): Promise<{
    users: UserData[];
    documents: DocumentData[];
    features: FeatureFileData[];
  }> {
    const users = await this.generateUsers(dataSetId, 2, { role: 'user' });
    const documents = await this.generateDocuments(dataSetId, 5, { status: 'ready' });
    const features = await this.generateFeatureFiles(dataSetId, 3, { category: 'generated' });

    return { users, documents, features };
  }

  public async generateRegressionTestData(dataSetId: string): Promise<{
    users: UserData[];
    documents: DocumentData[];
    features: FeatureFileData[];
    chatMessages: ChatMessageData[];
  }> {
    const users = await this.generateUsers(dataSetId, 5);
    const documents = await this.generateDocuments(dataSetId, 20);
    const features = await this.generateFeatureFiles(dataSetId, 15);
    const chatMessages = await this.generateChatConversation(dataSetId, 10);

    return { users, documents, features, chatMessages };
  }

  public async generatePerformanceTestData(dataSetId: string): Promise<{
    users: UserData[];
    documents: DocumentData[];
    features: FeatureFileData[];
  }> {
    const users = await this.generateUsers(dataSetId, 50);
    const documents = await this.generateDocuments(dataSetId, 100, { size: 5242880 }); // 5MB files
    const features = await this.generateFeatureFiles(dataSetId, 50);

    return { users, documents, features };
  }

  public async generateApiTestData(dataSetId: string): Promise<{
    validRequests: any[];
    invalidRequests: any[];
    authTokens: string[];
  }> {
    const validRequests = Array.from({ length: 10 }, () => 
      testDataFactory.createApiTestData()
    );
    
    const invalidRequests = Array.from({ length: 5 }, () => 
      testDataFactory.createApiTestData({ expectedStatus: 400 })
    );

    const authTokens = Array.from({ length: 5 }, () => 
      testDataFactory.generateRandomString(32)
    );

    await this.addToDataSet(dataSetId, 'validRequests', validRequests);
    await this.addToDataSet(dataSetId, 'invalidRequests', invalidRequests);
    await this.addToDataSet(dataSetId, 'authTokens', authTokens);

    return { validRequests, invalidRequests, authTokens };
  }

  /**
   * Data manipulation methods
   */
  private async addToDataSet(dataSetId: string, key: string, data: any): Promise<void> {
    const dataSet = this.dataSets.get(dataSetId);
    if (!dataSet) {
      throw new Error(`Data set ${dataSetId} not found`);
    }

    if (!dataSet.data[key]) {
      dataSet.data[key] = [];
    }

    if (Array.isArray(dataSet.data[key])) {
      dataSet.data[key].push(...(Array.isArray(data) ? data : [data]));
    } else {
      dataSet.data[key] = data;
    }

    if (this.config.persist) {
      await this.saveDataSet(dataSet);
    }
  }

  public async updateDataSet(dataSetId: string, key: string, data: any): Promise<void> {
    const dataSet = this.dataSets.get(dataSetId);
    if (!dataSet) {
      throw new Error(`Data set ${dataSetId} not found`);
    }

    dataSet.data[key] = data;

    if (this.config.persist) {
      await this.saveDataSet(dataSet);
    }
  }

  public async getDataFromSet<T>(dataSetId: string, key: string): Promise<T[]> {
    const dataSet = this.dataSets.get(dataSetId);
    if (!dataSet) {
      throw new Error(`Data set ${dataSetId} not found`);
    }

    return dataSet.data[key] || [];
  }

  /**
   * Persistence methods
   */
  private async saveDataSet(dataSet: TestDataSet): Promise<void> {
    if (!this.config.persist) return;

    const filePath = path.join(this.dataPath, `${dataSet.id}.json`);
    try {
      await fs.writeFile(filePath, JSON.stringify(dataSet, null, 2), 'utf8');
    } catch (error) {
      console.warn(`Failed to save data set: ${filePath}`, error);
    }
  }

  private async loadDataSetFromFile(id: string): Promise<TestDataSet | undefined> {
    const filePath = path.join(this.dataPath, `${id}.json`);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const dataSet = JSON.parse(content);
      
      // Convert date strings back to Date objects
      dataSet.created = new Date(dataSet.created);
      
      return dataSet;
    } catch (error) {
      console.warn(`Failed to load data set: ${filePath}`, error);
      return undefined;
    }
  }

  public async exportDataSet(dataSetId: string, outputPath: string): Promise<void> {
    const dataSet = this.dataSets.get(dataSetId);
    if (!dataSet) {
      throw new Error(`Data set ${dataSetId} not found`);
    }

    await fs.writeFile(outputPath, JSON.stringify(dataSet, null, 2), 'utf8');
  }

  public async importDataSet(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath, 'utf8');
    const dataSet: TestDataSet = JSON.parse(content);
    
    // Generate new ID to avoid conflicts
    const newId = `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    dataSet.id = newId;
    dataSet.created = new Date();

    this.dataSets.set(newId, dataSet);

    if (this.config.persist) {
      await this.saveDataSet(dataSet);
    }

    return newId;
  }

  /**
   * Cleanup methods
   */
  public async cleanupDataSet(dataSetId: string): Promise<void> {
    if (!this.config.cleanup) return;

    const dataSet = this.dataSets.get(dataSetId);
    if (!dataSet) return;

    // Clean up generated files
    const filesDir = path.join(this.dataPath, 'files', dataSetId);
    try {
      await fs.rm(filesDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Failed to cleanup files directory: ${filesDir}`, error);
    }

    // Remove data set
    await this.deleteDataSet(dataSetId);
  }

  public async cleanupAllDataSets(): Promise<void> {
    if (!this.config.cleanup) return;

    const dataSetIds = Array.from(this.dataSets.keys());
    for (const id of dataSetIds) {
      await this.cleanupDataSet(id);
    }
  }

  public async cleanupExpiredDataSets(maxAgeHours: number = 24): Promise<void> {
    if (!this.config.cleanup) return;

    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    
    for (const [id, dataSet] of this.dataSets) {
      if (dataSet.created < cutoffTime) {
        await this.cleanupDataSet(id);
      }
    }
  }

  /**
   * Utility methods
   */
  public getDataSetSize(dataSetId: string): number {
    const dataSet = this.dataSets.get(dataSetId);
    if (!dataSet) return 0;

    return Object.values(dataSet.data).reduce((total, items) => {
      if (Array.isArray(items)) {
        return total + items.length;
      }
      return total + 1;
    }, 0);
  }

  public getDataSetSummary(dataSetId: string): { [key: string]: number } {
    const dataSet = this.dataSets.get(dataSetId);
    if (!dataSet) return {};

    const summary: { [key: string]: number } = {};
    
    for (const [key, items] of Object.entries(dataSet.data)) {
      if (Array.isArray(items)) {
        summary[key] = items.length;
      } else {
        summary[key] = 1;
      }
    }

    return summary;
  }

  public async getStorageUsage(): Promise<{
    totalDataSets: number;
    totalSizeBytes: number;
    oldestDataSet: Date | null;
    newestDataSet: Date | null;
  }> {
    const dataSets = Array.from(this.dataSets.values());
    let totalSize = 0;

    // Calculate total size by checking file sizes
    try {
      const files = await fs.readdir(this.dataPath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.dataPath, file);
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      console.warn('Failed to calculate storage usage:', error);
    }

    const dates = dataSets.map(ds => ds.created).sort();
    
    return {
      totalDataSets: dataSets.length,
      totalSizeBytes: totalSize,
      oldestDataSet: dates.length > 0 ? dates[0] : null,
      newestDataSet: dates.length > 0 ? dates[dates.length - 1] : null
    };
  }
}

// Export singleton instance
export const testDataManager = TestDataManager.getInstance();
export default testDataManager;