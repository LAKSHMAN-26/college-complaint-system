import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import FileUpload from '../../components/FileUpload';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITY,
} from '../../utils/constants';
import {
  Send,
  ArrowLeft,
  AlertCircle,
  FileQuestion,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CreateComplaint = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Wi-Fi / Internet',
    location: '',
    priority: 'MEDIUM',
  });

  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      toast.error('Please fill all required fields: Title, Location, and Description');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('category', formData.category);
      data.append('location', formData.location.trim());
      data.append('priority', formData.priority);

      // Append files
      files.forEach((file) => {
        data.append('attachments', file);
      });

      const res = await complaintService.createComplaint(data);
      if (res.success && res.data) {
        toast.success(`Complaint filed successfully: ${res.data.complaint.complaintId}`);
        navigate(`/student/complaints/${res.data.complaint._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Submit a New Complaint
          </h1>
          <p className="text-xs text-slate-500">
            Provide comprehensive details and evidence to expedite campus resolution
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Complaint Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Complaint Subject / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Broken bench and projector flickering in LH-201"
              maxLength={150}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <span className="text-[10px] text-slate-400 mt-1 block text-right">
              {formData.title.length}/150 characters
            </span>
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              >
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Severity / Suggested Priority <span className="text-rose-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              >
                <option value="LOW">Low (Minor cosmetic issue / non-urgent)</option>
                <option value="MEDIUM">Medium (Normal daily issue / moderate impact)</option>
                <option value="HIGH">High (Major disruption / prevents learning)</option>
                <option value="CRITICAL">Critical (Immediate safety / severe hazard)</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Specific Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Boys Hostel Block B, 3rd Floor, Room 312 or CSE Lab 2"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what went wrong, since when, and any steps already attempted..."
              maxLength={3000}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
            />
            <span className="text-[10px] text-slate-400 mt-1 block text-right">
              {formData.description.length}/3000 characters
            </span>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Photos & Attachments (Optional, max 5 files)
            </label>
            <FileUpload files={files} setFiles={setFiles} maxFiles={5} maxSizeMB={5} />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              {submitting ? (
                <span>Submitting complaint...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateComplaint;
