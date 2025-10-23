import React from 'react';
import { Users, Home, Star, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import './highlightsSection.scss';

// Data for the stat cards to keep the JSX clean
const statsData = [
  {
    icon: Users,
    value: "50K+",
    label: "Happy Customers",
    color: "blue"
  },
  {
    icon: Home,
    value: "25K+",
    label: "Properties Listed",
    color: "green"
  },
  {
    icon: Star,
    value: "4.9",
    label: "Average Rating",
    color: "orange"
  },
  {
    icon: ShieldCheck,
    value: "100%",
    label: "Verified Properties",
    color: "purple"
  }
];

// Animation variants for the container and items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100 }
  }
};

function HighlightsSection() {
  return (
    <div className="highlights-section-container">
      <motion.div 
        className="highlights-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} className="highlight-card" variants={itemVariants}>
              <div className={`highlight-icon-wrapper --${stat.color}`}>
                <Icon size={32} color="white" />
              </div>
              <div className="highlight-value">{stat.value}</div>
              <div className="highlight-label">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default HighlightsSection;
