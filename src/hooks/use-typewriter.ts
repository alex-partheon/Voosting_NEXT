'use client';

import { useState, useEffect } from 'react';

interface UseTypewriterOptions {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  delayBetweenWords?: number;
  loop?: boolean;
}

export function useTypewriter({
  words,
  typeSpeed = 100,
  deleteSpeed = 50,
  delayBetweenWords = 2000,
  loop = true,
}: UseTypewriterOptions) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (words.length === 0) return;

    const currentWord = words[currentWordIndex];

    const timeout = setTimeout(() => {
      if (isWaiting) {
        setIsWaiting(false);
        setIsDeleting(true);
        return;
      }

      if (isDeleting) {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => {
            if (loop) {
              return (prev + 1) % words.length;
            } else {
              return Math.min(prev + 1, words.length - 1);
            }
          });
        }
      } else {
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.slice(0, currentText.length + 1));
        } else {
          if (loop || currentWordIndex < words.length - 1) {
            setIsWaiting(true);
          }
        }
      }
    }, isDeleting ? deleteSpeed : isWaiting ? delayBetweenWords : typeSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, isWaiting, currentWordIndex, words, typeSpeed, deleteSpeed, delayBetweenWords, loop]);

  return {
    text: currentText,
    isDeleting,
    currentWordIndex,
  };
}

export default useTypewriter;