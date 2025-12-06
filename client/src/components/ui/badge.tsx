import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-blue-600 text-white',
    secondary: 'bg-gray-200 text-gray-900',
    destructive: 'bg-red-600 text-white',
    outline: 'border border-gray-300 bg-white text-gray-900',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-500 text-white',
  };

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '9999px',
        padding: '2px 10px',
        fontSize: '12px',
        fontWeight: '600',
        ...props.style,
      }}
      {...props}
    >
      <span className={variantStyles[variant]}>{children}</span>
    </div>
  );
};
