import { Resend } from "resend";
import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const resend = new Resend(process.env.RESEND_API_KEY);

// Field limits
const MAX_NAME    = 100;
const MAX_EMAIL   = 254; // RFC 5321
const MAX_TYPE    = 100;
const MAX_DATE    = 50;
const MAX_MESSAGE = 2000;

/** Strip HTML tags and trim whitespace to prevent email injection / XSS in email clients */
function sanitize(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "")   // strip all HTML tags
    .replace(/&/g, "&amp;")    // encode remaining special chars
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim()
    .slice(0, maxLen);
}

export async function POST(req: Request) {
  // Rate limit: 3 submissions per hour per IP
  const ip = getClientIp(req);
  const rl = rateLimit("contact", ip, 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await req.json();

    // Sanitize all inputs
    const name      = sanitize(body.name,      MAX_NAME);
    const email     = sanitize(body.email,     MAX_EMAIL);
    const eventType = sanitize(body.eventType, MAX_TYPE);
    const date      = sanitize(body.date,      MAX_DATE);
    const message   = sanitize(body.message,   MAX_MESSAGE);

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    await resend.emails.send({
      from: "Tehillah Photography <onboarding@resend.dev>",
      to: "mrmuchato@gmail.com",
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
    // Log internally — do NOT expose error details to the client
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
