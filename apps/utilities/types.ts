export interface User {
  id: string;
  username: string;
  hashedPassword: string;
}

export interface Task {
  id: string;
  taskName: string;
  startTime: string;
  endTime: string;
}
