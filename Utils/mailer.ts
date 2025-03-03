import nodemailer from 'nodemailer';



export const sendOTP = async (email: string, otp: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service (e.g., 'gmail', 'outlook', etc.)
    auth: {
      user: process.env.APP_EMAIL, // Your email address
      pass: process.env.APP_PASSWORD, // Your email password or app-specific password
    },
  });

  const mailOptions = {
    from: process.env.APP_EMAIL, 
    to: email, 
    subject: 'Your OTP Code', 
    text: `Your OTP code is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent to:', email);
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    throw new Error('Error sending OTP. Please try again later.');
  }
};
