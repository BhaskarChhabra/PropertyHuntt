import { useState, useEffect } from "react";
import "./slider.scss";

// Auto-slide interval in milliseconds (e.g., 4000ms = 4 seconds)
const AUTO_SLIDE_INTERVAL = 5000;

function Slider({ images }) {
  const [imageIndex, setImageIndex] = useState(null);
  // State to track which image is currently displayed in the main area (0 to images.length - 1)
  const [mainImageIndex, setMainImageIndex] = useState(0); 

  // 💡 FIX 1: Auto-slide logic (Unchanged)
  useEffect(() => {
    // If there is only one image or the fullscreen modal is open, stop auto-sliding.
    if (images.length <= 1 || imageIndex !== null) {
      return; 
    }

    const intervalId = setInterval(() => {
      // Rotate the main image index
      setMainImageIndex(prevIndex => 
        (prevIndex + 1) % images.length
      );
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [images.length, imageIndex]); 

  // FIX 2: Scroll lock logic (Unchanged)
  useEffect(() => {
    if (imageIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [imageIndex]); 

  // Logic for manual sliding in fullscreen view (Unchanged)
  const changeSlide = (direction) => {
    const currentImages = images;
    let newIndex = imageIndex;

    if (direction === "left") {
      newIndex = (imageIndex === 0) ? currentImages.length - 1 : imageIndex - 1;
    } else {
      newIndex = (imageIndex === currentImages.length - 1) ? 0 : imageIndex + 1;
    }
    setImageIndex(newIndex);
  };
  
  // 💡 NEW LOGIC: Manual sliding for the main display area
  const manualSlide = (direction, e) => {
    // Prevent the click from bubbling up and opening the fullscreen modal
    e.stopPropagation(); 
    
    setMainImageIndex(prevIndex => {
      let newIndex = prevIndex;
      if (direction === "left") {
        newIndex = (prevIndex === 0) ? images.length - 1 : prevIndex - 1;
      } else {
        newIndex = (prevIndex === images.length - 1) ? 0 : prevIndex + 1;
      }
      return newIndex;
    });
  };

  // Function to open the fullscreen modal, starting at the currently displayed main image
  const openFullscreen = () => {
      // Pass e.preventDefault() here if the full image also serves as a link sometimes
      setImageIndex(mainImageIndex);
  };


  return (
    <div className="slider">
      {/* Fullscreen Slider (Modal) Logic - Unchanged */}
      {imageIndex !== null && (
        <div className="fullSlider">
          <div className="arrow" onClick={() => changeSlide("left")}>
            <img src="/arrow.png" alt="Left Arrow" />
          </div>
          <div className="imgContainer">
            <img 
              src={images[imageIndex]} 
              alt={`Property Image ${imageIndex + 1}`} 
            />
          </div>
          <div className="arrow" onClick={() => changeSlide("right")}>
            <img src="/arrow.png" className="right" alt="Right Arrow" />
          </div>
          <div className="close" onClick={() => setImageIndex(null)}>
            X
          </div>
        </div>
      )}
      
      {/* 💡 UPDATED MAIN DISPLAY: Includes manual controls and handles auto-slide */}
      <div className="bigImage full-display">
        {/* Left Arrow for Manual Slide */}
        <div 
          className="main-arrow left-arrow" 
          onClick={(e) => manualSlide("left", e)}
        >
          <img src="/arrow.png" alt="Previous" />
        </div>
        
        {/* Main Image */}
        <img 
          src={images[mainImageIndex]} 
          alt={`Main Property Image ${mainImageIndex + 1}`} 
          onClick={openFullscreen} 
        />
        
        {/* Right Arrow for Manual Slide */}
        <div 
          className="main-arrow right-arrow" 
          onClick={(e) => manualSlide("right", e)}
        >
          <img src="/arrow.png" className="right" alt="Next" />
        </div>
      </div>
    </div>
  );
}

export default Slider;