import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

type Orientation = 'portrait' | 'landscape';

const useOrientation = (): Orientation => {
  const getOrientation = (): Orientation => {
    const { width, height } = Dimensions.get('window');
    return width > height ? 'landscape' : 'portrait';
  };

  const [orientation, setOrientation] = useState<Orientation>(getOrientation());

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(getOrientation());
    };

    // Listen to orientation changes
    const subscription = Dimensions.addEventListener('change', updateOrientation);

    return () => {
      // Clean up listener
      subscription.remove();
    };
  }, []);

  return orientation;
};

export default useOrientation;
