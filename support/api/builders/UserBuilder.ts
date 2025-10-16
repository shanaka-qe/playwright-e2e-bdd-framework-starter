/**
 * User Builder
 * 
 * Builder pattern for creating test users with realistic data
 */

import { UserProfile, UserRole, AdminUser, UserStatus } from '../types';
import { faker } from '@faker-js/faker';

export class UserBuilder {
  protected user: Partial<UserProfile>;

  constructor() {
    // Set defaults
    this.user = {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: UserRole.USER,
      permissions: [],
      avatar: faker.image.avatar(),
      createdAt: faker.date.past().toISOString(),
      lastLogin: faker.date.recent().toISOString()
    };
  }

  withId(id: string): UserBuilder {
    this.user.id = id;
    return this;
  }

  withEmail(email: string): UserBuilder {
    this.user.email = email;
    return this;
  }

  withName(name: string): UserBuilder {
    this.user.name = name;
    return this;
  }

  withRole(role: UserRole): UserBuilder {
    this.user.role = role;
    // Set default permissions based on role
    switch (role) {
      case UserRole.ADMIN:
        this.user.permissions = ['*'];
        break;
      case UserRole.QA_ENGINEER:
        this.user.permissions = ['documents.read', 'documents.write', 'features.read', 'features.write', 'tests.execute'];
        break;
      case UserRole.DEVELOPER:
        this.user.permissions = ['documents.read', 'features.read', 'code.read', 'code.write'];
        break;
      case UserRole.VIEWER:
        this.user.permissions = ['documents.read', 'features.read'];
        break;
      default:
        this.user.permissions = ['documents.read', 'features.read'];
    }
    return this;
  }

  withPermissions(...permissions: string[]): UserBuilder {
    this.user.permissions = permissions;
    return this;
  }

  withAvatar(url: string): UserBuilder {
    this.user.avatar = url;
    return this;
  }

  withCreatedAt(date: Date | string): UserBuilder {
    this.user.createdAt = typeof date === 'string' ? date : date.toISOString();
    return this;
  }

  withLastLogin(date: Date | string): UserBuilder {
    this.user.lastLogin = typeof date === 'string' ? date : date.toISOString();
    return this;
  }

  withoutLastLogin(): UserBuilder {
    delete this.user.lastLogin;
    return this;
  }

  // Role presets
  asAdmin(): UserBuilder {
    return this.withRole(UserRole.ADMIN);
  }

  asQAEngineer(): UserBuilder {
    return this.withRole(UserRole.QA_ENGINEER);
  }

  asDeveloper(): UserBuilder {
    return this.withRole(UserRole.DEVELOPER);
  }

  asViewer(): UserBuilder {
    return this.withRole(UserRole.VIEWER);
  }

  // Specific user presets
  asTestUser(): UserBuilder {
    return this
      .withEmail('test@example.com')
      .withName('Test User')
      .withRole(UserRole.USER);
  }

  asAdminUser(): UserBuilder {
    return this
      .withEmail('admin@example.com')
      .withName('Admin User')
      .asAdmin();
  }

  build(): UserProfile {
    if (!this.user.id) {
      this.user.id = faker.string.uuid();
    }
    return this.user as UserProfile;
  }

  buildMany(count: number): UserProfile[] {
    const users: UserProfile[] = [];
    const roles = Object.values(UserRole);
    
    for (let i = 0; i < count; i++) {
      const builder = new UserBuilder();
      // Distribute roles
      builder.withRole(roles[i % roles.length]);
      users.push(builder.build());
    }
    return users;
  }
}

export class AdminUserBuilder extends UserBuilder {
  protected adminUser: Partial<AdminUser>;

  constructor() {
    super();
    this.adminUser = {
      ...this.user,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      twoFactorEnabled: false,
      loginAttempts: 0,
      lastPasswordChange: faker.date.past().toISOString(),
      sessions: []
    } as Partial<AdminUser>;
    this.user = this.adminUser;
  }

  withStatus(status: UserStatus): AdminUserBuilder {
    this.adminUser.status = status;
    return this;
  }

  withEmailVerified(verified: boolean): AdminUserBuilder {
    this.adminUser.emailVerified = verified;
    return this;
  }

  withTwoFactorEnabled(enabled: boolean): AdminUserBuilder {
    this.adminUser.twoFactorEnabled = enabled;
    return this;
  }

  withLoginAttempts(attempts: number): AdminUserBuilder {
    this.adminUser.loginAttempts = attempts;
    return this;
  }

  withLastPasswordChange(date: Date | string): AdminUserBuilder {
    this.adminUser.lastPasswordChange = typeof date === 'string' ? date : date.toISOString();
    return this;
  }

  withSessions(sessions: AdminUser['sessions']): AdminUserBuilder {
    this.adminUser.sessions = sessions;
    return this;
  }

  withActiveSessions(count: number): AdminUserBuilder {
    const sessions: AdminUser['sessions'] = [];
    for (let i = 0; i < count; i++) {
      sessions.push({
        id: faker.string.uuid(),
        device: faker.helpers.arrayElement(['Chrome on Windows', 'Safari on macOS', 'Firefox on Linux']),
        browser: faker.helpers.arrayElement(['Chrome', 'Safari', 'Firefox', 'Edge']),
        ip: faker.internet.ip(),
        location: faker.location.city() + ', ' + faker.location.country(),
        createdAt: faker.date.recent().toISOString(),
        lastActivity: faker.date.recent().toISOString(),
        active: true
      });
    }
    this.adminUser.sessions = sessions;
    return this;
  }

  withApiKeys(count: number): AdminUserBuilder {
    const apiKeys: AdminUser['apiKeys'] = [];
    for (let i = 0; i < count; i++) {
      apiKeys.push({
        id: faker.string.uuid(),
        name: `API Key ${i + 1}`,
        key: faker.string.alphanumeric(32),
        permissions: ['api.read', 'api.write'],
        createdAt: faker.date.past().toISOString(),
        lastUsed: faker.date.recent().toISOString(),
        expiresAt: faker.date.future().toISOString(),
        active: true
      });
    }
    this.adminUser.apiKeys = apiKeys;
    return this;
  }

  // Status presets
  asActive(): AdminUserBuilder {
    return this.withStatus(UserStatus.ACTIVE).withEmailVerified(true);
  }

  asSuspended(): AdminUserBuilder {
    return this.withStatus(UserStatus.SUSPENDED).withLoginAttempts(5);
  }

  asPending(): AdminUserBuilder {
    return this.withStatus(UserStatus.PENDING).withEmailVerified(false);
  }

  asSecure(): AdminUserBuilder {
    return this
      .withTwoFactorEnabled(true)
      .withLastPasswordChange(faker.date.recent())
      .withLoginAttempts(0);
  }

  build(): AdminUser {
    if (!this.adminUser.id) {
      this.adminUser.id = faker.string.uuid();
    }
    return this.adminUser as AdminUser;
  }
}

// Factory functions
export function aUser(): UserBuilder {
  return new UserBuilder();
}

export function anAdminUser(): AdminUserBuilder {
  return new AdminUserBuilder();
}

// Pre-configured factories
export const UserFactory = {
  // Regular users
  user: () => aUser().build(),
  admin: () => aUser().asAdmin().build(),
  qaEngineer: () => aUser().asQAEngineer().build(),
  developer: () => aUser().asDeveloper().build(),
  viewer: () => aUser().asViewer().build(),
  
  // Admin app users
  activeAdmin: () => anAdminUser().asAdmin().asActive().withActiveSessions(2).build(),
  suspendedUser: () => anAdminUser().asSuspended().build(),
  pendingUser: () => anAdminUser().asPending().build(),
  secureUser: () => anAdminUser().asSecure().withApiKeys(2).build(),
  
  // Multiple users
  team: (size = 5) => {
    return [
      aUser().asAdmin().build(),
      aUser().asQAEngineer().build(),
      aUser().asQAEngineer().build(),
      aUser().asDeveloper().build(),
      aUser().asViewer().build()
    ].slice(0, size);
  },
  
  // Users with specific attributes
  withRole: (role: UserRole, count = 1) => {
    const users: UserProfile[] = [];
    for (let i = 0; i < count; i++) {
      users.push(aUser().withRole(role).build());
    }
    return count === 1 ? users[0] : users;
  }
};