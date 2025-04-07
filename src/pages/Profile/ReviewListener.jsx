import React from "react";

const ReviewListener = ({ reviewData }) => {
  const { id, reviewMessage, replyMessage, star, listenerName } = reviewData;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-2xl ${i <= rating ? "text-yellow-400" : "text-gray-300"}`}
        >
          ★
        </span>,
      );
    }
    return stars;
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-gray-50 p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-semibold text-gray-800">
        Review Details
      </h2>
      <div className="rounded-md border border-gray-200 bg-white p-4">
        <p className="mb-2 text-lg">
          <strong className="text-gray-700">Review ID:</strong>{" "}
          <span className="text-gray-600">{id}</span>
        </p>
        <p className="mb-2 text-lg">
          <strong className="text-gray-700">Listener Name:</strong>{" "}
          <span className="text-gray-600">{listenerName}</span>
        </p>
        <p className="mb-2 text-lg">
          <strong className="text-gray-700">Review Message:</strong>{" "}
          <span className="text-gray-600">{reviewMessage}</span>
        </p>
        <p className="mb-2 text-lg">
          <strong className="text-gray-700">Reply Message:</strong>{" "}
          <span className="text-gray-600">{replyMessage}</span>
        </p>
        <p className="mb-2 text-lg">
          <strong className="text-gray-700">Rating:</strong>{" "}
          <span className="ml-2">{renderStars(star)}</span>
        </p>
      </div>
    </div>
  );
};

ReviewListener.defaultProps = {
  reviewData: {
    id: "N/A",
    reviewMessage: "No review message",
    replyMessage: "No reply yet",
    star: 0,
    listenerName: "Anonymous",
  },
};

export default ReviewListener;
