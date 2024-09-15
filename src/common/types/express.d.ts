// src/types/express.d.ts
import { User } from 'src/common/schema/user.schema';  // Adjust path to your user schema

declare global {
  namespace Express {
    interface Request {
      user?: User;  // Add the user property to the Request interface
    }
  }
}
