import React from 'react';

const Contact = () => {
  return (
    <div className="main-container">
      <section className="info-section">
        <p>We value your feedback and inquiries. Please fill out the form and our team will get back to you as soon as possible. If you have any questions about our products or services, do not hesitate to contact us.</p>
      </section>
      <div className="contact-form-container">
        <h2>Contact Us</h2>
        <form action="mailto:orders@arcadianoutfitters.com" method="post" enctype="text/plain">
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" placeholder="Your name" required />
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" placeholder="Your email" required />
          <label htmlFor="message">Message:</label>
          <textarea id="message" name="message" rows="4" placeholder="Your message" required></textarea>
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
