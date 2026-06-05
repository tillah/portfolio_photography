import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, eventType, date, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: "Tehillah Photography <onboarding@resend.dev>",
      to: "tehillahmuchato@gmail.com",
      replyTo: email,
      subject: `New enquiry from ${name}${eventType ? ` — ${eventType}` : ""}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1C2A5A;">
          <h2 style="border-bottom: 1px solid #E2D9C8; padding-bottom: 12px; margin-bottom: 24px;">
            New Booking Enquiry
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #A85232; width: 160px;">Name</td>
              <td style="padding: 8px 0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #A85232;">Email</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #1C2A5A;">${email}</a></td>
            </tr>
            ${eventType ? `
            <tr>
              <td style="padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #A85232;">Session Type</td>
              <td style="padding: 8px 0;">${eventType}</td>
            </tr>` : ""}
            ${date ? `
            <tr>
              <td style="padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #A85232;">Date</td>
              <td style="padding: 8px 0;">${date}</td>
            </tr>` : ""}
          </table>
          <div style="margin-top: 24px; padding: 20px; background: #F5F1E8; border-left: 3px solid #A85232;">
            <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #A85232; margin: 0 0 10px;">Message</p>
            <p style="margin: 0; line-height: 1.7; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin-top: 32px; font-size: 12px; color: #B8A898;">
            Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
