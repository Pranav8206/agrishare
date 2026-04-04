import { AlertCircle, CheckCircle, MessageCircle, Star, Trash2 } from "lucide-react";
import Link from "next/link";

export default function ReviewsSection({
  orderedReviews,
  averageRating,
  renderRatingStars,
  authReady,
  loadingMyReviews,
  isAuthenticated,
  isEquipmentOwner,
  myReviewForThisEquipment,
  onLogin,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  submittingReview,
  onCreateReview,
  loadingReviews,
  currentUserId,
  formatDateTime,
  deletingReviewId,
  onDeleteReview,
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Equipment Reviews</h3>
          <p className="mt-1 text-sm text-gray-500">
            {orderedReviews.length
              ? `${averageRating.toFixed(1)} ★ average from ${orderedReviews.length} review${orderedReviews.length > 1 ? "s" : ""}`
              : "No ratings yet"}
          </p>
        </div>
        {orderedReviews.length > 0 && (
          <div className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5">
            {renderRatingStars(averageRating)}
            <span className="ml-1 text-sm font-medium text-gray-700">{averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h4 className="mb-3 text-base font-semibold text-gray-900">Write a Review</h4>

        {!authReady || loadingMyReviews ? (
          <p className="text-sm text-gray-500">Preparing review section...</p>
        ) : !isAuthenticated ? (
          <div className="py-4 text-center">
            <p className="mb-2 text-sm text-gray-500">Please log in to submit a review.</p>
            <button
              onClick={onLogin}
              className="text-sm font-medium text-green-600 hover:text-green-700"
            >
              Log in here →
            </button>
          </div>
        ) : isEquipmentOwner ? (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <AlertCircle size={16} />
            Owner cannot review own equipment.
          </div>
        ) : myReviewForThisEquipment ? (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle size={16} />
            You have already reviewed this equipment. Your review is shown first.
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`rounded-lg p-2 transition-all ${
                      reviewRating >= value
                        ? "text-yellow-500 hover:text-yellow-600"
                        : "text-gray-300 hover:text-gray-400"
                    }`}
                    onClick={() => setReviewRating(value)}
                    disabled={submittingReview}
                  >
                    <Star
                      size={28}
                      fill={reviewRating >= value ? "currentColor" : "none"}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-500">
                  {reviewRating === 1 && "Poor"}
                  {reviewRating === 2 && "Fair"}
                  {reviewRating === 3 && "Good"}
                  {reviewRating === 4 && "Very Good"}
                  {reviewRating === 5 && "Excellent"}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Your Review</label>
              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Share your experience with this equipment..."
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                disabled={submittingReview}
              />
              <div className="mt-1 text-right text-xs text-gray-400">
                {reviewComment.length}/1000 characters
              </div>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              onClick={onCreateReview}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <MessageCircle size={18} />
                  Submit Review
                </>
              )}
            </button>
          </>
        )}
      </div>

      {loadingReviews ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="mb-2 h-4 w-1/4 rounded bg-gray-200"></div>
                  <div className="mb-3 h-3 w-1/3 rounded bg-gray-200"></div>
                  <div className="h-16 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orderedReviews.length === 0 ? (
        <div className="py-8 text-center">
          <div className="mb-2 text-gray-400">
            <Star size={48} className="mx-auto opacity-50" />
          </div>
          <p className="text-gray-500">No reviews for this equipment yet.</p>
          <p className="mt-1 text-sm text-gray-400">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orderedReviews.map((review) => {
            const reviewerName =
              review?.user?.fullName ||
              review?.user?.name ||
              review?.user?.email ||
              "Anonymous User";
            const reviewUserId = review?.user?._id || review?.user;
            const reviewerProfileHref = reviewUserId
              ? `/id/${String(reviewUserId)}`
              : "";
            const isReviewAuthor =
              Boolean(currentUserId) && String(reviewUserId) === String(currentUserId);
            const profilePic = review?.user?.profilePic;
            const firstLetter = reviewerName.charAt(0).toUpperCase();

            return (
              <article
                key={review?._id || `${reviewerName}-${review?.createdAt}`}
                className={`rounded-xl border p-4 transition hover:shadow-sm ${
                  isReviewAuthor
                    ? "border-green-200 bg-green-50/30"
                    : "border-gray-100 bg-white"
                }`}
              >
                <div className="flex gap-3">
                  <div className="shrink-0">
                    {profilePic ? (
                      reviewerProfileHref ? (
                        <Link href={reviewerProfileHref} aria-label={`View ${reviewerName} profile`}>
                          <img
                            src={profilePic}
                            alt={reviewerName}
                            className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                          />
                        </Link>
                      ) : (
                        <img
                          src={profilePic}
                          alt={reviewerName}
                          className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                        />
                      )
                    ) : (
                      reviewerProfileHref ? (
                        <Link
                          href={reviewerProfileHref}
                          aria-label={`View ${reviewerName} profile`}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-green-500 to-green-600 text-sm font-semibold text-white"
                        >
                          {firstLetter}
                        </Link>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-green-500 to-green-600 text-sm font-semibold text-white">
                          {firstLetter}
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-gray-900">{reviewerName}</p>
                          {isReviewAuthor && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              <CheckCircle size={10} />
                              Your Review
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={
                                star <= (review?.rating || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-400">
                          {formatDateTime(review?.createdAt, "Date unavailable")}
                        </p>
                        {isReviewAuthor && (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => onDeleteReview(review?._id, isReviewAuthor)}
                            disabled={
                              deletingReviewId === String(review?._id) ||
                              submittingReview
                            }
                          >
                            <Trash2 size={12} />
                            {deletingReviewId === String(review?._id)
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-gray-700">
                      {review?.comment || "No written comment provided."}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
