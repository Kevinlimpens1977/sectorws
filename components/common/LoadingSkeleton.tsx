import React from 'react';

interface LoadingSkeletonProps {
    className?: string;
    count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className = '', count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`skeleton bg-slate-200 rounded ${className}`}
                ></div>
            ))}
        </>
    );
};

export default LoadingSkeleton;
