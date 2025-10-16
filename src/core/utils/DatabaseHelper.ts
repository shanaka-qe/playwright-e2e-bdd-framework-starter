/**
 * Database Helper
 * 
 * Utility class for database operations and test data seeding
 */

import { DatabaseConfig } from '../config/EnvironmentConfig';

// Simple database interface (would typically use a proper database client)
export interface DatabaseConnection {
  query(sql: string, params?: any[]): Promise<any[]>;
  execute(sql: string, params?: any[]): Promise<{ affectedRows: number; insertId?: number }>;
  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  close(): Promise<void>;
}

// Mock implementation for demonstration (replace with actual database client)
class MockDatabaseConnection implements DatabaseConnection {
  private connected = false;
  private inTransaction = false;

  async connect(): Promise<void> {
    this.connected = true;
  }

  async query(sql: string, params?: any[]): Promise<any[]> {
    if (!this.connected) throw new Error('Not connected to database');
    
    console.log(`[DB] Query: ${sql}`, params);
    
    // Mock data based on query type
    if (sql.includes('SELECT') && sql.includes('documents')) {
      return [
        { id: 1, name: 'test-doc.pdf', type: 'pdf', status: 'ready', created_at: new Date() },
        { id: 2, name: 'test-doc2.txt', type: 'txt', status: 'ready', created_at: new Date() }
      ];
    } else if (sql.includes('SELECT') && sql.includes('feature_files')) {
      return [
        { id: 1, title: 'Login Feature', content: 'Feature: Login...', category: 'generated', created_at: new Date() }
      ];
    }
    
    return [];
  }

  async execute(sql: string, params?: any[]): Promise<{ affectedRows: number; insertId?: number }> {
    if (!this.connected) throw new Error('Not connected to database');
    
    console.log(`[DB] Execute: ${sql}`, params);
    
    return { affectedRows: 1, insertId: Math.floor(Math.random() * 1000) };
  }

  async beginTransaction(): Promise<void> {
    if (!this.connected) throw new Error('Not connected to database');
    this.inTransaction = true;
    console.log('[DB] Transaction started');
  }

  async commitTransaction(): Promise<void> {
    if (!this.connected) throw new Error('Not connected to database');
    this.inTransaction = false;
    console.log('[DB] Transaction committed');
  }

  async rollbackTransaction(): Promise<void> {
    if (!this.connected) throw new Error('Not connected to database');
    this.inTransaction = false;
    console.log('[DB] Transaction rolled back');
  }

  async close(): Promise<void> {
    this.connected = false;
    console.log('[DB] Connection closed');
  }
}

export class DatabaseHelper {
  private config: DatabaseConfig;
  private connection: DatabaseConnection;
  private isConnected = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.connection = new MockDatabaseConnection(); // Replace with actual client
  }

  /**
   * Connection management
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;
    
    try {
      await (this.connection as any).connect();
      this.isConnected = true;
      console.log(`[DB] Connected to ${this.config.host}:${this.config.port}/${this.config.database}`);
    } catch (error) {
      throw new Error(`Failed to connect to database: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    
    await this.connection.close();
    this.isConnected = false;
  }

  /**
   * Transaction management
   */
  async beginTransaction(): Promise<void> {
    await this.connection.beginTransaction();
  }

  async commitTransaction(): Promise<void> {
    await this.connection.commitTransaction();
  }

  async rollbackTransaction(): Promise<void> {
    await this.connection.rollbackTransaction();
  }

  /**
   * Document operations
   */
  async insertDocument(document: {
    name: string;
    type: string;
    content: string;
    size: number;
    status?: string;
  }): Promise<number> {
    const sql = `
      INSERT INTO documents (name, type, content, size, status, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await this.connection.execute(sql, [
      document.name,
      document.type,
      document.content,
      document.size,
      document.status || 'uploaded'
    ]);
    
    return result.insertId!;
  }

  async getDocuments(filters?: {
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    let sql = 'SELECT * FROM documents WHERE 1=1';
    const params: any[] = [];
    
    if (filters?.type) {
      sql += ' AND type = ?';
      params.push(filters.type);
    }
    
    if (filters?.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    if (filters?.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
      
      if (filters?.offset) {
        sql += ' OFFSET ?';
        params.push(filters.offset);
      }
    }
    
    return this.connection.query(sql, params);
  }

  async getDocument(id: number): Promise<any | null> {
    const results = await this.connection.query(
      'SELECT * FROM documents WHERE id = ?',
      [id]
    );
    
    return results.length > 0 ? results[0] : null;
  }

  async updateDocumentStatus(id: number, status: string): Promise<void> {
    await this.connection.execute(
      'UPDATE documents SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
  }

  async deleteDocument(id: number): Promise<void> {
    await this.connection.execute('DELETE FROM documents WHERE id = ?', [id]);
  }

  async cleanupDocuments(olderThanDays?: number): Promise<number> {
    let sql = 'DELETE FROM documents WHERE 1=1';
    const params: any[] = [];
    
    if (olderThanDays) {
      sql += ' AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)';
      params.push(olderThanDays);
    }
    
    const result = await this.connection.execute(sql, params);
    return result.affectedRows;
  }

  /**
   * Feature file operations
   */
  async insertFeatureFile(feature: {
    title: string;
    content: string;
    category?: string;
    author?: string;
  }): Promise<number> {
    const sql = `
      INSERT INTO feature_files (title, content, category, author, created_at, updated_at) 
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await this.connection.execute(sql, [
      feature.title,
      feature.content,
      feature.category || 'generated',
      feature.author || 'test-user'
    ]);
    
    return result.insertId!;
  }

  async getFeatureFiles(filters?: {
    category?: string;
    author?: string;
    limit?: number;
  }): Promise<any[]> {
    let sql = 'SELECT * FROM feature_files WHERE 1=1';
    const params: any[] = [];
    
    if (filters?.category) {
      sql += ' AND category = ?';
      params.push(filters.category);
    }
    
    if (filters?.author) {
      sql += ' AND author = ?';
      params.push(filters.author);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    if (filters?.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    return this.connection.query(sql, params);
  }

  async getFeatureFile(id: number): Promise<any | null> {
    const results = await this.connection.query(
      'SELECT * FROM feature_files WHERE id = ?',
      [id]
    );
    
    return results.length > 0 ? results[0] : null;
  }

  async updateFeatureFile(id: number, updates: {
    title?: string;
    content?: string;
    category?: string;
  }): Promise<void> {
    const fields: string[] = [];
    const params: any[] = [];
    
    if (updates.title) {
      fields.push('title = ?');
      params.push(updates.title);
    }
    
    if (updates.content) {
      fields.push('content = ?');
      params.push(updates.content);
    }
    
    if (updates.category) {
      fields.push('category = ?');
      params.push(updates.category);
    }
    
    if (fields.length === 0) return;
    
    fields.push('updated_at = NOW()');
    params.push(id);
    
    const sql = `UPDATE feature_files SET ${fields.join(', ')} WHERE id = ?`;
    await this.connection.execute(sql, params);
  }

  async deleteFeatureFile(id: number): Promise<void> {
    await this.connection.execute('DELETE FROM feature_files WHERE id = ?', [id]);
  }

  async cleanupFeatureFiles(category?: string, olderThanDays?: number): Promise<number> {
    let sql = 'DELETE FROM feature_files WHERE 1=1';
    const params: any[] = [];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    if (olderThanDays) {
      sql += ' AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)';
      params.push(olderThanDays);
    }
    
    const result = await this.connection.execute(sql, params);
    return result.affectedRows;
  }

  /**
   * User operations
   */
  async insertUser(user: {
    username: string;
    email: string;
    passwordHash: string;
    role?: string;
  }): Promise<number> {
    const sql = `
      INSERT INTO users (username, email, password_hash, role, created_at, updated_at) 
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await this.connection.execute(sql, [
      user.username,
      user.email,
      user.passwordHash,
      user.role || 'user'
    ]);
    
    return result.insertId!;
  }

  async getUser(identifier: string | number): Promise<any | null> {
    let sql: string;
    
    if (typeof identifier === 'number') {
      sql = 'SELECT * FROM users WHERE id = ?';
    } else if (identifier.includes('@')) {
      sql = 'SELECT * FROM users WHERE email = ?';
    } else {
      sql = 'SELECT * FROM users WHERE username = ?';
    }
    
    const results = await this.connection.query(sql, [identifier]);
    return results.length > 0 ? results[0] : null;
  }

  async deleteUser(id: number): Promise<void> {
    await this.connection.execute('DELETE FROM users WHERE id = ?', [id]);
  }

  /**
   * Ingestion operations
   */
  async insertIngestion(ingestion: {
    documentId: number;
    status: string;
    metadata?: any;
  }): Promise<number> {
    const sql = `
      INSERT INTO ingestions (document_id, status, metadata, created_at, updated_at) 
      VALUES (?, ?, ?, NOW(), NOW())
    `;
    
    const result = await this.connection.execute(sql, [
      ingestion.documentId,
      ingestion.status,
      JSON.stringify(ingestion.metadata || {})
    ]);
    
    return result.insertId!;
  }

  async updateIngestionStatus(id: number, status: string, metadata?: any): Promise<void> {
    const sql = 'UPDATE ingestions SET status = ?, metadata = ?, updated_at = NOW() WHERE id = ?';
    const params = [status, JSON.stringify(metadata || {}), id];
    
    await this.connection.execute(sql, params);
  }

  async getIngestions(documentId?: number): Promise<any[]> {
    let sql = 'SELECT * FROM ingestions';
    const params: any[] = [];
    
    if (documentId) {
      sql += ' WHERE document_id = ?';
      params.push(documentId);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    return this.connection.query(sql, params);
  }

  /**
   * Database maintenance
   */
  async getTables(): Promise<string[]> {
    const results = await this.connection.query('SHOW TABLES');
    return results.map(row => Object.values(row)[0] as string);
  }

  async getTableRowCount(tableName: string): Promise<number> {
    const results = await this.connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
    return results[0].count;
  }

  async truncateTable(tableName: string): Promise<void> {
    await this.connection.execute(`TRUNCATE TABLE ${tableName}`);
  }

  async cleanupAllTestData(): Promise<void> {
    const testTables = ['documents', 'feature_files', 'ingestions'];
    
    await this.beginTransaction();
    
    try {
      for (const table of testTables) {
        await this.connection.execute(`DELETE FROM ${table} WHERE created_at >= CURDATE()`);
      }
      
      await this.commitTransaction();
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    }
  }

  /**
   * Health checks
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.connection.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async getDatabaseVersion(): Promise<string> {
    const results = await this.connection.query('SELECT VERSION() as version');
    return results[0].version;
  }

  async getConnectionInfo(): Promise<{
    host: string;
    port: number;
    database: string;
    connected: boolean;
  }> {
    return {
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      connected: this.isConnected
    };
  }

  /**
   * Backup and restore utilities
   */
  async createTestSnapshot(): Promise<string> {
    const snapshotId = `test_snapshot_${Date.now()}`;
    
    // In a real implementation, you would create a database snapshot
    // This is a placeholder for the concept
    console.log(`[DB] Created test snapshot: ${snapshotId}`);
    
    return snapshotId;
  }

  async restoreFromSnapshot(snapshotId: string): Promise<void> {
    // In a real implementation, you would restore from a database snapshot
    console.log(`[DB] Restored from snapshot: ${snapshotId}`);
  }

  async deleteSnapshot(snapshotId: string): Promise<void> {
    console.log(`[DB] Deleted snapshot: ${snapshotId}`);
  }

  /**
   * Query helpers
   */
  async executeRawQuery(sql: string, params?: any[]): Promise<any[]> {
    return this.connection.query(sql, params);
  }

  async executeRawCommand(sql: string, params?: any[]): Promise<{ affectedRows: number; insertId?: number }> {
    return this.connection.execute(sql, params);
  }

  /**
   * Seed data helpers
   */
  async seedTestData(dataType: 'minimal' | 'full' | 'performance'): Promise<void> {
    console.log(`[DB] Seeding ${dataType} test data...`);
    
    await this.beginTransaction();
    
    try {
      switch (dataType) {
        case 'minimal':
          await this.seedMinimalData();
          break;
        case 'full':
          await this.seedFullData();
          break;
        case 'performance':
          await this.seedPerformanceData();
          break;
      }
      
      await this.commitTransaction();
      console.log(`[DB] ${dataType} test data seeded successfully`);
    } catch (error) {
      await this.rollbackTransaction();
      throw new Error(`Failed to seed ${dataType} test data: ${error}`);
    }
  }

  private async seedMinimalData(): Promise<void> {
    // Insert minimal test data
    await this.insertDocument({
      name: 'test-document.pdf',
      type: 'pdf',
      content: 'Test document content',
      size: 1024,
      status: 'ready'
    });

    await this.insertFeatureFile({
      title: 'Test Feature',
      content: 'Feature: Test\nScenario: Test scenario\nGiven I am on the test page',
      category: 'generated'
    });
  }

  private async seedFullData(): Promise<void> {
    // Insert comprehensive test data
    for (let i = 1; i <= 10; i++) {
      await this.insertDocument({
        name: `document-${i}.pdf`,
        type: 'pdf',
        content: `Content for document ${i}`,
        size: 1024 * i,
        status: 'ready'
      });
    }

    for (let i = 1; i <= 5; i++) {
      await this.insertFeatureFile({
        title: `Feature ${i}`,
        content: `Feature: Feature ${i}\nScenario: Scenario ${i}\nGiven I am testing feature ${i}`,
        category: 'generated'
      });
    }
  }

  private async seedPerformanceData(): Promise<void> {
    // Insert large amounts of test data for performance testing
    const batchSize = 100;
    
    for (let batch = 0; batch < 10; batch++) {
      for (let i = 1; i <= batchSize; i++) {
        const docId = batch * batchSize + i;
        await this.insertDocument({
          name: `perf-doc-${docId}.pdf`,
          type: 'pdf',
          content: `Performance test document ${docId} with more content to simulate realistic data sizes`,
          size: 10240, // 10KB
          status: 'ready'
        });
      }
    }
  }
}

export default DatabaseHelper;