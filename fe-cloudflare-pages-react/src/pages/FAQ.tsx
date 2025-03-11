import React from "react";
import { Link } from "react-router-dom"; // Ensure you're using React Router
import "../styles/FAQ.css";

const faqs = [
  {
    question: "What is SmarterPicks?",
    answer: "SmarterPicks is a platform that helps users discover and purchase the best Amazon products through carefully curated recommendations."
  },
  {
    question: "What are rewards?",
    answer: "SmarterPicks has partnered with various Amazon sellers to offer you a chance to get products for free!"
  },
  {
    question: "How do rewards work?",
    answer: "You can find eligible products in the Rewards section. Browse through, choose a product you like, and purchase it from Amazon using the provided link. Once your product is delivered, leave a 5-star review, and we will refund your money!"
  },
  {
    question: "Is this a scam?",
    answer: "Of course not! We work directly with Amazon sellers to help them promote their businesses. Instead of spending huge amounts on advertisements, sellers pay you for an organic review of their products, which is much more effective!"
  },
  {
    question: "What guarantee do I have about these rewards?",
    answer: "SmarterPicks acts as the liaison between you and the seller. While the seller directly refunds your money, we ensure everything goes smoothly. In the highly unlikely event that a seller refuses to refund you, you can always return the product since it's protected by Amazon’s return policy!"
  },
  {
    question: "How do I receive my reward money?",
    answer: "We refund you via PayPal. You need a PayPal account that can accept payments. (It's easy to set up!)"
  },
  {
    question: "Do I have to provide my card information?",
    answer: "Nope! SmarterPicks is only a product catalog, and all links will direct you to the official Amazon website. You will be ordering products directly from Amazon!"
  },
  {
    question: "What is a Reward Request?",
    answer: (
      <>A Reward Request helps us track your rewards. After purchasing a reward product from Amazon, return to SmarterPicks and create a Reward Request in <Link to="/my-rewards">My Rewards</Link> section. You’ll need to upload a screenshot of your Amazon order confirmation. Once submitted, our team will validate and approve it. After your review is live, upload a screenshot of your review to the Reward Request. We’ll verify it and ensure you receive your refund!
      </>
    )
  },
  {
    question: "Sounds great! How do I get started?",
    answer: (
      <>
        Awesome! First, go to the <Link to="/rewards">Rewards</Link> section and create an account. You can sign up easily with Google or Facebook, or use your email and password. Then, browse through the reward products and place an order. Once done, create a Reward Request so we know you’ve ordered the items!
      </>
    )
  }
];

const FAQ: React.FC = () => {
  return (
    <div className="faq-container">
      <h1>Frequently Asked Questions</h1>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <div className="faq-question">{faq.question}</div>
            <div className="faq-answer">{faq.answer}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
