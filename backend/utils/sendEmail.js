import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const { data, error } = await resend.emails.send({
    from: "HabitMind <onboarding@resend.dev>",
    to: [email],
    subject: "Reset your HabitMind password",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 40px auto;
        padding: 24px;
        color: #222;
      ">
        <h2>Reset your HabitMind password</h2>

        <p>
          We received a request to reset your HabitMind password.
        </p>

        <p>
          Click the button below to choose a new password.
        </p>

        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            padding: 12px 20px;
            background: #f59e0b;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
          "
        >
          Reset Password
        </a>

        <p style="margin-top: 24px; color: #666;">
          This link will expire in 15 minutes.
        </p>

        <p style="color: #888; font-size: 13px;">
          If you didn't request a password reset, you can safely ignore
          this email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error("Failed to send password reset email");
  }

  return data;
};
