import User from "../model/user.model.js";
import OTP from "../model/otp.model.js";
import Recovery from "../model/recovery.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateOTP } from "../otp/generateOTP.js";
import { sendEmail } from "../utils/sendEmail.js";
import dotenv from "dotenv";
import { verifyToken } from "../utils/verifyUser.js";

dotenv.config();

function generateRecoveryPhrase(words) {
  return Array.from(
    { length: 12 },
    () => words[Math.floor(Math.random() * words.length)]
  ).join(" ");
}

const hashData = async (data, saltRounds = 10) => {
  try {
    const hashedData = await bcryptjs.hash(data, saltRounds);
    return hashedData;
  } catch (error) {
    throw error;
  }
};

const verifyHashedData = async (unhashed, hashed, next) => {
  try {
    const match = await bcryptjs.compare(unhashed, hashed);
    return match;
  } catch (error) {
    throw error;
  }
};

export const signup = async (req, res, next) => {
  const { fullname, email, password, phoneNumber } = req.body;

  if (
    !fullname ||
    !email ||
    !password ||
    !phoneNumber ||
    fullname === "" ||
    email === "" ||
    password === "" ||
    phoneNumber === ""
  ) {
    next(new Error(400, "All fields must be filled out"));
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  const newUser = new User({
    fullname,
    email,
    password: hashedPassword,
    phoneNumber,
  });

  try {
    await newUser.save();
    res.json("Signup successful");
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password || email === "" || password === "") {
    next(Error(400, "Email and Password are required"));
  }
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(Error(404, "User not found"));
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(Error(400, "Invalid Password"));
    }
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validUser._doc;
    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password, ...rest } = user._doc;
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(rest);
    } else {
      const generatePassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatePassword, 10);
      const newUser = new User({
        fullname,
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password, ...rest } = newUser._doc;
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const sendOTP = async (req, res, next) => {
  const { email, message, subject, duration } = req.body;

  try {
    if (!(email && subject && message)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Provide values for email, subject, and message",
        });
    }
    await OTP.deleteOne({ email });
    const generatedOTP = await generateOTP();

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject,
      html: `<p>${message}</p><p style="color:red;font-size:25px;letter-spacing:2px;"><b>${generatedOTP}</b></p><p>This Code <b>expires in ${duration} hour(s)</b> </p>`,
    };

    await sendEmail(mailOptions);

    const hashedOTP = await hashData(generatedOTP);
    const newOTP = new OTP({
      email,
      otp: hashedOTP,
      expireAt: Date.now() + 360000 * +duration,
      createdAt: Date.now(),
    });

    const createdOTPRecord = await newOTP.save();
    // Send back the created OTP record as the response
    return res.status(200).json({ success: true, otpRecord: createdOTPRecord });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    if (!(email && otp)) {
      return next(Error(404, "Provide values for email and otp"));
    }
    const matchedOTPRecord = await OTP.findOne({ email });
    if (!matchedOTPRecord) {
      return next(Error(404, "Record not found"));
    }

    const { expireAt } = matchedOTPRecord;
    if (expireAt < Date.now()) {
      await OTP.deleteOne({ email });
      return next(Error(404, "Code has expired. Request for new"));
    }

    const hashedOTP = matchedOTPRecord.otp;
    const validOTP = await verifyHashedData(otp, hashedOTP);
    if (!validOTP) {
      return next(Error(404, "Invalid OTP"));
    }

    await OTP.deleteOne({ email });

    return res
      .status(200)
      .json({ success: true, message: "OTP verification successful" });
  } catch (error) {
    next(error);
  }
};
export const deleteOTP = async (req, res, next) => {
  const { email } = req.body;
  try {
    await OTP.deleteOne({ email });
  } catch (error) {
    next(error);
  }
};

export const recoveryPhrase = async (req, res, next) => {
  try {
    // Verify user token
    verifyToken(req, res, () => {});

    const userId = req.user.id;
    const { phrase } = req.body;

    if (!userId) {
      return next(errorHandler(404, "User not found"));
    }

    let existingRecovery = await Recovery.findOne({ userId });

    if (existingRecovery) {
      existingRecovery.phrase = phrase;
      await existingRecovery.save();
      return res
        .status(200)
        .json({
          success: true,
          message: "Recovery phrase updated successfully",
        });
    } else {
      const newRecovery = new Recovery({ userId, phrase });
      await newRecovery.save();
      return res
        .status(200)
        .json({ success: true, message: "Recovery phrase set successfully" });
    }
  } catch (error) {
    next(error);
  }
};

export const getRecoveryPhrase = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if userId is provided
    if (!userId) {
      return next(Error(400, "User ID is required"));
    }

    // Find the recovery phrase for the provided userId
    const recovery = await Recovery.findOne({ userId });

    // If recovery phrase not found
    if (!recovery) {
      return next(
        Error(404, "Recovery phrase not found for the provided user ID")
      );
    }

    // Return the recovery phrase
    return res.status(200).json({ recoveryPhrase: recovery.phrase });
  } catch (error) {
    next(error);
  }
};
