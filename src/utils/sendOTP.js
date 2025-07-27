import { Resend } from 'resend';

export const sendOTP = async (email, otp) => {
  const resend = new Resend(process.env.RESEND_API_KEY); 
  await resend.emails.send({
    from: 'Your App <onboarding@resend.dev>',
    to: email,
    subject: 'Your OTP Code',
    html: `<strong>Your OTP is: ${otp}</strong>`,
  });
};
