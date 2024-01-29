import React, { useState, useEffect } from "react";

const NumberIncreaser = ({ targetValue, duration = 1000 }) => {
    const [currentValue, setCurrentValue] = useState(0);
  
    useEffect(() => {
      const startTime = Date.now();
      const endTime = startTime + duration;
  
      const increaseInterval = setInterval(() => {
        const timeElapsed = Date.now() - startTime;
        const progress = timeElapsed / duration;
  
        if (progress < 1) {
          const newValue = Math.floor(progress * targetValue);
          setCurrentValue(newValue);
        } else {
          clearInterval(increaseInterval);
          setCurrentValue(targetValue);
        }
      }, 16); // 60 frames per second
  
      // Cleanup function to clear the interval when the component unmounts
      return () => clearInterval(increaseInterval);
    }, [targetValue, duration]);
  
    return <div>{currentValue}</div>;
  };
  
  export default NumberIncreaser;
