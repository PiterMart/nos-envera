import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      fullName, 
      email, 
      phone, 
      country, 
      city, 
      message, 
      artworkTitle, 
      artistName 
    } = body;

    // Validate required fields
    if (!fullName || !email || !country || !city || !artworkTitle || !artistName) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create transporter (you'll need to configure this with your email service)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || "hxgn.tech@gmail.com",
        pass: process.env.SMTP_PASS || "muvo zbng pgaz fliu"
      },
    });

    // Email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
          New Artwork Acquisition Inquiry
        </h2>
        
        <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #000; margin-top: 0;">Artwork Details</h3>
          <p><strong>Title:</strong> ${artworkTitle}</p>
          <p><strong>Artist:</strong> ${artistName}</p>
        </div>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h3 style="color: #000; margin-top: 0;">Buyer Information</h3>
          <p><strong>Full Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <p><strong>Location:</strong> ${city}, ${country}</p>
          ${message ? `
            <div style="margin-top: 15px;">
              <strong>Message:</strong>
              <div style="background-color: #f5f5f5; padding: 10px; margin-top: 5px; border-radius: 3px;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
          ` : ''}
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #e8f4f8; border-radius: 5px;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            This inquiry was submitted through the ARTWINGS website acquisition form.
          </p>
        </div>
      </div>
    `;

    const emailText = `
New Artwork Acquisition Inquiry

Artwork Details:
- Title: ${artworkTitle}
- Artist: ${artistName}

Buyer Information:
- Full Name: ${fullName}
- Email: ${email}
${phone ? `- Phone: ${phone}` : ''}
- Location: ${city}, ${country}
${message ? `- Message: ${message}` : ''}

This inquiry was submitted through the ARTWINGS website acquisition form.
    `;

    // Email options - send to multiple recipients
    const clientEmails = [
      process.env.CLIENT_EMAIL || "pitermartingaste@gmail.com",
      "Info@artwings.art"
    ].filter(email => email); // Remove any empty/undefined emails

    const mailOptions = {
      from: process.env.SMTP_USER || "hxgn.tech@gmail.com",
      to: clientEmails.join(', '), // Join multiple emails with comma
      subject: `New Acquisition Inquiry: "${artworkTitle}" by ${artistName}`,
      text: emailText,
      html: emailHtml,
      replyTo: email, // Allow direct reply to the buyer
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return Response.json(
      { message: 'Inquiry sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return Response.json(
      { error: 'Failed to send inquiry' },
      { status: 500 }
    );
  }
}
