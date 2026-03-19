const Card = ({ children, className }) => (
  <div className={className}>{children}</div>
);

const CardContent = ({ children, className }) => (
  <div className={className}>{children}</div>
);

const Button = ({ children, ...props }) => (
  <button {...props} className="bg-purple-600 px-4 py-2 rounded w-full">
    {children}
  </button>
);

const Input = (props) => (
  <input {...props} className="p-2 rounded text-black w-full" />
);
