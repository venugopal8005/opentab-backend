import { User } from "../../index.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../services/token.service.js";

// Register
export const register = async (req, res) => {
  try {
    console.log("register called");
    const { email, password, displayName } = req.body;

    // 1. Validate input
    if (!email || !password || !displayName) {
      return res
        .status(400)
        .json({ message: "Email , password or Display name required" });
    }

    // 2. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 3. Create user (password hashes automatically)
    const user = await User.create({ email, password, displayName });

    // 4. Issue token
    const token = generateToken({
      id: user._id,
      name: user.displayName,
      email: user.email,
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      // httpOnly: true,
      // sameSite: "lax",
      // secure: false,
      // maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
    });

    console.log("Registered user:", user.email);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
    console.log(err);
  }
};

//LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Success
    const token = generateToken({
      id: user._id,
      name: user.displayName,
      email: user.email,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      // httpOnly: true,
      // sameSite: "lax",
      // secure: false,
      // maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "Login successful",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

//ME
// Refresh or Auth varification
export const me = (req, res) => {
  res.json({
    user: req.user,
  });
};

//LOGOUT
export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out" });
};

//Refresh Token
export const refresh = (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const newToken = generateToken({ id: decoded.id });

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      // httpOnly: true,
      // sameSite: "lax",
      // secure: false,
      // maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Token refreshed" });
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
