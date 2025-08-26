
import { Link } from 'react-router-dom';

export const PageNotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 text-slate-800 font-sans">
      <h1 className="text-7xl font-extrabold mb-4 text-black">404</h1>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="mb-8 text-slate-500 text-center max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold text-lg shadow hover:bg-red-700 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
