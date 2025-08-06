import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.width || '100%'};
  height: ${props => props.height || 'auto'};
  border-radius: ${props => props.borderRadius || '0'};
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: ${props => props.objectFit || 'cover'};
  transition: opacity 0.3s ease;
  opacity: ${props => props.loaded ? 1 : 0};
`;

const Placeholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.background || '#f8f9fa'};
  color: #666;
  font-size: ${props => props.placeholderSize || '24px'};
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #e9ecef;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 12px;
  text-align: center;
  padding: 10px;
`;

const LazyImage = ({
  src,
  alt = '',
  width,
  height,
  objectFit = 'cover',
  borderRadius,
  placeholder = '🖼️',
  placeholderBackground = '#f8f9fa',
  placeholderSize = '24px',
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  className,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  // Load image when in view
  useEffect(() => {
    if (inView && src && !loaded && !loading) {
      setLoading(true);
      setError(false);

      const img = new Image();
      
      img.onload = () => {
        setLoaded(true);
        setLoading(false);
        onLoad && onLoad();
      };

      img.onerror = () => {
        setError(true);
        setLoading(false);
        onError && onError();
      };

      img.src = src;
    }
  }, [inView, src, loaded, loading, onLoad, onError]);

  const handleImageLoad = () => {
    setLoaded(true);
    setLoading(false);
  };

  const handleImageError = () => {
    setError(true);
    setLoading(false);
  };

  return (
    <ImageContainer
      ref={containerRef}
      width={width}
      height={height}
      borderRadius={borderRadius}
      className={className}
      {...props}
    >
      {inView && src && (
        <Image
          ref={imgRef}
          src={src}
          alt={alt}
          objectFit={objectFit}
          loaded={loaded}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
      
      <Placeholder
        show={!loaded}
        background={placeholderBackground}
        placeholderSize={placeholderSize}
      >
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage>
            ❌<br />載入失敗
          </ErrorMessage>
        ) : (
          placeholder
        )}
      </Placeholder>
    </ImageContainer>
  );
};

export default LazyImage;