import React, { useState, useRef, useEffect } from 'react';

interface TouchOptimizedProps {
  children: React.ReactNode;
  className?: string;
  onTap?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
}

export const TouchOptimized: React.FC<TouchOptimizedProps> = ({
  children,
  className = '',
  onTap,
  onLongPress,
  disabled = false
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const touchStartTime = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    touchStartTime.current = Date.now();
    setIsPressed(true);
    
    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        setIsLongPressing(true);
        onLongPress();
      }, 500); // 500ms for long press
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled) return;
    
    const touchDuration = Date.now() - touchStartTime.current;
    setIsPressed(false);
    setIsLongPressing(false);
    
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Handle tap if it was short enough and not a long press
    if (onTap && touchDuration < 500 && !isLongPressing) {
      onTap();
    }
  };

  const handleTouchCancel = () => {
    setIsPressed(false);
    setIsLongPressing(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return (
    <div
      ref={elementRef}
      className={`
        transition-all duration-150 ease-in-out
        ${isPressed ? 'scale-95' : 'scale-100'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </div>
  );
};

interface SwipeableProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  className?: string;
}

export const Swipeable: React.FC<SwipeableProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className = ''
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const isLeftSwipe = deltaX > threshold;
    const isRightSwipe = deltaX < -threshold;
    const isUpSwipe = deltaY > threshold;
    const isDownSwipe = deltaY < -threshold;

    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();
    if (isUpSwipe && onSwipeUp) onSwipeUp();
    if (isDownSwipe && onSwipeDown) onSwipeDown();
  };

  return (
    <div
      className={`touch-pan-x touch-pan-y ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => void;
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  className = '',
  threshold = 80,
  disabled = false
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    startY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const currentY = e.targetTouches[0].clientY;
    const distance = currentY - startY.current;
    
    if (distance > 0 && window.scrollY === 0) {
      setIsPulling(true);
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = () => {
    if (disabled || isRefreshing) return;
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => {
        setIsRefreshing(false);
        setIsPulling(false);
        setPullDistance(0);
      }, 1000);
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {isPulling && (
        <div 
          className="absolute top-0 left-0 right-0 bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium"
          style={{ 
            height: `${Math.min(pullDistance, threshold * 1.5)}px`,
            transform: `translateY(-${Math.min(pullDistance, threshold * 1.5)}px)`
          }}
        >
          {pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      )}
      
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium h-16 -translate-y-16">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-2"></div>
          Refreshing...
        </div>
      )}
      
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isPulling ? `translateY(${Math.min(pullDistance, threshold * 1.5)}px)` : 'translateY(0)',
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};
