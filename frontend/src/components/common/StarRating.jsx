import { useState } from 'react';
import { FiStar } from 'react-icons/fi';

export default function StarRating({ value = 0, onChange, readOnly = false, size = 'md' }) {
  const [hover, setHover] = useState(0);
  const sizes = { sm: 'text-sm', md: 'text-xl', lg: 'text-2xl' };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`${sizes[size]} transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <FiStar
            className={`${
              star <= (hover || value)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
