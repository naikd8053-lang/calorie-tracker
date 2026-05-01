import { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

export default function Confetti({ active, duration = 3000 }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (active) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration]);
  return show ? <ReactConfetti recycle={false} numberOfPieces={200} gravity={0.2} /> : null;
}