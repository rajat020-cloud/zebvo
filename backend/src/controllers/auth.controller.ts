import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const signToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'production_level_jwt_secret_zebvo_2026';
  return jwt.sign({ id, role }, secret, { expiresIn: '7d' });
};

export class AuthController {
  /**
   * Registers a new user session
   */
  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password, role } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide username, email, and password.' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username or email already registered.' });
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        role: role || 'admin'
      });

      await user.save();

      const token = signToken(user._id.toString(), user.role);

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Authenticats a user and returns a session JWT token
   */
  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Please provide username/email and password.' });
      }

      // Find user by username or email
      const user = await User.findOne({
        $or: [{ username }, { email: username.toLowerCase() }]
      });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      // Check password match
      const isMatch = await (user as any).comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const token = signToken(user._id.toString(), user.role);

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves profile of current active user
   */
  public async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized session.' });
      }

      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User profile not found.' });
      }

      return res.status(200).json({
        success: true,
        user
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
