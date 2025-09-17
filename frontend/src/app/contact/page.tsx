"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send, CheckCircle, AlertCircle } from "lucide-react";
import { contactApi } from "@/lib/api";
import { toast } from "react-hot-toast";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await contactApi.submitContact(formData);
      setIsSubmitted(true);
      toast.success("Message sent successfully! We&apos;ll get back to you soon.");
    } catch (error: unknown) {
      console.error("Contact submission error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send message. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      category: "general",
    });
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-base-100">
        {/* Header */}
        <div className="bg-primary text-primary-content py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/"
                className="btn btn-ghost btn-sm text-primary-content hover:bg-primary-focus"
              >
                <ArrowLeft size={20} />
                Back to Home
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle size={48} className="text-primary-content" />
              <div>
                <h1 className="text-4xl font-bold mb-2">Message Sent!</h1>
                <p className="text-lg opacity-90">
                  Thank you for contacting us
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Content */}
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="text-center">
            <div className="bg-success/10 border border-success/20 rounded-lg p-8 mb-8">
              <CheckCircle size={64} className="text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-success mb-4">
                Message Sent Successfully!
              </h2>
              <p className="text-base-content/80 leading-relaxed mb-6">
                Thank you for reaching out to us. We&apos;ve received your message
                and will get back to you as soon as possible.
              </p>
              <div className="bg-base-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Message Details:</h3>
                <p>
                  <strong>Subject:</strong> {formData.subject}
                </p>
                <p>
                  <strong>Category:</strong> {formData.category}
                </p>
                <p>
                  <strong>Submitted:</strong> {new Date().toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={resetForm} className="btn btn-primary gap-2">
                <Send size={20} />
                Send Another Message
              </button>
              <Link href="/" className="btn btn-outline gap-2">
                <ArrowLeft size={20} />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-primary text-primary-content py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/"
              className="btn btn-ghost btn-sm text-primary-content hover:bg-primary-focus"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Mail size={48} className="text-primary-content" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
              <p className="text-lg opacity-90">Get in touch with our team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-base-200 rounded-lg p-8 shadow-lg">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Send us a Message
            </h2>
            <p className="text-base-content/80 leading-relaxed">
              Have a question, suggestion, or need help? We&apos;d love to hear from
              you. Fill out the form below and we&apos;ll get back to you as soon as
              possible.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-base-content mb-2"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                maxLength={100}
                className="input input-bordered w-full"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-base-content mb-2"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="input input-bordered w-full"
                placeholder="Enter your email address"
              />
            </div>

            {/* Category Field */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-base-content mb-2"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="select select-bordered w-full"
              >
                <option value="general">General Inquiry</option>
                <option value="support">Technical Support</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="business">Business Inquiry</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Subject Field */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-base-content mb-2"
              >
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                maxLength={200}
                className="input input-bordered w-full"
                placeholder="Brief description of your inquiry"
              />
            </div>

            {/* Message Field */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-base-content mb-2"
              >
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                maxLength={2000}
                rows={6}
                className="textarea textarea-bordered w-full"
                placeholder="Please provide details about your inquiry, question, or feedback..."
              />
              <div className="text-xs text-base-content/60 mt-1">
                {formData.message.length}/2000 characters
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary gap-2 flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="loading loading-spinner loading-sm"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Message
                  </>
                )}
              </button>
              <Link href="/" className="btn btn-outline">
                Cancel
              </Link>
            </div>
          </form>

          {/* Additional Information */}
          <div className="mt-8 pt-6 border-t border-base-300">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Other Ways to Reach Us
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-base-100 rounded-lg p-4">
                <h4 className="font-medium mb-2">Email Support</h4>
                <p className="text-sm text-base-content/80">
                  For urgent matters, you can email us directly at{" "}
                  <a
                    href="mailto:contact@tripmaps.com"
                    className="link link-primary"
                  >
                    contact@tripmaps.com
                  </a>
                </p>
              </div>
              <div className="bg-base-100 rounded-lg p-4">
                <h4 className="font-medium mb-2">Response Time</h4>
                <p className="text-sm text-base-content/80">
                  We typically respond within 24-48 hours during business days.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-info/10 border border-info/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle
                size={20}
                className="text-info mt-0.5 flex-shrink-0"
              />
              <div>
                <h4 className="font-medium text-info mb-1">Privacy Notice</h4>
                <p className="text-sm text-base-content/80">
                  By submitting this form, you agree to our{" "}
                  <Link href="/privacy" className="link link-primary">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/terms" className="link link-primary">
                    Terms of Service
                  </Link>
                  . Your information will be used to respond to your inquiry and
                  improve our services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
