// pages/screen-viewer.tsx
export default function ScreenViewer() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <img
        src="http://localhost:5000/screen"
        alt="Live Screen"
        className="max-w-full max-h-full"
      />
    </div>
  );
}
