import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { AppProvider } from './context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <div className="bg-gray-50 flex items-center justify-center font-sans w-full" style={{ minHeight: '100dvh' }}>
        <div
          className="w-full sm:max-w-[480px] bg-white relative shadow-2xl overflow-hidden [&>div]:h-full [&>div]:overflow-y-auto [&>div]:overflow-x-hidden"
          style={{ height: '100dvh' }}
        >
          <RouterProvider router={router} />
        </div>
      </div>
      <Toaster position="bottom-center" richColors expand={false} />
    </AppProvider>
  );
}