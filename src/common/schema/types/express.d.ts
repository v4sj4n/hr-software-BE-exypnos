// types/express/index.d.ts
import { User } from 'src/common/schema/user.schema';  // Import the User type

declare global {
  namespace Express {
    interface Request {
      user?: User;  // Define the user property in the Request object
    }
  }
}
