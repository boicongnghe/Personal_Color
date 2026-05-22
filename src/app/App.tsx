import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { AppProvider } from './context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans w-full">
        <div className="w-full h-full sm:h-screen bg-white relative shadow-2xl sm:max-w-[480px] overflow-hidden [&>div]:h-full [&>div]:overflow-y-auto [&>div]:overflow-x-hidden">
          <RouterProvider router={router} />
        </div>
      </div>
      <Toaster position="bottom-center" richColors expand={false} />
    </AppProvider>
  );
}