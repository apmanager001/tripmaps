"use client";
import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { adminApi } from "@/lib/api";
import {
  Mail,
  Eye,
  EyeOff,
  Send,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

const AdminEmailComponent = () => {
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Get user statistics
  const { data: userStats } = useQuery({
    queryKey: ["adminUserStats"],
    queryFn: adminApi.getUserStats,
    enabled: true,
  });

  const userCount = userStats?.data?.verifiedUsers || 0;

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: adminApi.sendEmailToAllUsers,
    onSuccess: (data) => {
      toast.success(
        `Email sent successfully to ${data.data.successful} users!`
      );
      setSubject("");
      setHtmlContent("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send email");
    },
  });

  const handleSendEmail = async () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    if (!htmlContent.trim()) {
      toast.error("Please enter email content");
      return;
    }

    sendEmailMutation.mutate({
      subject: subject.trim(),
      htmlContent: htmlContent.trim(),
    });
  };

  const renderHtmlPreview = (html) => {
    if (!html) return "";
    return html;
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-6">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold">Send Email to All Users</h3>
          <div className="badge badge-primary badge-lg">
            <Users className="w-4 h-4 mr-1" />
            {userCount} users
          </div>
        </div>

        {/* Email Form */}
        <div className="space-y-4">
          {/* Subject */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Subject *</span>
            </label>
            <input
              type="text"
              placeholder="Enter email subject..."
              className="input input-bordered w-full"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
            />
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                {subject.length}/100 characters
              </span>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">
                <span className="label-text font-medium">
                  Email Content (HTML) *
                </span>
              </label>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="btn btn-sm btn-outline"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Show Preview
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Markdown Editor */}
              <div>
                <textarea
                  placeholder="Write your email content in HTML...

<h1 style='color: #1f2937; font-size: 2rem; margin-bottom: 1rem;'>Welcome to My Trip Maps!</h1>

<h2 style='color: #374151; font-size: 1.5rem; margin-bottom: 0.75rem;'>New Features</h2>
<ul style='margin-bottom: 1rem;'>
  <li><strong>Interactive maps</strong> with your photos</li>
  <li><strong>Share memories</strong> with friends and family</li>
  <li><strong>Discover new places</strong> from our community</li>
</ul>

<h2 style='color: #374151; font-size: 1.5rem; margin-bottom: 0.75rem;'>Upcoming Events</h2>
<table style='border-collapse: collapse; width: 100%; margin-bottom: 1rem;'>
  <tr style='background-color: #f3f4f6;'>
    <th style='border: 1px solid #d1d5db; padding: 0.5rem; text-align: left;'>Event</th>
    <th style='border: 1px solid #d1d5db; padding: 0.5rem; text-align: left;'>Date</th>
    <th style='border: 1px solid #d1d5db; padding: 0.5rem; text-align: left;'>Location</th>
  </tr>
  <tr>
    <td style='border: 1px solid #d1d5db; padding: 0.5rem;'>Map Workshop</td>
    <td style='border: 1px solid #d1d5db; padding: 0.5rem;'>Jan 15</td>
    <td style='border: 1px solid #d1d5db; padding: 0.5rem;'>Online</td>
  </tr>
  <tr>
    <td style='border: 1px solid #d1d5db; padding: 0.5rem;'>Community Meetup</td>
    <td style='border: 1px solid #d1d5db; padding: 0.5rem;'>Jan 22</td>
    <td style='border: 1px solid #d1d5db; padding: 0.5rem;'>City Center</td>
  </tr>
</table>

<blockquote style='border-left: 4px solid #3b82f6; padding-left: 1rem; font-style: italic; margin: 1rem 0;'>
  Join us for exciting new adventures!
</blockquote>

<a href='https://mytripmaps.com' style='color: #3b82f6; text-decoration: underline;'>Visit our website</a> to learn more!"
                  className="textarea textarea-bordered w-full h-64 font-mono text-sm"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                />
                <div className="label">
                  <span className="label-text-alt text-base-content/60">
                    Supports HTML formatting with inline styles
                  </span>
                </div>
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="border border-base-300 rounded-lg p-4 bg-base-50">
                  <div className="text-sm font-medium text-base-content/70 mb-2">
                    Preview:
                  </div>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: renderHtmlPreview(
                        htmlContent || "Enter content to see preview..."
                      ),
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* HTML Help */}
          <div className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-sm font-medium">
              HTML Formatting Help
            </div>
            <div className="collapse-content text-sm space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Headers:</strong>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>
                      <code>&lt;h1&gt;H1&lt;/h1&gt;</code> - Main heading
                    </li>
                    <li>
                      <code>&lt;h2&gt;H2&lt;/h2&gt;</code> - Sub heading
                    </li>
                    <li>
                      <code>&lt;h3&gt;H3&lt;/h3&gt;</code> - Section heading
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>Text Formatting:</strong>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>
                      <code>&lt;strong&gt;bold&lt;/strong&gt;</code> -{" "}
                      <strong>Bold text</strong>
                    </li>
                    <li>
                      <code>&lt;em&gt;italic&lt;/em&gt;</code> -{" "}
                      <em>Italic text</em>
                    </li>
                    <li>
                      <code>&lt;code&gt;code&lt;/code&gt;</code> -{" "}
                      <code className="bg-base-300 px-1 py-0.5 rounded">
                        Code
                      </code>
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>Links:</strong>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>
                      <code>&lt;a href="url"&gt;text&lt;/a&gt;</code> -{" "}
                      <a href="#" className="text-primary hover:underline">
                        Link
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <strong>Tables:</strong>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>
                      <code>
                        &lt;table&gt;&lt;tr&gt;&lt;th&gt;Header&lt;/th&gt;&lt;/tr&gt;&lt;/table&gt;
                      </code>
                    </li>
                    <li>
                      <code>
                        &lt;td style="border: 1px solid #ccc; padding:
                        8px;"&gt;Data&lt;/td&gt;
                      </code>
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>Lists:</strong>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>
                      <code>
                        &lt;ul&gt;&lt;li&gt;item&lt;/li&gt;&lt;/ul&gt;
                      </code>{" "}
                      - Bullet list
                    </li>
                    <li>
                      <code>
                        &lt;ol&gt;&lt;li&gt;item&lt;/li&gt;&lt;/ol&gt;
                      </code>{" "}
                      - Numbered list
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>Images:</strong>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>
                      <code>
                        &lt;img src="image.jpg" alt="description" width="100"
                        height="100" style="width: 100px; height: 100px;" /&gt;
                      </code>{" "}
                      - Image
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="alert alert-warning">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <strong>Important:</strong> This email will be sent to all
              registered users. Please ensure the content is appropriate and
              necessary.
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSendEmail}
              disabled={
                sendEmailMutation.isPending ||
                !subject.trim() ||
                !htmlContent.trim()
              }
              className="btn btn-primary btn-lg"
            >
              {sendEmailMutation.isPending ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send to {userCount} Users
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailComponent;
