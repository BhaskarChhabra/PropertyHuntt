import React from 'react';
import { motion } from 'framer-motion';
// --- ICONS ---
import {
  Search,
  MessageCircle,
  Sparkles, // Keep this for step 2
  CheckCircle2,
  Star,      // For Rating stat
  CheckCircle, // For Success Rate stat
  Clock,     // For Avg. Response stat
  ChevronRight // For the arrows
} from 'lucide-react';
// -------------
import './howItWorks.scss';

const stepsData = [
  {
    icon: Search,
    title: "Find Your Property",
    description: "Our intelligent search understands your lifestyle, not just keywords. Discover perfectly matched properties and investment gems, recommended just for you."
  },
  {
    icon: Sparkles, // Analyze with AI
    title: "Analyze with AI",
    description: "Don't just guess. Get a real-time AI Investment Report, fueled by live scraped market data. Instantly analyze price, risks, and opportunities before you even visit."
  },
  {
    icon: MessageCircle, // Connect Instantly
    title: "Connect Instantly",
    description: "Contact landlords with one click. Our Real-time Contextual Chat shows the exact property you're discussing, complete with online status and typing indicators."
  }
];

// Animation variants (No Change)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
    }
  }
};


function HowItWorks() {
  return (
    <section className="how-it-works-section">
      <div className="section-container"> {/* Added a container for centering */}

        {/* --- NEW HEADER SECTION --- */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          
          <h2 className="main-title">How It Works</h2>
          <div className="title-underline"></div> {/* Animated underline */}
          <div className="pre-title-pill">
            <Sparkles size={16} /> {/* Sparkle Icon */}
            <span>SIMPLE PROCESS</span>
            <Sparkles size={16} /> {/* Sparkle Icon */}
          </div>
          <p className="section-description">
            Finding your perfect property is easy with our <span>AI-powered</span> three-step process
          </p>
          <div className="stats-row">
            <div className="stat-item">
              <Star size={18} /> <span>4.9 Rating</span>
            </div>
            <div className="stat-item">
              <CheckCircle size={18} /> <span>99% Success Rate</span>
            </div>
            <div className="stat-item">
              <Clock size={18} /> <span>&lt; 24h Avg. Response</span>
            </div>
          </div>
        </motion.div>
        {/* --- END HEADER SECTION --- */}


        <motion.div
          className="steps-wrapper"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {stepsData.map((step, index) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={index}> {/* Use Fragment to add arrows */}
                <motion.div className="step-item" variants={itemVariants}>
                  {/* Visuals (Number + Icon) */}
                  <div className="step-visuals">
                    <div className="step-number-badge">
                      <span>{index + 1}</span>
                      <Sparkles className="sparkle-icon top" />
                      <Sparkles className="sparkle-icon bottom" />
                    </div>
                    <div className="step-icon-container">
                      <Icon className="step-icon" />
                    </div>
                  </div>
                  {/* Content (Text + Checkmark) */}
                  <div className="step-content">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    <div className="step-completed-badge">
                      <CheckCircle2 />
                    </div>
                  </div>
                </motion.div>

                {/* --- ADD ARROW (except after the last item) --- */}
                {index < stepsData.length - 1 && (
                  <motion.div className="step-arrow" variants={itemVariants}>
                    <ChevronRight size={32} />
                  </motion.div>
                )}
                {/* --- END ARROW --- */}
              </React.Fragment>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default HowItWorks;