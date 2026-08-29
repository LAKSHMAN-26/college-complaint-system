import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare, Paperclip, Lock, FileText, Image as ImageIcon } from 'lucide-react';
import { formatTimeAgo, getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const CommentSection = ({ complaintId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getComments(complaintId);
      if (res.success && res.data) {
        setComments(res.data.comments || []);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (complaintId) {
      fetchComments();
    }
  }, [complaintId]);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('message', message.trim());
      if (user.role !== 'STUDENT') {
        formData.append('isInternal', isInternal);
      }

      const res = await complaintService.addComment(complaintId, formData);
      if (res.success && res.data) {
        setComments([...comments, res.data.comment]);
        setMessage('');
        setIsInternal(false);
        toast.success('Comment posted');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleStyle = (role) => {
    if (role === 'ADMIN') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (role === 'STAFF') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-sm">
            Activity & Discussion ({comments.length})
          </h3>
        </div>
      </div>

      {/* Comment List */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-center py-6 text-xs text-slate-400">Loading conversation...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No comments yet. Start the conversation below.
          </div>
        ) : (
          comments.map((c) => {
            const isMe = c.user?._id === user?._id;
            return (
              <div
                key={c._id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  c.isInternal
                    ? 'bg-amber-50/70 border-amber-200'
                    : isMe
                    ? 'bg-indigo-50/50 border-indigo-100 ml-4'
                    : 'bg-slate-50 border-slate-200 mr-4'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center">
                      {getInitials(c.user?.name)}
                    </div>
                    <span className="font-bold text-xs text-slate-800">{c.user?.name}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold border ${getRoleStyle(
                        c.user?.role
                      )}`}
                    >
                      {c.user?.role}
                    </span>
                    {c.isInternal && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded">
                        <Lock className="w-2.5 h-2.5" /> Staff Internal Note
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">{formatTimeAgo(c.createdAt)}</span>
                </div>

                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {c.message}
                </p>

                {/* Comment Attachments */}
                {c.attachments && c.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-black/5">
                    {c.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline bg-white px-2 py-1 rounded border border-slate-200"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span>{att.filename || 'Attachment'}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendComment} className="space-y-2 pt-2 border-t border-slate-100">
        <div className="relative">
          <textarea
            rows="2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a comment or update for this complaint..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none pr-12"
          />
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="absolute right-2.5 bottom-3 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg transition-all shadow-sm shadow-indigo-500/30"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Internal note checkbox for Staff/Admin */}
        {user?.role !== 'STUDENT' && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              <span className="flex items-center gap-1 font-medium">
                <Lock className="w-3 h-3 text-amber-600" /> Mark as Internal Staff Note (Invisible to Student)
              </span>
            </label>
          </div>
        )}
      </form>
    </div>
  );
};

export default CommentSection;
