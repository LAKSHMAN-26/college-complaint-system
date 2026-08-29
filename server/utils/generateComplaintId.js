const Complaint = require('../models/Complaint');

const generateComplaintId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `CMP-${currentYear}-`;

  // Find latest complaint created this year
  const latestComplaint = await Complaint.findOne({
    complaintId: new RegExp(`^${prefix}`),
  })
    .sort({ createdAt: -1 })
    .select('complaintId')
    .lean();

  let nextSequence = 1;

  if (latestComplaint && latestComplaint.complaintId) {
    const parts = latestComplaint.complaintId.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }
  }

  const paddedSequence = String(nextSequence).padStart(4, '0');
  return `${prefix}${paddedSequence}`;
};

module.exports = generateComplaintId;
