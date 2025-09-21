import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const Star = ({ filled, onClick, size = 22 }) => (
  <button type="button" onClick={onClick} className="focus:outline-none">
    <svg width={size} height={size} viewBox="0 0 24 24" className={filled ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300'}>
      <path stroke="currentColor" strokeWidth="1.5" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  </button>
);

const RatingStars = ({ value = 0, onChange }) => (
  <div className="flex items-center gap-1">
    {[1,2,3,4,5].map(n => (
      <Star key={n} filled={n <= value} onClick={() => onChange(n)} />
    ))}
  </div>
);

const ReviewItem = ({ r }) => (
  <div className="border rounded-lg p-4 bg-white shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-800">{r.reviewerName || 'Reviewer'}</span>
      <div className="flex items-center">
        <RatingStars value={r.rating} onChange={() => {}} />
      </div>
    </div>
    {r.comment && <p className="mt-2 text-sm text-gray-600">{r.comment}</p>}
    <p className="mt-2 text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</p>
  </div>
);

const ReviewPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // form
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2200);
  };

  const avgStars = useMemo(() => Math.round(project?.avgRating || 0), [project]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      let pRes, rRes;
      try {
        pRes = await axios.get(`http://localhost:5000/api/projects/${id}/detail`);
      } catch (_) {
        pRes = await axios.get(`/api/projects/${id}/detail`);
      }
      try {
        rRes = await axios.get(`http://localhost:5000/api/projects/${id}/reviews`);
      } catch (_) {
        rRes = await axios.get(`/api/projects/${id}/reviews`);
      }
      setProject(pRes.data?.data || null);
      setReviews(rRes.data?.data || []);
      setErr('');
    } catch (e) {
      console.error(e);
      setErr('Failed to load project or reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      showToast('error', 'Please select a rating (1-5)');
      return;
    }
    setSubmitting(true);
    try {
      try {
        await axios.post(`http://localhost:5000/api/projects/${id}/reviews`, { rating, comment });
      } catch (_) {
        await axios.post(`/api/projects/${id}/reviews`, { rating, comment });
      }
      setRating(0);
      setComment('');
      showToast('success', 'Review submitted');
      await fetchAll();
    } catch (e) {
      console.error(e);
      showToast('error', 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto p-6">Loading...</div>;
  }
  if (err) {
    return <div className="max-w-5xl mx-auto p-6 text-red-600">{err}</div>;
  }
  if (!project) {
    return <div className="max-w-5xl mx-auto p-6">Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow border ${toast.type==='error'?'bg-red-50 border-red-200 text-red-700':'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.title || project.projectName}</h1>
              {project.domain && <p className="text-sm text-gray-600 mt-1">Domain: {project.domain}</p>}
              {project.deadline && <p className="text-sm text-gray-600">Deadline: {new Date(project.deadline).toLocaleDateString()}</p>}
              {(project.mentorName || project.mentorEmail) && (
                <p className="text-sm text-gray-700 mt-1">Mentor: <span className="font-medium">{project.mentorName}</span> {project.mentorEmail && `(${project.mentorEmail})`}</p>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} filled={n <= avgStars} size={20} />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Avg Rating: {project.avgRating?.toFixed?.(2) || 0} ({project.ratingsCount || 0})</p>
            </div>
          </div>
          {project.description && <p className="mt-4 text-gray-800">{project.description}</p>}

          {Array.isArray(project.teamMembers) && project.teamMembers.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium text-gray-700 mb-2">Team Members</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {project.teamMembers.map((tm, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    <span className="font-medium">{tm.name || 'Member'}</span>{tm.role ? ` - ${tm.role}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {reviews.length === 0 ? (
              <p className="text-gray-600">No reviews yet. Be the first to review.</p>
            ) : (
              reviews.map(r => <ReviewItem key={r._id} r={r} />)
            )}
          </div>

          <div className="bg-white rounded-2xl shadow p-5 h-fit">
            <h3 className="text-lg font-semibold mb-3">Leave a Review</h3>
            <form onSubmit={submitReview} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Your Rating *</label>
                <RatingStars value={rating} onChange={setRating} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comment (optional)</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Share your thoughts..."
                />
              </div>
              <button type="submit" disabled={submitting} className="w-full py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
