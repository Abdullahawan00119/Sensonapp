export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Owner' | 'General Manager' | 'Front Desk' | 'Engineer' | 'Security';
  propertyName: string;
  region?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    await sleep(1500); // 1.5s delay
    
    if (email === 'error@property.com') {
      throw new Error('Invalid email or password. Please verify your security credentials.');
    }
    
    if (!email.includes('@') || password.length < 6) {
      throw new Error('Authentication failed. Invalid email format or password too short.');
    }

    return {
      user: {
        id: 'usr_001',
        email,
        firstName: 'Alexander',
        lastName: 'Vanderbilt',
        role: 'General Manager',
        propertyName: 'Grand Palace Residences',
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-session-token',
    };
  },

  register: async (data: {
    email: string;
    firstName: string;
    lastName: string;
    role: User['role'];
    propertyName: string;
    region: string;
  }): Promise<AuthResponse> => {
    await sleep(2000); // 2s delay

    if (data.email === 'error@property.com') {
      throw new Error('This email is already associated with an active property.');
    }

    return {
      user: {
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        propertyName: data.propertyName,
        region: data.region,
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-session-token',
    };
  }
};
