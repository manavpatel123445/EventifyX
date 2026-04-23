import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
      unique: true, 
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, 
    },
    phone: {
      type: String,
      match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number"],
    },
    dateOfBirth: {
      type: Date,
    },
    profileImage: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["user", "event_manager", "admin"],
      default: "user",
    },
    managedEvents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event"
    }],
    becameManagerAt: {
      type: Date
    },
    // Events this user manages (if they are event_manager)
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  { timestamps: true }
);

// 🔑 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // only hash if changed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔑 Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate random bytes
  const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = bcrypt.hashSync(resetToken, 10);
  
  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

// Export model
export default mongoose.model("User", userSchema);
